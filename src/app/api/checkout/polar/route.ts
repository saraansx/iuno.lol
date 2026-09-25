import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { createPolarCheckout, polarConfigured } from "@/lib/payments/polar";

// Creates a hosted Polar checkout session for the USD Premium (lifetime)
// purchase and returns its URL. Polar owns the price, so the browser never
// sends an amount — it just asks us to start a checkout, and the webhook
// (/api/webhooks/polar) grants Premium once the money actually lands.
export async function POST(request: NextRequest) {
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

  if (!polarConfigured()) {
    return NextResponse.json(
      { error: "Card payments aren't set up yet. Please try PayPal, or switch to INR." },
      { status: 503 },
    );
  }

  const origin = request.nextUrl.origin;
  try {
    const checkout = await createPolarCheckout({
      userId,
      successUrl: `${origin}/checkout?polar=success`,
      customerEmail: user.email ?? undefined,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout/polar] failed to create checkout:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
