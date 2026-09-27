import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { getPlan, premiumFieldsForGrant, isCurrency, type Currency } from "@/lib/payments/plans";
import { fetchRazorpayOrder, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { processPaymentEventOnce } from "@/lib/payments/idempotency";
import { notifyPremiumPurchase } from "@/lib/notify/discord";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(256),
});

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = parsed.data;

  const validSignature = verifyRazorpaySignature({ orderId, paymentId, signature });
  if (!validSignature) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const order = await fetchRazorpayOrder(orderId);
  const plan = getPlan(order?.notes?.plan);
  if (
    !order ||
    order.notes?.userId !== String(userId) ||
    !plan
  ) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }
  const currency = order.currency;
  if (!isCurrency(currency) || order.amount !== plan.prices[currency as Currency].amount) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }
  if (order.status !== "paid") {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  try {
    const processed = await processPaymentEventOnce(
      { provider: "razorpay", eventId: paymentId, userId },
      async (tx) => {
        await tx.update(schema.users).set(premiumFieldsForGrant(plan.grant)).where(eq(schema.users.id, userId));
      },
    );

    if (!processed) {
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error("[checkout/verify] failed to upgrade user:", err);
    return NextResponse.json(
      { error: "Payment succeeded but we couldn't update your account. Contact support." },
      { status: 500 },
    );
  }

  try {
    const [row] = await db
      .select({ username: schema.users.username, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    await notifyPremiumPurchase({
      gateway: "razorpay",
      userId,
      username: row?.username,
      email: row?.email,
      amount: `${plan.prices[currency as Currency].symbol}${plan.prices[currency as Currency].display}`,
      currency,
    });
  } catch (err) {
    console.error("[checkout/verify] notify failed:", err);
  }

  return NextResponse.json({ success: true });
}
