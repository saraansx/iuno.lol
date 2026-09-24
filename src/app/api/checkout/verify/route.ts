import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { PREMIUM_PLAN, isCurrency, type Currency } from "@/lib/payments/plans";
import { fetchRazorpayOrder, verifyRazorpaySignature } from "@/lib/payments/razorpay";

// Confirms a Razorpay payment and upgrades the account to Premium. Security
// rests on the signature check (only Razorpay can produce a valid signature for
// an order+payment pair, so a valid one proves the payment succeeded). We then
// re-fetch the order to confirm it was created for THIS user and for a real
// plan amount before flipping is_premium.
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

  // Re-fetch the order and confirm it belongs to this user and matches a real
  // plan price — defence-in-depth against a signed triple from another order.
  const order = await fetchRazorpayOrder(orderId);
  if (!order || order.notes?.userId !== String(userId)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }
  const currency = order.currency;
  if (!isCurrency(currency) || order.amount !== PREMIUM_PLAN[currency as Currency].amount) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  try {
    // Lifetime plan: set the flag, leave premium_expires_at null (no expiry).
    await db
      .update(schema.users)
      .set({ isPremium: true })
      .where(eq(schema.users.id, userId));
  } catch (err) {
    console.error("[checkout/verify] failed to upgrade user:", err);
    return NextResponse.json(
      { error: "Payment succeeded but we couldn't update your account. Contact support." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
