// Server-only Polar helpers. This module reads POLAR_ACCESS_TOKEN and
// POLAR_WEBHOOK_SECRET, so it must never be imported into a client component —
// only into route handlers / server code. It talks to the Polar REST API
// directly (no SDK): create a hosted checkout session for the Premium product,
// then verify the incoming webhook signature server-side before granting
// Premium.
//
// Card payments for USD Premium are charged through Polar (hosted checkout);
// PayPal still handles the PayPal button, and INR goes through Razorpay.
//
// Required environment variables:
//   POLAR_ACCESS_TOKEN    Organization Access Token (polar_oat_...). Secret —
//                         NEVER expose this to the client.
//   POLAR_WEBHOOK_SECRET  Webhook signing secret (whsec_...). Used to verify
//                         that incoming webhooks really came from Polar.
//   POLAR_PRODUCT_ID      The Premium product id (prod_...). The checkout is
//                         created against this, and the webhook confirms the
//                         paid order was for this exact product.
//   POLAR_SERVER          "production" for live; anything else uses sandbox.

import crypto from "crypto";
import type { Currency } from "@/lib/payments/plans";

const PRODUCTION_API = "https://api.polar.sh";
const SANDBOX_API = "https://sandbox-api.polar.sh";

/** "production" only in live Polar; everything else is sandbox. */
export function polarServer(): "production" | "sandbox" {
  return process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
}

function apiBase(): string {
  return polarServer() === "production" ? PRODUCTION_API : SANDBOX_API;
}

/** True only when the access token and at least one product id are configured. */
export function polarConfigured(): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN &&
      (process.env.POLAR_PRODUCT_ID || process.env.POLAR_PRODUCT_ID_INR),
  );
}

/**
 * The Premium product id for a currency. USD uses POLAR_PRODUCT_ID; INR uses
 * POLAR_PRODUCT_ID_INR (a separate Polar product priced in ₹). Throws when the
 * product for that currency isn't configured.
 */
export function getPolarProductId(currency: Currency = "USD"): string {
  const id = currency === "INR" ? process.env.POLAR_PRODUCT_ID_INR : process.env.POLAR_PRODUCT_ID;
  if (!id) throw new Error(`POLAR product id for ${currency} is not set`);
  return id;
}

/** Every configured Polar product id — used by the webhook to accept an order. */
export function polarProductIds(): string[] {
  return [process.env.POLAR_PRODUCT_ID, process.env.POLAR_PRODUCT_ID_INR].filter(
    (v): v is string => Boolean(v),
  );
}

export interface PolarCheckout {
  id: string;
  url: string;
}

/**
 * Create a hosted Polar checkout session for the Premium purchase. We stamp our
 * user id into metadata (and external_customer_id) so the webhook can map the
 * paid order back to the right account. Polar owns the price — we never send an
 * amount, so the browser can't tamper with it.
 */
export async function createPolarCheckout(params: {
  userId: number | string;
  successUrl: string;
  customerEmail?: string;
  customerIp?: string;
  currency?: Currency;
}): Promise<PolarCheckout> {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error("Polar is not configured");

  const res = await fetch(`${apiBase()}/v1/checkouts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      products: [getPolarProductId(params.currency ?? "USD")],
      success_url: params.successUrl,
      external_customer_id: String(params.userId),
      ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
      ...(params.customerIp ? { customer_ip_address: params.customerIp } : {}),
      metadata: { userId: String(params.userId), plan: "premium_lifetime" },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Polar create checkout failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id?: string; url?: string };
  if (!data.id || !data.url) throw new Error("Polar checkout missing id/url in response");
  return { id: data.id, url: data.url };
}

/**
 * Verify a Polar webhook using the Standard Webhooks scheme (the format Polar
 * emits): HMAC-SHA256 over `${id}.${timestamp}.${body}`, keyed by the
 * base64-decoded signing secret, compared constant-time against every `v1,`
 * signature in the `webhook-signature` header. Returns true only on a match.
 */
export function verifyPolarWebhook(params: {
  body: string;
  webhookId: string | null;
  webhookTimestamp: string | null;
  webhookSignature: string | null;
}): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret || !params.webhookId || !params.webhookTimestamp || !params.webhookSignature) {
    return false;
  }

  // Standard Webhooks secrets are `whsec_<base64>`; the key is the decoded bytes.
  const raw = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  let key: Buffer;
  try {
    key = Buffer.from(raw, "base64");
  } catch {
    return false;
  }

  const signedContent = `${params.webhookId}.${params.webhookTimestamp}.${params.body}`;
  const expected = crypto.createHmac("sha256", key).update(signedContent).digest("base64");
  const expectedBuf = Buffer.from(expected);

  // Header holds one or more space-separated `v1,<signature>` entries.
  for (const part of params.webhookSignature.split(" ")) {
    const sig = part.startsWith("v1,") ? part.slice(3) : part;
    const sigBuf = Buffer.from(sig);
    if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return true;
    }
  }
  return false;
}
