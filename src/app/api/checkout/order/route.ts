import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { PREMIUM_PLAN, PROVIDER, isAllowedMethod, type Currency } from "@/lib/payments/plans";
import { createRazorpayOrder, getRazorpayKeyId, razorpayConfigured } from "@/lib/payments/razorpay";

// Creates a Razorpay order for the Premium (lifetime) purchase. The amount is
// always derived server-side from PREMIUM_PLAN — the client only tells us which
// currency it wants, never the price.
const bodySchema = z.object({
  currency: z.enum(["USD", "INR"]),
  method: z.string().max(32).optional(),
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
  const currency = parsed.data.currency as Currency;
  const { method } = parsed.data;
  // This route is Razorpay-only. USD is charged through PayPal
  // (/api/checkout/paypal/*), so reject any currency that isn't Razorpay's.
  if (PROVIDER[currency] !== "razorpay") {
    return NextResponse.json({ error: "Unsupported currency for this gateway." }, { status: 400 });
  }
  if (method && !isAllowedMethod(currency, method)) {
    return NextResponse.json({ error: "Unsupported payment method." }, { status: 400 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }
  if (user.isPremium) {
    return NextResponse.json({ error: "You already have Premium." }, { status: 409 });
  }

  if (!razorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't set up yet. Please try again later." },
      { status: 503 },
    );
  }

  const plan = PREMIUM_PLAN[currency];
  try {
    const order = await createRazorpayOrder({
      amount: plan.amount,
      currency,
      receipt: `iuno_prem_${userId}_${Date.now()}`,
      notes: {
        userId: String(userId),
        plan: "premium_lifetime",
        method: method ?? "",
      },
    });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
    });
  } catch (err) {
    console.error("[checkout/order] failed to create order:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
