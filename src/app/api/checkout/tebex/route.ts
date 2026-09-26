import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { SITE_CONFIG } from "@/lib/config";
import { PREMIUM_PLAN } from "@/lib/payments/plans";
import { createTebexCheckout, tebexConfigured } from "@/lib/payments/tebex";

// Creates a Tebex checkout basket for the signed-in user and returns its
// `ident`, which the browser hands to Tebex.js to open the embedded checkout.
// The userId is stashed in the basket's `custom` field so the Tebex webhook —
// the sole source of truth — knows which account to upgrade. The browser is
// never trusted to flip is_premium.
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

  if (!tebexConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't set up yet. Please try again later." },
      { status: 503 },
    );
  }

  // Price is derived server-side from PREMIUM_PLAN (never from the request body).
  // Tebex bills in the project currency (USD) and localizes the display currency
  // for the customer at checkout.
  const price = Number(PREMIUM_PLAN.USD.display);
  const origin = SITE_CONFIG.url.replace(/\/$/, "");

  try {
    const checkout = await createTebexCheckout({
      name: "iuno.lol Premium",
      price,
      email: user.email ?? undefined,
      returnUrl: `${origin}/checkout`,
      completeUrl: `${origin}/checkout?tebex=success`,
      custom: { userId: String(userId) },
    });
    return NextResponse.json({ ident: checkout.ident, url: checkout.checkoutUrl });
  } catch (err) {
    console.error("[checkout/tebex] failed to create checkout:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
