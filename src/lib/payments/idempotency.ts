import { db, schema } from "@/lib/db";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

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
