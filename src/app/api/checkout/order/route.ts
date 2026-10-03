import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { PREMIUM_PLAN_TAG, IMAGE_HOST_PLAN_TAG, VERIFIED_PLAN_TAG, BADGE_TOKEN_PLAN_TAG, ALIAS_TOKEN_PLAN_TAG, PLAN_TAGS, PROVIDER, getPlan, isAllowedMethod, ownsPlan, type Currency } from "@/lib/payments/plans";
import { createRazorpayOrder, getRazorpayKeyId, razorpayConfigured } from "@/lib/payments/razorpay";
import { getClientIp } from "@/lib/server/security/ip";
import { checkoutOrderRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  currency: z.enum(["USD", "INR"]),
  method: z.string().max(32).optional(),
  plan: z.enum(PLAN_TAGS).default(PREMIUM_PLAN_TAG),
});

const RECEIPT_PREFIX = {
  [PREMIUM_PLAN_TAG]: "prem",
  [IMAGE_HOST_PLAN_TAG]: "ih",
  [VERIFIED_PLAN_TAG]: "ver",
  [BADGE_TOKEN_PLAN_TAG]: "bt",
  [ALIAS_TOKEN_PLAN_TAG]: "at",
} as const;

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const rate = await checkoutOrderRateLimit(userId, getClientIp(request.headers));
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
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
  const plan = getPlan(parsed.data.plan)!;
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
  if (ownsPlan(user, plan)) {
    return NextResponse.json({ error: `You already have ${plan.name}.` }, { status: 409 });
  }

  if (!razorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments aren't set up yet. Please try again later." },
      { status: 503 },
    );
  }

  const price = plan.prices[currency];
  try {
    const order = await createRazorpayOrder({
      amount: price.amount,
      currency,
      receipt: `iuno_${RECEIPT_PREFIX[plan.tag]}_${userId}_${Date.now()}`,
      notes: {
        userId: String(userId),
        plan: plan.tag,
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
