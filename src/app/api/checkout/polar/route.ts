import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { SITE_CONFIG } from "@/lib/config";
import { createPolarCheckout, polarConfigured } from "@/lib/payments/polar";

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

  if (!polarConfigured()) {
    return NextResponse.json(
      { error: "Card payments aren't set up yet. Please try PayPal, or switch to INR." },
      { status: 503 },
    );
  }

  const origin = SITE_CONFIG.url.replace(/\/$/, "");
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
