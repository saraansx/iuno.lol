
import crypto from "crypto";
import { PREMIUM_PLAN_TAG, type Currency } from "@/lib/payments/plans";

const PRODUCTION_API = "https://api.polar.sh";
const SANDBOX_API = "https://sandbox-api.polar.sh";

export function polarServer(): "production" | "sandbox" {
  return process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
}

function apiBase(): string {
  return polarServer() === "production" ? PRODUCTION_API : SANDBOX_API;
}

export function polarConfigured(): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN &&
      (process.env.POLAR_PRODUCT_ID || process.env.POLAR_PRODUCT_ID_INR),
  );
}

export function getPolarProductId(currency: Currency = "USD"): string {
  const id = currency === "INR" ? process.env.POLAR_PRODUCT_ID_INR : process.env.POLAR_PRODUCT_ID;
  if (!id) throw new Error(`POLAR product id for ${currency} is not set`);
  return id;
}

export function polarProductIds(): string[] {
  return [process.env.POLAR_PRODUCT_ID, process.env.POLAR_PRODUCT_ID_INR].filter(
    (v): v is string => Boolean(v),
  );
}

export interface PolarCheckout {
  id: string;
  url: string;
}

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
      metadata: { userId: String(params.userId), plan: PREMIUM_PLAN_TAG },
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

  for (const part of params.webhookSignature.split(" ")) {
    const sig = part.startsWith("v1,") ? part.slice(3) : part;
    const sigBuf = Buffer.from(sig);
    if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return true;
    }
  }
  return false;
}
