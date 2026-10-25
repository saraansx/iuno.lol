import "server-only";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db, schema } from "@/lib/db";
import { redis } from "@/lib/redis";
import { decryptSecret, verifyTotp } from "@/lib/server/security/totp";

const TICKET_TTL = 5 * 60;
const MAX_CODE_ATTEMPTS = 5;

export const TWO_FACTOR_TICKET_COOKIE = "iuno_2fa_ticket";
export const TWO_FACTOR_TICKET_TTL = TICKET_TTL;
const ticketKey = (ticket: string) => `2fa_ticket:${ticket}`;
const attemptsKey = (ticket: string) => `2fa_ticket_attempts:${ticket}`;
const usedStepKey = (userId: number, step: number) => `2fa_used:${userId}:${step}`;

export async function getTwoFactorSecret(userId: number): Promise<string | null> {
  const [row] = await db
    .select({ secret: schema.users.twoFactorSecret, enabledAt: schema.users.twoFactorEnabledAt })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  if (!row?.secret || !row.enabledAt) return null;
  return decryptSecret(row.secret);
}

export async function checkTwoFactorCode(userId: number, code: string, secret?: string): Promise<boolean> {
  const plain = secret ?? (await getTwoFactorSecret(userId));
  if (!plain) return false;
  const step = verifyTotp(plain, code.replace(/\s/g, ""));
  if (step === null) return false;
  const fresh = await redis.set(usedStepKey(userId, step), "1", "EX", 120, "NX");
  return fresh === "OK";
}

export async function createLoginTicket(userId: number): Promise<string> {
  const ticket = randomBytes(24).toString("base64url");
  await redis.set(ticketKey(ticket), String(userId), "EX", TICKET_TTL);
  return ticket;
}

export type TicketResult = { ok: true; userId: number } | { ok: false; error: string; retryable?: true };

export async function redeemLoginTicket(ticket: string, code: string): Promise<TicketResult> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(ticket)) return { ok: false, error: "Your sign-in expired. Please start again." };
  const raw = await redis.get(ticketKey(ticket));
  if (!raw) return { ok: false, error: "Your sign-in expired. Please start again." };
  const userId = Number(raw);

  const attempts = await redis.incr(attemptsKey(ticket));
  if (attempts === 1) await redis.expire(attemptsKey(ticket), TICKET_TTL);
  if (attempts > MAX_CODE_ATTEMPTS) {
    await redis.del(ticketKey(ticket), attemptsKey(ticket));
    return { ok: false, error: "Too many wrong codes. Please sign in again." };
  }

  if (!(await checkTwoFactorCode(userId, code))) {
    const left = MAX_CODE_ATTEMPTS - attempts;
    return { ok: false, retryable: true, error: left > 0 ? `Invalid code. ${left} attempt${left === 1 ? "" : "s"} left.` : "Invalid code." };
  }

  await redis.del(ticketKey(ticket), attemptsKey(ticket));
  return { ok: true, userId };
}
