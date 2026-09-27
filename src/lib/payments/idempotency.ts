// Server-only idempotency helpers for payment-provider events. The whole point
// is replay protection: a captured "payment succeeded" / "refunded" webhook (or
// a re-submitted Razorpay verification) must grant/revoke Premium AT MOST ONCE,
// no matter how many times it's delivered. Backed by the unique
// (provider, event_id) key on `processed_payment_events` (see schema.ts).
import { db, schema } from "@/lib/db";

// Transaction handle type, derived from db.transaction so we don't depend on
// drizzle's internal type names.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * True when `err` is a MySQL duplicate-key error (ER_DUP_ENTRY / errno 1062),
 * however mysql2/drizzle happens to wrap it. That's how we tell "this event was
 * already processed" apart from a real failure.
 */
export function isDuplicateKeyError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as {
    code?: string;
    errno?: number;
    cause?: { code?: string; errno?: number };
  };
  return (
    e.code === "ER_DUP_ENTRY" ||
    e.errno === 1062 ||
    e.cause?.code === "ER_DUP_ENTRY" ||
    e.cause?.errno === 1062
  );
}

/**
 * Record a payment event and run its effect EXACTLY ONCE, atomically.
 *
 * Inserts (provider, eventId) into the idempotency ledger and runs `effect` in
 * the same transaction:
 *   - first time  -> insert succeeds, `effect` runs, returns true.
 *   - replay/dupe -> insert hits the unique key, the whole tx rolls back,
 *                    `effect` does NOT run, returns false.
 *
 * Because the insert and the effect share one transaction, a failure inside
 * `effect` also rolls back the ledger row, so a legitimate provider retry can
 * still succeed later. Non-duplicate errors are rethrown for the caller to map
 * to a 5xx (so the provider retries).
 */
export async function processPaymentEventOnce(
  params: { provider: string; eventId: string; userId?: number | null },
  effect: (tx: Tx) => Promise<void>,
): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(schema.processedPaymentEvents).values({
        provider: params.provider,
        eventId: params.eventId,
        userId: params.userId ?? null,
      });
      await effect(tx);
    });
    return true;
  } catch (err) {
    if (isDuplicateKeyError(err)) return false;
    throw err;
  }
}
