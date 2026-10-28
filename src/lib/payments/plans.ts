import { sql } from "drizzle-orm";

export const PREMIUM_PLAN = {
  USD: { symbol: "$", display: "4.99", amount: 499, label: "USD $" },
  INR: { symbol: "₹", display: "449", amount: 44900, label: "INR ₹" },
} as const;

export const IMAGE_HOST_PLAN = {
  USD: { symbol: "$", display: "2.99", amount: 299, label: "USD $" },
  INR: { symbol: "₹", display: "249", amount: 24900, label: "INR ₹" },
} as const;

export const VERIFIED_PLAN = {
  USD: { symbol: "$", display: "8.99", amount: 899, label: "USD $" },
  INR: { symbol: "₹", display: "849", amount: 84900, label: "INR ₹" },
} as const;

export const DONATOR_PLAN = {
  USD: { symbol: "$", display: "3.99", amount: 399, label: "USD $" },
  INR: { symbol: "₹", display: "349", amount: 34900, label: "INR ₹" },
} as const;

export const BADGE_TOKEN_PLAN = {
  USD: { symbol: "$", display: "1.99", amount: 199, label: "USD $" },
  INR: { symbol: "₹", display: "149", amount: 14900, label: "INR ₹" },
} as const;

export const ALIAS_TOKEN_PLAN = {
  USD: { symbol: "$", display: "1.29", amount: 129, label: "USD $" },
  INR: { symbol: "₹", display: "120", amount: 12000, label: "INR ₹" },
} as const;

export const DOMAIN_TOKEN_PLAN = {
  USD: { symbol: "$", display: "0.99", amount: 99, label: "USD $" },
  INR: { symbol: "₹", display: "90", amount: 9000, label: "INR ₹" },
} as const;

export const PREMIUM_PLAN_TAG = "premium_lifetime";
export const IMAGE_HOST_PLAN_TAG = "image_host_lifetime";
export const VERIFIED_PLAN_TAG = "verified_lifetime";
export const DONATOR_PLAN_TAG = "donator_lifetime";
export const BADGE_TOKEN_PLAN_TAG = "badge_token";
export const ALIAS_TOKEN_PLAN_TAG = "alias_token";
export const DOMAIN_TOKEN_PLAN_TAG = "domain_token";

export const PREMIUM_ALIAS_SLOTS_PER_TOKEN = 4;

export function aliasSlots(tokens: number, premium: boolean): number {
  return tokens * (premium ? PREMIUM_ALIAS_SLOTS_PER_TOKEN : 1);
}

export type Currency = keyof typeof PREMIUM_PLAN;
export const PLAN_TAGS = [PREMIUM_PLAN_TAG, IMAGE_HOST_PLAN_TAG, VERIFIED_PLAN_TAG, DONATOR_PLAN_TAG, BADGE_TOKEN_PLAN_TAG, ALIAS_TOKEN_PLAN_TAG, DOMAIN_TOKEN_PLAN_TAG] as const;
export type PlanTag = (typeof PLAN_TAGS)[number];

export const CURRENCIES = Object.keys(PREMIUM_PLAN) as Currency[];

export interface Plan {
  tag: PlanTag;
  name: string;
  prices: Record<Currency, { symbol: string; display: string; amount: number }>;
  badgeId?: string;
}

export const PREMIUM: Plan = {
  tag: PREMIUM_PLAN_TAG,
  name: "Premium",
  prices: PREMIUM_PLAN,
  badgeId: "premium",
};

export const IMAGE_HOST: Plan = {
  tag: IMAGE_HOST_PLAN_TAG,
  name: "Image Host",
  prices: IMAGE_HOST_PLAN,
  badgeId: "image-host",
};

export const VERIFIED: Plan = {
  tag: VERIFIED_PLAN_TAG,
  name: "Verified",
  prices: VERIFIED_PLAN,
  badgeId: "verified",
};

