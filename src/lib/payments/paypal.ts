// Server-only PayPal helpers. This module reads PAYPAL_CLIENT_SECRET, so it must
// never be imported into a client component — only into route handlers / server
// code. It talks to the PayPal Orders v2 REST API directly (no SDK): mint an
// OAuth token, create an order, then capture it server-side and verify the
// result before granting Premium.
//
// USD Premium is charged through PayPal; INR still goes through Razorpay (see
// razorpay.ts). Note PayPal amounts are decimal strings ("4.99"), NOT the
// smallest-unit integers Razorpay uses.
//
// Required environment variables (add these to your .env — they do not exist
// yet):
//   PAYPAL_CLIENT_ID      REST app client id. Public — it is also handed to the
//                         browser so the JS SDK can render the PayPal buttons.
//   PAYPAL_CLIENT_SECRET  the API secret — NEVER expose this to the client.
//   PAYPAL_ENV            "live" for production; anything else (or unset) uses
//                         the PayPal sandbox.

const LIVE_API = "https://api-m.paypal.com";
const SANDBOX_API = "https://api-m.sandbox.paypal.com";

/** "live" only in production PayPal; everything else is sandbox. */
export function paypalEnv(): "live" | "sandbox" {
  return process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
}

function apiBase(): string {
  return paypalEnv() === "live" ? LIVE_API : SANDBOX_API;
}

/** True only when both the client id and secret are configured. */
export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

/** The public client id, safe to hand to the browser to load the JS SDK. */
export function getPaypalClientId(): string {
  const id = process.env.PAYPAL_CLIENT_ID;
  if (!id) throw new Error("PAYPAL_CLIENT_ID is not set");
  return id;
}

async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal is not configured");
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PayPal token request failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("PayPal token missing in response");
  return data.access_token;
}

export interface PaypalOrder {
  id: string;
  status: string;
}

/**
 * Create a PayPal order for the Premium purchase. `amountValue` is a decimal
 * string ("4.99"); `customId` ties the order to our user so capture can confirm
 * the payer is who they claim to be.
 */
export async function createPaypalOrder(params: {
  amountValue: string;
  currency: string;
  customId: string;
  description?: string;
}): Promise<PaypalOrder> {
  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "premium_lifetime",
          description: params.description,
          custom_id: params.customId,
          amount: { currency_code: params.currency, value: params.amountValue },
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PayPal create order failed: ${res.status} ${text}`);
  }
  return (await res.json()) as PaypalOrder;
}

export interface PaypalCapture {
  status: string; // "COMPLETED" when the money actually moved
  customId: string | null;
  currency: string | null;
  value: string | null; // decimal string, e.g. "4.99"
}

/**
 * Capture an approved PayPal order server-side and pull out the fields we verify
 * before granting Premium. Returns null on a failed/duplicate capture.
 */
export async function capturePaypalOrder(orderId: string): Promise<PaypalCapture | null> {
  const token = await getAccessToken();
  const res = await fetch(
    `${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    },
  );
  if (!res.ok) return null; // e.g. already captured, or an invalid order id
  const data = (await res.json()) as {
    status?: string;
    purchase_units?: Array<{
      custom_id?: string;
      payments?: {
        captures?: Array<{
          status?: string;
          custom_id?: string;
          amount?: { currency_code?: string; value?: string };
        }>;
      };
    }>;
  };
  const pu = data.purchase_units?.[0];
  const cap = pu?.payments?.captures?.[0];
  return {
    status: cap?.status ?? data.status ?? "UNKNOWN",
    customId: cap?.custom_id ?? pu?.custom_id ?? null,
    currency: cap?.amount?.currency_code ?? null,
    value: cap?.amount?.value ?? null,
  };
}
