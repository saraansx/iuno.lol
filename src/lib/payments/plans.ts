export const PREMIUM_PLAN = {
  USD: { symbol: "$", display: "4.99", amount: 499, label: "USD $" },
  INR: { symbol: "₹", display: "449", amount: 44900, label: "INR ₹" },
} as const;

export const IMAGE_HOST_PLAN = {
  USD: { symbol: "$", display: "2.99", amount: 299, label: "USD $" },
  // TODO: testing price, restore to display "249" / amount 24900 before launch
  INR: { symbol: "₹", display: "1", amount: 100, label: "INR ₹" },
} as const;

export const PREMIUM_PLAN_TAG = "premium_lifetime";
export const IMAGE_HOST_PLAN_TAG = "image_host_lifetime";

export type Currency = keyof typeof PREMIUM_PLAN;
export type PlanTag = typeof PREMIUM_PLAN_TAG | typeof IMAGE_HOST_PLAN_TAG;

export const CURRENCIES = Object.keys(PREMIUM_PLAN) as Currency[];

type PlanGrant = { kind: "lifetime" } | { kind: "duration"; days: number };

export interface Plan {
  tag: PlanTag;
  name: string;
  prices: Record<Currency, { symbol: string; display: string; amount: number }>;
  grant: PlanGrant;
  // Badge (and its mapped Discord role) that comes with the purchase
  badgeId: string;
}

export const PREMIUM: Plan = {
  tag: PREMIUM_PLAN_TAG,
  name: "Premium",
  prices: PREMIUM_PLAN,
  grant: { kind: "lifetime" },
  badgeId: "premium",
};

export const IMAGE_HOST: Plan = {
  tag: IMAGE_HOST_PLAN_TAG,
  name: "Image Host",
  prices: IMAGE_HOST_PLAN,
  grant: { kind: "lifetime" },
  badgeId: "image-host",
};

const PLANS: Record<string, Plan> = {
  [PREMIUM_PLAN_TAG]: PREMIUM,
  [IMAGE_HOST_PLAN_TAG]: IMAGE_HOST,
};

export function getPlan(tag: string | null | undefined): Plan | null {
  if (!tag) return null;
  return PLANS[tag] ?? null;
}

export function premiumFieldsForGrant(
  grant: PlanGrant,
): { isPremium: true; premiumExpiresAt: Date | null } {
  if (grant.kind === "duration") {
    return { isPremium: true, premiumExpiresAt: new Date(Date.now() + grant.days * 86_400_000) };
  }
  return { isPremium: true, premiumExpiresAt: null };
}

// users-table fields a paid plan sets
export function fieldsForPlan(plan: Plan) {
  return plan.tag === IMAGE_HOST_PLAN_TAG ? { hasImageHost: true } : premiumFieldsForGrant(plan.grant);
}

// users-table fields a refund clears
export function revokeFieldsForPlan(plan: Plan) {
  return plan.tag === IMAGE_HOST_PLAN_TAG ? { hasImageHost: false } : { isPremium: false };
}

export function ownsPlan(
  user: { isPremium?: boolean | null; hasImageHost?: boolean | null },
  plan: Plan,
): boolean {
  return plan.tag === IMAGE_HOST_PLAN_TAG ? Boolean(user.hasImageHost) : Boolean(user.isPremium);
}

export type Provider = "razorpay";

export const PROVIDER: Record<Currency, Provider> = {
  INR: "razorpay",
  USD: "razorpay",
};

const PAYMENT_METHODS = {
  INR: ["upi", "card", "netbanking"],
  USD: [],
} as const satisfies Record<Currency, readonly string[]>;

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && value in PREMIUM_PLAN;
}

export function isAllowedMethod(currency: Currency, method: string): boolean {
  return (PAYMENT_METHODS[currency] as readonly string[]).includes(method);
}
