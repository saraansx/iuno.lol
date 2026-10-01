
import crypto from "crypto";
import {
  PREMIUM_PLAN_TAG,
  IMAGE_HOST_PLAN_TAG,
  VERIFIED_PLAN_TAG,
  BADGE_TOKEN_PLAN_TAG,
  PLAN_TAGS,
  getPlan,
  type Currency,
  type Plan,
  type PlanTag,
} from "@/lib/payments/plans";

function productEnv(tag: PlanTag): Record<Currency, string | undefined> {
  if (tag === IMAGE_HOST_PLAN_TAG) {
    return {
      USD: process.env.POLAR_IMAGE_HOST_PRODUCT_ID,
      INR: process.env.POLAR_IMAGE_HOST_PRODUCT_ID_INR,
    };
  }
  if (tag === VERIFIED_PLAN_TAG) {
    return {
      USD: process.env.POLAR_VERIFIED_PRODUCT_ID,
      INR: process.env.POLAR_VERIFIED_PRODUCT_ID_INR,
    };
  }
  if (tag === BADGE_TOKEN_PLAN_TAG) {
    return {
      USD: process.env.POLAR_BADGE_TOKEN_PRODUCT_ID,
      INR: process.env.POLAR_BADGE_TOKEN_PRODUCT_ID_INR,
    };
  }
  return { USD: process.env.POLAR_PRODUCT_ID, INR: process.env.POLAR_PRODUCT_ID_INR };
}

export function polarProduct(productId: string | undefined): { plan: Plan; currency: Currency } | null {
  if (!productId) return null;
  for (const tag of PLAN_TAGS) {
    const ids = productEnv(tag);
    for (const currency of ["USD", "INR"] as const) {
      if (ids[currency] === productId) return { plan: getPlan(tag)!, currency };
    }
  }
  return null;
}

const PRODUCTION_API = "https://api.polar.sh";
const SANDBOX_API = "https://sandbox-api.polar.sh";

function polarServer(): "production" | "sandbox" {
  return process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
}

function apiBase(): string {
  return polarServer() === "production" ? PRODUCTION_API : SANDBOX_API;
}

export function polarConfigured(tag: PlanTag = PREMIUM_PLAN_TAG): boolean {
  const ids = productEnv(tag);
  return Boolean(process.env.POLAR_ACCESS_TOKEN && (ids.USD || ids.INR));
}

function getPolarProductId(tag: PlanTag, currency: Currency): string {
  const id = productEnv(tag)[currency];
  if (!id) throw new Error(`Polar product id for ${tag} ${currency} is not set`);
  return id;
}

export function polarProductIds(): string[] {
  return PLAN_TAGS
    .flatMap((tag) => Object.values(productEnv(tag)))
    .filter((v): v is string => Boolean(v));
}

interface PolarCheckout {
  id: string;
  url: string;
}

export async function createPolarCheckout(params: {
  userId: number | string;
  successUrl: string;
  customerEmail?: string;
  customerIp?: string;
  currency?: Currency;
  plan?: PlanTag;
}): Promise<PolarCheckout> {
  const tag = params.plan ?? PREMIUM_PLAN_TAG;
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
      products: [getPolarProductId(tag, params.currency ?? "USD")],
      success_url: params.successUrl,
      external_customer_id: String(params.userId),
      ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
      ...(params.customerIp ? { customer_ip_address: params.customerIp } : {}),
      metadata: { userId: String(params.userId), plan: tag },
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
