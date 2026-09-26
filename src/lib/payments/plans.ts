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

export type Provider = "razorpay";

// Which payment gateway handles each currency, enforced server-side so it can't
// be bypassed from the browser. Both currencies go through Razorpay — INR uses
// the domestic checkout, USD uses Razorpay's international checkout (which
// surfaces card and, where activated on the account, PayPal itself). The "Card"
// option in the UI is handled separately by Polar's hosted checkout.
export const PROVIDER: Record<Currency, Provider> = {
  INR: "razorpay",
  USD: "razorpay",
};

// Payment methods offered per currency. For Razorpay (INR) this doubles as a
// server-side allow-list. USD opens Razorpay's international checkout, which
// surfaces card and PayPal itself, so there's no sub-method to pre-select.
//   INR  -> UPI / card / net banking (Razorpay)
//   USD  -> Razorpay international (card / PayPal)
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
