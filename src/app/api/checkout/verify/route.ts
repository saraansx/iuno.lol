import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { getSessionUserId } from "@/lib/auth/session";
import { fulfillRazorpayOrder } from "@/lib/payments/fulfill";
import { fetchRazorpayOrder, verifyRazorpaySignature } from "@/lib/payments/razorpay";

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
  if (!order || order.notes?.userId !== String(userId)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  try {
    if (!(await fulfillRazorpayOrder(order, paymentId))) {
      return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
    }
  } catch (err) {
    console.error("[checkout/verify] failed to upgrade user:", err);
    return NextResponse.json(
      { error: "Payment succeeded but we couldn't update your account. Contact support." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
