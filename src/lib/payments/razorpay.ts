// Server-only Razorpay helpers. This module reads RAZORPAY_KEY_SECRET, so it
// must never be imported into a client component — only into route handlers /
// server code. It talks to the Razorpay REST API directly (Basic auth) so we
// don't need to pull in the SDK, and verifies payment signatures with Node's
// crypto.
//
// Required environment variables (add these to your .env — they do not exist
// yet):
//   RAZORPAY_KEY_ID       e.g. rzp_live_xxx / rzp_test_xxx  (sent to the browser
//                         during checkout, so not secret, but kept server-side
//                         and handed to the client only via the order response)
//   RAZORPAY_KEY_SECRET   the API secret — NEVER expose this to the client
//
// Note on USD/PayPal: card + PayPal for USD require Razorpay International to be
// enabled on the account, and PayPal in particular is a separately-activated
// method that is region-gated. The checkout UI offers it; whether Razorpay
// actually shows it depends on the account configuration.
import crypto from "crypto";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function credentials() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  };
}

/** True only when both the key id and secret are configured. */
export function razorpayConfigured(): boolean {
  const { keyId, keySecret } = credentials();
  return Boolean(keyId && keySecret);
}

/** The public key id, safe to hand to the browser to open checkout. */
export function getRazorpayKeyId(): string {
  const { keyId } = credentials();
  if (!keyId) throw new Error("RAZORPAY_KEY_ID is not set");
  return keyId;
}

function authHeader(): string {
  const { keyId, keySecret } = credentials();
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader() },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
      payment_capture: 1,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Razorpay order create failed: ${res.status} ${text}`);
  }
  return (await res.json()) as RazorpayOrder;
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder | null> {
  const res = await fetch(`${RAZORPAY_API}/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as RazorpayOrder;
}

/**
 * Verify the checkout signature Razorpay returns after a successful payment.
 * The signature is HMAC-SHA256(order_id + "|" + payment_id) keyed with the API
 * secret — only Razorpay can produce it, so a valid signature is proof the
 * payment actually succeeded. Compared in constant time.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = credentials();
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(params.signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
