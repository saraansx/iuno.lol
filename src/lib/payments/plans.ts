export const PREMIUM_PLAN = {
  USD: { symbol: "$", display: "4.99", amount: 499, label: "USD $" },
  INR: { symbol: "₹", display: "449", amount: 44900, label: "INR ₹" },
} as const;

export type Currency = keyof typeof PREMIUM_PLAN;

export const CURRENCIES = Object.keys(PREMIUM_PLAN) as Currency[];

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
