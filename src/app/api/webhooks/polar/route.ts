import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { PREMIUM_PLAN } from "@/lib/payments/plans";
import { verifyPolarWebhook, polarProductIds } from "@/lib/payments/polar";
import { processPaymentEventOnce } from "@/lib/payments/idempotency";
import { notifyPremiumPurchase } from "@/lib/notify/discord";


interface PolarOrderData {
  product_id?: string;
  metadata?: Record<string, unknown>;
  customer?: { external_id?: string | null } | null;
}

function userIdFrom(data: PolarOrderData): number | null {
  const raw =
    (data.metadata?.userId as string | undefined) ?? data.customer?.external_id ?? null;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const ok = verifyPolarWebhook({
    body,
    webhookId: request.headers.get("webhook-id"),
    webhookTimestamp: request.headers.get("webhook-timestamp"),
    webhookSignature: request.headers.get("webhook-signature"),
  });
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { type?: string; data?: PolarOrderData };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const data = event.data ?? {};

  const known = polarProductIds();
  if (known.length === 0) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  if (!data.product_id || !known.includes(data.product_id)) {
    return NextResponse.json({ received: true });
  }

  const userId = userIdFrom(data);

  const eventId = request.headers.get("webhook-id");
  if (!eventId) {
    return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  }

  try {
    if (event.type === "order.paid") {
      if (!userId) {
        console.error("[webhooks/polar] order.paid with no mappable user id");
        return NextResponse.json({ received: true });
      }
      const processed = await processPaymentEventOnce(
        { provider: "polar", eventId, userId },
        async (tx) => {
          await tx.update(schema.users).set({ isPremium: true }).where(eq(schema.users.id, userId));
        },
      );
      if (!processed) {
        return NextResponse.json({ received: true });
      }

      try {
        const [row] = await db
          .select({ username: schema.users.username, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .limit(1);
      const isInr = data.product_id === process.env.POLAR_PRODUCT_ID_INR;
      const plan = isInr ? PREMIUM_PLAN.INR : PREMIUM_PLAN.USD;
      await notifyPremiumPurchase({
          gateway: "polar",
          userId,
          username: row?.username,
          email: row?.email,
          amount: `${plan.symbol}${plan.display}`,
          currency: isInr ? "INR" : "USD",
        });
      } catch (err) {
        console.error("[webhooks/polar] notify failed:", err);
      }
    } else if (event.type === "order.refunded") {
      if (userId) {
        await processPaymentEventOnce(
          { provider: "polar", eventId, userId },
          async (tx) => {
            await tx.update(schema.users).set({ isPremium: false }).where(eq(schema.users.id, userId));
          },
        );
      }
    }
  } catch (err) {
    console.error("[webhooks/polar] failed to process event:", err);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
