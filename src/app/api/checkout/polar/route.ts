import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { SITE_CONFIG } from "@/lib/config";
import { createPolarCheckout, polarConfigured } from "@/lib/payments/polar";
import { getClientIp } from "@/lib/server/security/ip";
import {
  IMAGE_HOST_PLAN_TAG,
  VERIFIED_PLAN_TAG,
  BADGE_TOKEN_PLAN_TAG,
  ALIAS_TOKEN_PLAN_TAG,
  PREMIUM,
  getPlan,
  isCurrency,
  ownsPlan,
  type Currency,
} from "@/lib/payments/plans";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const currency: Currency = isCurrency(body?.currency) ? body.currency : "USD";
  const plan = getPlan(body?.plan) ?? PREMIUM;

  if (ownsPlan(user, plan)) {
    return NextResponse.json({ error: `You already have ${plan.name}.` }, { status: 409 });
  }

  if (!polarConfigured(plan.tag)) {
    return NextResponse.json(
      { error: "Card payments aren't set up yet. Please try Razorpay, or switch to INR." },
      { status: 503 },
    );
  }

  const origin = SITE_CONFIG.url.replace(/\/$/, "");
  const checkoutPath =
    plan.tag === IMAGE_HOST_PLAN_TAG ? "/checkout/image-host"
    : plan.tag === VERIFIED_PLAN_TAG ? "/checkout/verified"
    : plan.tag === BADGE_TOKEN_PLAN_TAG ? "/checkout/badge-token"
    : plan.tag === ALIAS_TOKEN_PLAN_TAG ? "/checkout/alias-token"
    : "/checkout";
  try {
    const checkout = await createPolarCheckout({
      userId,
      successUrl: `${origin}${checkoutPath}?polar=success`,
      customerEmail: user.email ?? undefined,
      customerIp: getClientIp(request.headers) ?? undefined,
      currency,
      plan: plan.tag,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout/polar] failed to create checkout:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
