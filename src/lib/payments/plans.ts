// Premium is a one-time "lifetime" purchase. Amounts are in the smallest
// currency unit (paise for INR, cents for USD) because that is exactly what the
// Razorpay Orders API expects. Keep this file the single source of truth so the
// client display and the server-created order can never drift apart — the
// server derives the charge from here and never trusts an amount sent by the
// browser.
export const PREMIUM_PLAN = {
  USD: { symbol: "$", display: "4.99", amount: 499, label: "USD $" },
  INR: { symbol: "₹", display: "449", amount: 44900, label: "INR ₹" },
} as const;

export type Currency = keyof typeof PREMIUM_PLAN;

export const CURRENCIES = Object.keys(PREMIUM_PLAN) as Currency[];

// Tebex is the single merchant-of-record for every purchase — it surfaces every
// payment method (cards, PayPal, UPI, net banking, wallets) and localizes the
// currency for the customer at checkout, so both display currencies map to the
// same gateway. Pricing is still derived server-side from PREMIUM_PLAN; the
// browser never dictates the amount.
export const PROVIDER = {
  INR: "tebex",
  USD: "tebex",
} as const satisfies Record<Currency, "tebex">;

export type Provider = (typeof PROVIDER)[Currency];

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && value in PREMIUM_PLAN;
}
