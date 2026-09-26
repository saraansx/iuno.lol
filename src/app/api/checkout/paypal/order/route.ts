import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { PREMIUM_PLAN } from "@/lib/payments/plans";
import { createPaypalOrder, paypalConfigured } from "@/lib/payments/paypal";

// Creates a PayPal order for the USD Premium purchase. The amount is always
// derived server-side from PREMIUM_PLAN.USD — the client never sends a price.
// (INR goes through Razorpay at /api/checkout/order instead.)
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }
  if (user.isPremium) {
    return NextResponse.json({ error: "You already have Premium." }, { status: 409 });
  }

  if (!paypalConfigured()) {
    return NextResponse.json(
      { error: "PayPal isn't set up yet. Please try again later." },
      { status: 503 },
    );
  }

  // PayPal amounts are decimal strings; PREMIUM_PLAN stores cents.
  const amountValue = (PREMIUM_PLAN.USD.amount / 100).toFixed(2);
  try {
    const order = await createPaypalOrder({
      amountValue,
      currency: "USD",
      customId: String(userId),
      description: "iuno.lol Premium — lifetime access",
    });
    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("[checkout/paypal/order] failed to create order:", err);
    return NextResponse.json(
      { error: "Could not start PayPal checkout. Please try again." },
      { status: 502 },
    );
  }
}
