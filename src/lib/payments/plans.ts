export const PREMIUM_PLAN = {
  USD: { symbol: "$", display: "4.99", amount: 499, label: "USD $" },
  INR: { symbol: "₹", display: "449", amount: 44900, label: "INR ₹" },
} as const;

export const PREMIUM_PLAN_TAG = "premium_lifetime";

export type Currency = keyof typeof PREMIUM_PLAN;

export const CURRENCIES = Object.keys(PREMIUM_PLAN) as Currency[];

export type PlanGrant = { kind: "lifetime" } | { kind: "duration"; days: number };

export interface Plan {
  tag: string;
  name: string;
  prices: Record<Currency, { symbol: string; display: string; amount: number }>;
  grant: PlanGrant;
}

export const PREMIUM: Plan = {
  tag: PREMIUM_PLAN_TAG,
  name: "Premium",
  prices: PREMIUM_PLAN,
  grant: { kind: "lifetime" },
};

export const PLANS: Record<string, Plan> = {
  [PREMIUM_PLAN_TAG]: PREMIUM,
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

export type Provider = "razorpay";

export const PROVIDER: Record<Currency, Provider> = {
  INR: "razorpay",
  USD: "razorpay",
};

export const PAYMENT_METHODS = {
  INR: ["upi", "card", "netbanking"],
  USD: [],
} as const satisfies Record<Currency, readonly string[]>;

export type PaymentMethod = (typeof PAYMENT_METHODS)[Currency][number];

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && value in PREMIUM_PLAN;
}

export function isAllowedMethod(currency: Currency, method: string): boolean {
  return (PAYMENT_METHODS[currency] as readonly string[]).includes(method);
}
