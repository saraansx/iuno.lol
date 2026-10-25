import crypto from "crypto";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function credentials() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  };
}

export function razorpayConfigured(): boolean {
  const { keyId, keySecret } = credentials();
  return Boolean(keyId && keySecret);
}

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
    signal: AbortSignal.timeout(30_000),
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
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return null;
  return (await res.json()) as RazorpayOrder;
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = credentials();
  if (!keySecret) return false;
  return hmacMatches(keySecret, `${params.orderId}|${params.paymentId}`, params.signature);
}

export function verifyRazorpayWebhook(body: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return hmacMatches(secret, body, signature);
}

function hmacMatches(secret: string, data: string, signature: string): boolean {
  const a = Buffer.from(crypto.createHmac("sha256", secret).update(data).digest("hex"));
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
