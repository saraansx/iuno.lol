import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { SITE_CONFIG } from "@/lib/config";
import { createPolarCheckout, polarConfigured } from "@/lib/payments/polar";
import { getClientIp } from "@/lib/server/security/ip";
import { isCurrency, type Currency } from "@/lib/payments/plans";

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
      { error: "Card payments aren't set up yet. Please try Razorpay, or switch to INR." },
      { status: 503 },
    );
  }

  // Currency picks the Polar product (USD vs INR). Never trust it for pricing —
  // Polar owns the amount — it only selects which product's checkout to open.
  const body = await request.json().catch(() => null);
  const currency: Currency = isCurrency(body?.currency) ? body.currency : "USD";

  const origin = SITE_CONFIG.url.replace(/\/$/, "");
  try {
    const checkout = await createPolarCheckout({
      userId,
      successUrl: `${origin}/checkout?polar=success`,
      customerEmail: user.email ?? undefined,
      customerIp: getClientIp(request.headers) ?? undefined,
      currency,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout/polar] failed to create checkout:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