export const DONATOR: Plan = {
  tag: DONATOR_PLAN_TAG,
  name: "Donator",
  prices: DONATOR_PLAN,
  badgeId: "donator",
};

export const BADGE_TOKEN: Plan = {
  tag: BADGE_TOKEN_PLAN_TAG,
  name: "Badge Token",
  prices: BADGE_TOKEN_PLAN,
};

export const ALIAS_TOKEN: Plan = {
  tag: ALIAS_TOKEN_PLAN_TAG,
  name: "Alias Token",
  prices: ALIAS_TOKEN_PLAN,
};

export const DOMAIN_TOKEN: Plan = {
  tag: DOMAIN_TOKEN_PLAN_TAG,
  name: "Domain Token",
  prices: DOMAIN_TOKEN_PLAN,
};

const PLANS: Record<string, Plan> = {
  [PREMIUM_PLAN_TAG]: PREMIUM,
  [IMAGE_HOST_PLAN_TAG]: IMAGE_HOST,
  [VERIFIED_PLAN_TAG]: VERIFIED,
  [DONATOR_PLAN_TAG]: DONATOR,
  [BADGE_TOKEN_PLAN_TAG]: BADGE_TOKEN,
  [ALIAS_TOKEN_PLAN_TAG]: ALIAS_TOKEN,
  [DOMAIN_TOKEN_PLAN_TAG]: DOMAIN_TOKEN,
};

export function getPlan(tag: string | null | undefined): Plan | null {
  if (!tag) return null;
  return PLANS[tag] ?? null;
}

export function fieldsForPlan(plan: Plan) {
  if (plan.tag === IMAGE_HOST_PLAN_TAG) return { hasImageHost: true };
  if (plan.tag === VERIFIED_PLAN_TAG) return { hasVerified: true };
  if (plan.tag === DONATOR_PLAN_TAG) return { hasDonator: true };
  if (plan.tag === BADGE_TOKEN_PLAN_TAG) return { badgeTokens: sql`badge_tokens + 1` };
  if (plan.tag === ALIAS_TOKEN_PLAN_TAG) return { aliasTokens: sql`alias_tokens + 1` };
  if (plan.tag === DOMAIN_TOKEN_PLAN_TAG) return { domainTokens: sql`domain_tokens + 1` };
  return { isPremium: true };
}

export function revokeFieldsForPlan(plan: Plan) {
  if (plan.tag === IMAGE_HOST_PLAN_TAG) return { hasImageHost: false };
  if (plan.tag === VERIFIED_PLAN_TAG) return { hasVerified: false };
  if (plan.tag === DONATOR_PLAN_TAG) return { hasDonator: false };
  if (plan.tag === BADGE_TOKEN_PLAN_TAG) return { badgeTokens: sql`GREATEST(badge_tokens - 1, 0)` };
  if (plan.tag === ALIAS_TOKEN_PLAN_TAG) return { aliasTokens: sql`GREATEST(alias_tokens - 1, 0)` };
  if (plan.tag === DOMAIN_TOKEN_PLAN_TAG) return { domainTokens: sql`GREATEST(domain_tokens - 1, 0)` };
  return { isPremium: false };
}

export function ownsPlan(
  user: { isPremium?: boolean | null; hasImageHost?: boolean | null; hasVerified?: boolean | null; hasDonator?: boolean | null },
  plan: Plan,
): boolean {
  if (plan.tag === IMAGE_HOST_PLAN_TAG) return Boolean(user.hasImageHost);
  if (plan.tag === VERIFIED_PLAN_TAG) return Boolean(user.hasVerified);
  if (plan.tag === DONATOR_PLAN_TAG) return Boolean(user.hasDonator);
  if (plan.tag === BADGE_TOKEN_PLAN_TAG || plan.tag === ALIAS_TOKEN_PLAN_TAG || plan.tag === DOMAIN_TOKEN_PLAN_TAG) return false;
  return Boolean(user.isPremium);
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
