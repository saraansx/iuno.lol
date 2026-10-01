import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fieldsForPlan, revokeFieldsForPlan } from "@/lib/payments/plans";
import { verifyPolarWebhook, polarProduct } from "@/lib/payments/polar";
import { processPaymentEventOnce } from "@/lib/payments/idempotency";
import { grantPlanPerks } from "@/lib/payments/fulfill";
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

  // The product id tells us which plan (Premium / Image Host) was bought
  const product = polarProduct(data.product_id);
  if (!product) {
    return NextResponse.json({ received: true });
  }
  const { plan, currency } = product;

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
          await tx.update(schema.users).set(fieldsForPlan(plan)).where(eq(schema.users.id, userId));
        },
      );
      if (!processed) {
        return NextResponse.json({ received: true });
      }
      await grantPlanPerks(userId, plan);

      try {
        const [row] = await db
          .select({ username: schema.users.username, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .limit(1);
        const price = plan.prices[currency];
        await notifyPremiumPurchase({
          gateway: "polar",
          product: plan.name,
          userId,
          username: row?.username,
          email: row?.email,
          amount: `${price.symbol}${price.display}`,
          currency,
        });
      } catch (err) {
        console.error("[webhooks/polar] notify failed:", err);
      }
    } else if (event.type === "order.refunded") {
      if (userId) {
        await processPaymentEventOnce(
          { provider: "polar", eventId, userId },
          async (tx) => {
            await tx.update(schema.users).set(revokeFieldsForPlan(plan)).where(eq(schema.users.id, userId));
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
