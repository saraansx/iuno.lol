// Server-only Tebex Checkout API helper. Tebex is the merchant-of-record for
// all Premium purchases (it handles tax/VAT, chargebacks, and every payment
// method — PayPal, cards, UPI, net banking, wallets, etc.). This module must
// never be imported into a client component: it holds the private key and the
// webhook secret.
//
// Docs:
//   Checkout API  https://checkout.tebex.io/api/checkout  (POST, HTTP Basic auth)
//   Auth          username = Project ID, password = Private Key
//   Webhooks      X-Signature = HMAC-SHA256( sha256(rawBody), webhookSecret )
import { createHash, createHmac, timingSafeEqual } from "crypto";

const CHECKOUT_API = "https://checkout.tebex.io/api";

export function tebexConfigured(): boolean {
  return Boolean(process.env.TEBEX_PROJECT_ID && process.env.TEBEX_PRIVATE_KEY);
}

function authHeader(): string {
  const projectId = process.env.TEBEX_PROJECT_ID ?? "";
  const privateKey = process.env.TEBEX_PRIVATE_KEY ?? "";
  return "Basic " + Buffer.from(`${projectId}:${privateKey}`).toString("base64");
}

export interface CreateCheckoutInput {
  /** Item name shown on the Tebex checkout, e.g. "iuno.lol Premium". */
  name: string;
  /** One-time price as a decimal in the project currency (USD). */
  price: number;
  /** Buyer email, prefilled on the checkout when known. */
  email?: string;
  firstName?: string;
  lastName?: string;
  /** Where Tebex sends the customer after they close/complete checkout. */
  returnUrl: string;
  completeUrl: string;
  /**
   * Pass-through data echoed back verbatim in the webhook payload. We stash the
   * userId here so the webhook knows which account to upgrade — the browser is
   * never trusted to flip is_premium.
   */
  custom: Record<string, unknown>;
}

export interface CreateCheckoutResult {
  ident: string;
  checkoutUrl?: string;
}

// Creates a single-request checkout for one one-time custom-priced item and
// returns the basket ident (handed to Tebex.js on the client to open the
// embedded checkout modal).
export async function createTebexCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
  const res = await fetch(`${CHECKOUT_API}/checkout`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      basket: {
        first_name: input.firstName || "iuno",
        last_name: input.lastName || "user",
        email: input.email,
        return_url: input.returnUrl,
        complete_url: input.completeUrl,
        custom: input.custom,
      },
      items: [
        {
          package: {
            name: input.name,
            price: input.price,
            type: "single",
          },
          qty: 1,
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Tebex checkout failed (${res.status}): ${detail.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    ident?: string;
    links?: { checkout?: string };
  };
  if (!data.ident) {
    throw new Error("Tebex checkout response missing ident");
  }
  return { ident: data.ident, checkoutUrl: data.links?.checkout };
}

// Verifies a Tebex webhook signature. Tebex signs with:
//   signature = HMAC-SHA256( SHA256(rawBody).hex , webhookSecret ).hex
// MUST be given the RAW request body (not a re-serialized JSON object) or the
// hash will not match.
export function verifyTebexWebhook(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.TEBEX_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  const expected = createHmac("sha256", secret).update(bodyHash, "utf8").digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signatureHeader, "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Tebex delivers webhooks from a fixed pair of IPs. Handlers may 404 anything
// else as a cheap second layer on top of signature verification.
export const TEBEX_WEBHOOK_IPS = ["18.209.80.3", "54.87.231.232"] as const;
