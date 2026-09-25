import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { PREMIUM_PLAN } from "@/lib/payments/plans";
import { getPolarProductId, verifyPolarWebhook } from "@/lib/payments/polar";
import { notifyPremiumPurchase } from "@/lib/notify/discord";

// Polar webhook handler. Polar POSTs here on order events; we verify the
// Standard-Webhooks signature before trusting anything, then on `order.paid`
// grant Premium to the mapped user (and on `order.refunded` revoke it). This is
// the source of truth for Polar (card) purchases — the browser is never trusted
// to flip is_premium.

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

  // Only act on our Premium product — ignore anything else that might arrive.
  let expectedProduct: string;
  try {
    expectedProduct = getPolarProductId();
  } catch {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }
  if (data.product_id && data.product_id !== expectedProduct) {
    return NextResponse.json({ received: true });
  }

  const userId = userIdFrom(data);

  try {
    if (event.type === "order.paid") {
      if (!userId) {
        console.error("[webhooks/polar] order.paid with no mappable user id");
        return NextResponse.json({ received: true });
      }
      // Lifetime plan: set the flag, leave premium_expires_at null (no expiry).
      await db.update(schema.users).set({ isPremium: true }).where(eq(schema.users.id, userId));

      // Best-effort Discord notification — never blocks or fails the upgrade.
      try {
        const [row] = await db
          .select({ username: schema.users.username, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .limit(1);
        await notifyPremiumPurchase({
          gateway: "polar",
          userId,
          username: row?.username,
          email: row?.email,
          amount: `${PREMIUM_PLAN.USD.symbol}${PREMIUM_PLAN.USD.display}`,
          currency: "USD",
        });
      } catch (err) {
        console.error("[webhooks/polar] notify failed:", err);
      }
    } else if (event.type === "order.refunded") {
      if (userId) {
        await db.update(schema.users).set({ isPremium: false }).where(eq(schema.users.id, userId));
      }
    }
  } catch (err) {
    console.error("[webhooks/polar] failed to process event:", err);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
