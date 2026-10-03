"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createSession, getSessionUserId } from "@/lib/auth/session";
import { assertEmailAvailable, assertUsernameAvailable, getUserAliases, getUserById } from "@/lib/features/users/db";
import { validateEmail, validatePassword, validateUsername } from "@/lib/server/security/validation";
import { hashPassword, isPasswordCorrect } from "@/lib/server/security/bcrypt";
import { checkRateLimit, profileUpdateRateLimit } from "@/lib/rate-limit";
import { createOTPToken, verifyOTPToken } from "@/lib/auth/otp";
import { sendTwoFactorTokenEmail } from "@/lib/mail";
import { redis } from "@/lib/redis";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import { invalidateLiveStatsCache } from "@/lib/live-stats-cache";
import { UserFacingError } from "@/lib/errors";
import { isPremiumActive } from "@/lib/premium";

export type AliasRow = { id: number; alias: string; createdAt: string };
export type AliasState = { aliases: AliasRow[]; tokens: number; slots: number; premium: boolean };
type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

async function requireUser() {
  const userId = await getSessionUserId();
  if (!userId) throw new UserFacingError("Please sign in again.");
  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new UserFacingError(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }
  return userId;
}

function fail(err: unknown): { ok: false; error: string } {
  if (err instanceof UserFacingError) return { ok: false, error: err.message };
  const e = err as { code?: string; cause?: { code?: string } };
  if (e?.code === "ER_DUP_ENTRY" || e?.cause?.code === "ER_DUP_ENTRY") return { ok: false, error: "That username is already taken." };
  console.error("[account] action failed:", err);
  return { ok: false, error: "Something went wrong. Please try again." };
}

async function refreshProfile(username: string) {
  revalidatePath(`/${username}`);
  await purgeCloudflareProfileCache(username);
}

async function aliasState(userId: number): Promise<AliasState> {
  const [rows, user] = await Promise.all([getUserAliases(userId), getUserById(userId)]);
  const tokens = user?.aliasTokens ?? 0;
  const premium = isPremiumActive(user);
  return {
    aliases: rows.map((r) => ({ id: r.id, alias: r.alias, createdAt: r.createdAt.toISOString() })),
    tokens,
    slots: tokens,
    premium,
  };
}

function cleanHandle(raw: string) {
  const handle = String(raw ?? "").toLowerCase().trim();
  const error = validateUsername(handle);
  if (error) throw new UserFacingError(error);
  return handle;
}

export async function updateUsername(raw: string): Promise<Result<{ username: string }>> {
  try {
    const userId = await requireUser();
    const username = cleanHandle(raw);
    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    if (user.username === username) return { ok: true, data: { username } };

    const [ownAlias] = await db
      .select({ id: schema.userAliases.id })
      .from(schema.userAliases)
      .where(and(eq(schema.userAliases.userId, userId), eq(schema.userAliases.alias, username)))
      .limit(1);
    if (!ownAlias) await assertUsernameAvailable(username);

    await db.transaction(async (tx) => {
      if (ownAlias) await tx.delete(schema.userAliases).where(eq(schema.userAliases.id, ownAlias.id));
      await tx.update(schema.users).set({ username }).where(eq(schema.users.id, userId));
    });

    const aliases = await getUserAliases(userId);
    await Promise.all([
      refreshProfile(user.username),
      refreshProfile(username),
      invalidateLiveStatsCache(user.username),
      ...aliases.map((a) => refreshProfile(a.alias)),
    ]);
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: { username } };
  } catch (err) {
    return fail(err);
  }
}

export async function updateDisplayName(raw: string): Promise<Result<{ displayName: string }>> {
  try {
    const userId = await requireUser();
    const displayName = String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 32);
    await db
      .insert(schema.userSettings)
      .values({ userId, displayName })
      .onDuplicateKeyUpdate({ set: { displayName } });
    const user = await getUserById(userId);
    if (user?.username) await refreshProfile(user.username);
    return { ok: true, data: { displayName } };
  } catch (err) {
    return fail(err);
  }
}

export async function addAlias(raw: string): Promise<Result<AliasState>> {
  try {
    const userId = await requireUser();
    const alias = cleanHandle(raw);
    await assertUsernameAvailable(alias);

    await db.transaction(async (tx) => {
      const [user] = await tx
        .select({ tokens: schema.users.aliasTokens, isPremium: schema.users.isPremium })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .for("update");
      const [{ used }] = await tx
        .select({ used: sql<number>`COUNT(*)` })
        .from(schema.userAliases)
        .where(eq(schema.userAliases.userId, userId));
      if (Number(used) >= (user?.tokens ?? 0)) {
        throw new UserFacingError("No free alias slot. Buy an alias token first.");
      }
      await tx.insert(schema.userAliases).values({ userId, alias });
    });

    await refreshProfile(alias);
    return { ok: true, data: await aliasState(userId) };
  } catch (err) {
    return fail(err);
  }
}

async function getOwnAlias(userId: number, id: number) {
  const [row] = await db
    .select({ id: schema.userAliases.id, alias: schema.userAliases.alias })
    .from(schema.userAliases)
    .where(and(eq(schema.userAliases.id, Number(id)), eq(schema.userAliases.userId, userId)))
    .limit(1);
  if (!row) throw new UserFacingError("Alias not found.");
  return row;
}

