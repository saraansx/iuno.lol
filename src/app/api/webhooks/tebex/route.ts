import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { PREMIUM_PLAN } from "@/lib/payments/plans";
import { verifyTebexWebhook } from "@/lib/payments/tebex";
import { notifyPremiumPurchase } from "@/lib/notify/discord";

// Tebex webhook handler. Tebex POSTs here on payment events; we verify the
// HMAC-SHA256 signature (over the RAW body) before trusting anything, then on
// `payment.completed` grant Premium to the mapped user and on `payment.refunded`
// (or a dispute won against us) revoke it. This is the source of truth for
// Tebex purchases — the browser is never trusted to flip is_premium.
//
// Tebex also sends a one-off `validation.webhook` when the endpoint is saved;
// we must echo back `{ "id": <id> }` with 200 for it to be accepted.

interface TebexWebhook {
  id?: string;
  type?: string;
  subject?: {
    custom?: Record<string, unknown> | null;
    price?: { amount?: number | string; currency?: string } | null;
    customer?: { email?: string | null } | null;
    products?: Array<{ custom?: Record<string, unknown> | null }> | null;
  } | null;
}

// The userId we stashed in basket.custom comes back somewhere under `subject` —
// on the subject itself or on a product row, depending on the event. Check both.
function userIdFrom(payload: TebexWebhook): number | null {
  const candidates: unknown[] = [
    payload.subject?.custom?.userId,
    ...(payload.subject?.products ?? []).map((p) => p?.custom?.userId),
  ];
  for (const raw of candidates) {
    if (raw == null) continue;
    const n = Number(raw);
    if (Number.isInteger(n) && n > 0) return n;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  if (!verifyTebexWebhook(body, request.headers.get("x-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: TebexWebhook;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // Endpoint validation handshake — echo the id back so Tebex marks it verified.
  if (event.type === "validation.webhook") {
    return NextResponse.json({ id: event.id });
  }

  const userId = userIdFrom(event);

  try {
    if (event.type === "payment.completed") {
      if (!userId) {
        console.error("[webhooks/tebex] payment.completed with no mappable user id");
        return NextResponse.json({ received: true });
      }
      // Lifetime plan: set the flag, leave premium_expires_at null (no expiry).
      await db.update(schema.users).set({ isPremium: true }).where(eq(schema.users.id, userId));

      // Best-effort Discord notification — never blocks or fails the upgrade.
      try {
        const [row] = await db
          .select({ username: schema.users.username, email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .limit(1);
        const currency = event.subject?.price?.currency ?? "USD";
        const plan = currency === "INR" ? PREMIUM_PLAN.INR : PREMIUM_PLAN.USD;
        await notifyPremiumPurchase({
          gateway: "tebex",
          userId,
          username: row?.username,
          email: row?.email ?? event.subject?.customer?.email,
          amount: `${plan.symbol}${plan.display}`,
          currency,
        });
      } catch (err) {
        console.error("[webhooks/tebex] notify failed:", err);
      }
    } else if (event.type === "payment.refunded" || event.type === "payment.chargeback") {
      if (userId) {
        await db.update(schema.users).set({ isPremium: false }).where(eq(schema.users.id, userId));
      }
    }
  } catch (err) {
    console.error("[webhooks/tebex] failed to process event:", err);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