export async function editAlias(id: number, raw: string): Promise<Result<AliasState>> {
  try {
    const userId = await requireUser();
    const next = cleanHandle(raw);
    const row = await getOwnAlias(userId, id);
    if (row.alias === next) return { ok: true, data: await aliasState(userId) };
    await assertUsernameAvailable(next);
    await db.update(schema.userAliases).set({ alias: next }).where(eq(schema.userAliases.id, row.id));
    await Promise.all([refreshProfile(row.alias), refreshProfile(next)]);
    return { ok: true, data: await aliasState(userId) };
  } catch (err) {
    return fail(err);
  }
}

export async function swapAliasWithUsername(id: number): Promise<Result<AliasState & { username: string }>> {
  try {
    const userId = await requireUser();
    const row = await getOwnAlias(userId, id);
    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    const oldUsername = user.username;

    await db.transaction(async (tx) => {
      await tx.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, userId)).for("update");
      await tx.update(schema.users).set({ username: row.alias }).where(eq(schema.users.id, userId));
      await tx.update(schema.userAliases).set({ alias: oldUsername }).where(eq(schema.userAliases.id, row.id));
    });

    const aliases = await getUserAliases(userId);
    await Promise.all([
      refreshProfile(row.alias),
      invalidateLiveStatsCache(oldUsername),
      ...aliases.map((a) => refreshProfile(a.alias)),
    ]);
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: { ...(await aliasState(userId)), username: row.alias } };
  } catch (err) {
    return fail(err);
  }
}

const EMAIL_CHANGE_TTL = 10 * 60;
const pendingEmailKey = (userId: number) => `email_change:${userId}`;

export async function requestEmailChange(raw: string): Promise<Result<{ email: string }>> {
  try {
    const userId = await requireUser();
    const sends = await checkRateLimit(`email_change_send:${userId}`, 5, 15 * 60);
    if (!sends.ok) throw new UserFacingError("Too many requests. Please wait 15 minutes and try again.");

    const email = String(raw ?? "").toLowerCase().trim();
    const emailError = validateEmail(email);
    if (emailError) throw new UserFacingError(emailError);

    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    if (user.email === email) throw new UserFacingError("That's already your email.");
    await assertEmailAvailable(email);

    const code = await createOTPToken(email);
    await sendTwoFactorTokenEmail(email, code);
    await redis.set(pendingEmailKey(userId), email, "EX", EMAIL_CHANGE_TTL);
    return { ok: true, data: { email } };
  } catch (err) {
    return fail(err);
  }
}

export async function confirmEmailChange(rawCode: string): Promise<Result<{ email: string }>> {
  try {
    const userId = await requireUser();
    const email = await redis.get(pendingEmailKey(userId));
    if (!email) throw new UserFacingError("Your code expired. Request a new one.");

    const code = String(rawCode ?? "").replace(/\D/g, "");
    if (code.length !== 6) throw new UserFacingError("Enter the 6-digit code.");
    const check = await verifyOTPToken(email, code);
    if (!check.success) throw new UserFacingError(check.error ?? "Invalid code.");

    await assertEmailAvailable(email);
    await db.update(schema.users).set({ email, emailVerified: true }).where(eq(schema.users.id, userId));
    await redis.del(pendingEmailKey(userId));
    return { ok: true, data: { email } };
  } catch (err) {
    if ((err as { code?: string })?.code === "ER_DUP_ENTRY") return { ok: false, error: "That email is already in use." };
    return fail(err);
  }
}

function sessionCutoff() {
  return new Date(Math.floor(Date.now() / 1000) * 1000);
}

export async function updatePassword(current: string, next: string): Promise<Result> {
  try {
    const userId = await requireUser();
    const attempts = await checkRateLimit(`password_change:${userId}`, 5, 15 * 60);
    if (!attempts.ok) throw new UserFacingError("Too many attempts. Please wait 15 minutes and try again.");

    const nextPassword = String(next ?? "");
    const ruleError = validatePassword(nextPassword);
    if (ruleError) throw new UserFacingError(ruleError);

    const [row] = await db
      .select({ password: schema.users.password })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    if (!row) throw new UserFacingError("Please sign in again.");

    if (row.password) {
      const currentPassword = String(current ?? "");
      if (!currentPassword || currentPassword.length > 128 || !(await isPasswordCorrect(currentPassword, row.password))) {
        throw new UserFacingError("Current password is incorrect.");
      }
      if (await isPasswordCorrect(nextPassword, row.password)) {
        throw new UserFacingError("New password must be different from the current one.");
      }
    }

    await db
      .update(schema.users)
      .set({ password: await hashPassword(nextPassword), passwordChangedAt: sessionCutoff() })
      .where(eq(schema.users.id, userId));
    await createSession(userId);
    return { ok: true, data: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteAlias(id: number): Promise<Result<AliasState>> {
  try {
    const userId = await requireUser();
    const [row] = await db
      .select({ alias: schema.userAliases.alias })
      .from(schema.userAliases)
      .where(and(eq(schema.userAliases.id, Number(id)), eq(schema.userAliases.userId, userId)))
      .limit(1);
    if (!row) throw new UserFacingError("Alias not found.");
    await db.delete(schema.userAliases).where(eq(schema.userAliases.id, Number(id)));
    await refreshProfile(row.alias);
    return { ok: true, data: await aliasState(userId) };
  } catch (err) {
    return fail(err);
  }
}
