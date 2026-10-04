"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createSession, getSessionUserId, revokeAllSessions } from "@/lib/auth/session";
import { assertEmailAvailable, assertUsernameAvailable, getUserAliases, getUserById } from "@/lib/features/users/db";
import { validateEmail, validatePassword, validateUsername } from "@/lib/server/security/validation";
import { hashPassword, isPasswordCorrect } from "@/lib/server/security/bcrypt";
import { checkRateLimit, profileUpdateRateLimit } from "@/lib/rate-limit";
import { createOTPToken, verifyOTPToken } from "@/lib/auth/otp";
import { sendTwoFactorTokenEmail } from "@/lib/mail";
import { redis } from "@/lib/redis";
import QRCode from "qrcode";
import { decryptSecret, encryptSecret, generateTotpSecret, otpauthUri } from "@/lib/server/security/totp";
import { checkTwoFactorCode } from "@/lib/auth/two-factor";
import { MAX_PASSKEYS, deletePasskey, finishPasskeyRegistration, listPasskeys, startPasskeyRegistration } from "@/lib/auth/passkeys";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
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
    if (user.username === username) {
      if (user.needsUsername) await db.update(schema.users).set({ needsUsername: false }).where(eq(schema.users.id, userId));
      return { ok: true, data: { username } };
    }

    const [ownAlias] = await db
      .select({ id: schema.userAliases.id })
      .from(schema.userAliases)
      .where(and(eq(schema.userAliases.userId, userId), eq(schema.userAliases.alias, username)))
      .limit(1);
    if (!ownAlias) await assertUsernameAvailable(username);

    await db.transaction(async (tx) => {
      if (ownAlias) await tx.delete(schema.userAliases).where(eq(schema.userAliases.id, ownAlias.id));
      await tx.update(schema.users).set({ username, needsUsername: false }).where(eq(schema.users.id, userId));
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
const emailChangePwOkKey = (userId: number) => `email_change:pw_ok:${userId}`;
const emailChangeCurrentOkKey = (userId: number) => `email_change:current_ok:${userId}`;
const emailChangePendingNewKey = (userId: number) => `email_change:pending_new:${userId}`;

export async function verifyPasswordAndSendCurrentOtp(rawPassword: string): Promise<Result> {
  try {
    const userId = await requireUser();
    const sends = await checkRateLimit(`email_change_pw:${userId}`, 5, 15 * 60);
    if (!sends.ok) throw new UserFacingError("Too many attempts. Please wait 15 minutes.");

    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    if (!user.email) throw new UserFacingError("No email on this account.");
    const [row] = await db.select({ password: schema.users.password }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!row?.password) throw new UserFacingError("Set a password first to change your email.");
    {
      const pw = String(rawPassword ?? "");
      if (!pw) throw new UserFacingError("Enter your current password.");
      if (pw.length > 128 || !(await isPasswordCorrect(pw, row.password))) throw new UserFacingError("Current password is incorrect.");
    }
    const code = await createOTPToken(user.email);
    await sendTwoFactorTokenEmail(user.email, code);
    await redis.set(emailChangePwOkKey(userId), "1", "EX", EMAIL_CHANGE_TTL);
    return { ok: true, data: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function verifyCurrentEmailOtp(rawCode: string): Promise<Result> {
  try {
    const userId = await requireUser();
    const pwOk = await redis.get(emailChangePwOkKey(userId));
    if (!pwOk) throw new UserFacingError("Please verify your password first.");
    const user = await getUserById(userId);
    if (!user?.email) throw new UserFacingError("No email on this account.");
    const code = String(rawCode ?? "").replace(/\D/g, "");
    if (code.length !== 6) throw new UserFacingError("Enter the 6-digit code.");
    const check = await verifyOTPToken(user.email, code);
    if (!check.success) throw new UserFacingError(check.error ?? "Invalid code.");
    await redis.del(emailChangePwOkKey(userId));
    await redis.set(emailChangeCurrentOkKey(userId), "1", "EX", EMAIL_CHANGE_TTL);
    return { ok: true, data: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function sendNewEmailOtp(raw: string): Promise<Result<{ email: string }>> {
  try {
    const userId = await requireUser();
    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    if (user.email) {
      const ok = await redis.get(emailChangeCurrentOkKey(userId));
      if (!ok) throw new UserFacingError("Please verify your current email first.");
    }
    const sends = await checkRateLimit(`email_change_send:${userId}`, 5, 15 * 60);
    if (!sends.ok) throw new UserFacingError("Too many requests. Please wait 15 minutes and try again.");
    const email = String(raw ?? "").toLowerCase().trim();
    const emailError = validateEmail(email);
    if (emailError) throw new UserFacingError(emailError);
    if (user.email === email) throw new UserFacingError("That's already your email.");
    await assertEmailAvailable(email);
    const code = await createOTPToken(email);
    await sendTwoFactorTokenEmail(email, code);
    await redis.set(emailChangePendingNewKey(userId), email, "EX", EMAIL_CHANGE_TTL);
    if (user.email) await redis.expire(emailChangeCurrentOkKey(userId), EMAIL_CHANGE_TTL);
    return { ok: true, data: { email } };
  } catch (err) {
    return fail(err);
  }
}

export async function confirmNewEmailOtp(rawCode: string): Promise<Result<{ email: string }>> {
  try {
    const userId = await requireUser();
    const pending = await redis.get(emailChangePendingNewKey(userId));
    if (!pending) throw new UserFacingError("Your code expired. Request a new one.");
    const user = await getUserById(userId);
    if (user?.email) {
      const ok = await redis.get(emailChangeCurrentOkKey(userId));
      if (!ok) throw new UserFacingError("Current email verification expired. Start again.");
    }
    const code = String(rawCode ?? "").replace(/\D/g, "");
    if (code.length !== 6) throw new UserFacingError("Enter the 6-digit code.");
    const check = await verifyOTPToken(pending, code);
    if (!check.success) throw new UserFacingError(check.error ?? "Invalid code.");
    await assertEmailAvailable(pending);
    await db.update(schema.users).set({ email: pending, emailVerified: true }).where(eq(schema.users.id, userId));
    await redis.del(emailChangePendingNewKey(userId));
    await redis.del(emailChangeCurrentOkKey(userId));
    await redis.del(emailChangePwOkKey(userId));
    return { ok: true, data: { email: pending } };
  } catch (err) {
    if ((err as { code?: string })?.code === "ER_DUP_ENTRY") return { ok: false, error: "That email is already in use." };
    return fail(err);
  }
}

function sessionCutoff() {
  return new Date();
}

export async function completeDiscordOnboarding(rawUsername: string, rawPassword: string): Promise<Result<{ username: string }>> {
  try {
    const userId = await requireUser();
    const username = cleanHandle(rawUsername);
    const password = String(rawPassword ?? "");
    const pwError = validatePassword(password);
    if (pwError) throw new UserFacingError(pwError);
    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    if (!user.needsUsername) throw new UserFacingError("Onboarding already completed.");
    if (user.username !== username) {
      const [ownAlias] = await db
        .select({ id: schema.userAliases.id })
        .from(schema.userAliases)
        .where(and(eq(schema.userAliases.userId, userId), eq(schema.userAliases.alias, username)))
        .limit(1);
      if (!ownAlias) await assertUsernameAvailable(username);
      await db.transaction(async (tx) => {
        if (ownAlias) await tx.delete(schema.userAliases).where(eq(schema.userAliases.id, ownAlias.id));
        await tx.update(schema.users).set({ username, password: await hashPassword(password), needsUsername: false }).where(eq(schema.users.id, userId));
      });
    } else {
      await db.update(schema.users).set({ password: await hashPassword(password), needsUsername: false }).where(eq(schema.users.id, userId));
    }
    const aliases = await getUserAliases(userId);
    if (user.username !== username) {
      await Promise.all([
        refreshProfile(user.username),
        refreshProfile(username),
        invalidateLiveStatsCache(user.username),
        ...aliases.map((a) => refreshProfile(a.alias)),
      ]);
    }
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: { username } };
  } catch (err) {
    return fail(err);
  }
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
    await revokeAllSessions(userId);
    await createSession(userId);
    return { ok: true, data: undefined };
  } catch (err) {
    return fail(err);
  }
}


const pendingTotpKey = (userId: number) => `2fa_setup:${userId}`;
const TOTP_SETUP_TTL = 10 * 60;

export async function startTwoFactorSetup(): Promise<Result<{ qr: string; secret: string }>> {
  try {
    const userId = await requireUser();
    const [pwRow] = await db.select({ password: schema.users.password }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!pwRow?.password) throw new UserFacingError("Set a password first to use authenticator app.");
    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    if (user.twoFactorEnabledAt) throw new UserFacingError("Authenticator app is already on.");

    const key = pendingTotpKey(userId);
    const created = await redis.set(key, encryptSecret(generateTotpSecret()), "EX", TOTP_SETUP_TTL, "NX");
    const stored = await redis.get(key);
    if (!stored) throw new UserFacingError("Couldn't start setup. Please try again.");
    if (created !== "OK") await redis.expire(key, TOTP_SETUP_TTL);
    const secret = decryptSecret(stored);
    const qr = await QRCode.toDataURL(otpauthUri(secret, user.email ?? user.username), { margin: 1, width: 220 });
    return { ok: true, data: { qr, secret } };
  } catch (err) {
    return fail(err);
  }
}

export async function confirmTwoFactorSetup(code: string): Promise<Result> {
  try {
    const userId = await requireUser();
    const attempts = await checkRateLimit(`2fa_setup_verify:${userId}`, 10, 10 * 60);
    if (!attempts.ok) throw new UserFacingError("Too many attempts. Please wait a few minutes.");

    const stored = await redis.get(pendingTotpKey(userId));
    if (!stored) throw new UserFacingError("Setup expired. Start again.");
    const secret = decryptSecret(stored);
    if (!(await checkTwoFactorCode(userId, String(code ?? ""), secret))) throw new UserFacingError("That code didn't match. Try the newest one.");

    await db
      .update(schema.users)
      .set({ twoFactorSecret: stored, twoFactorEnabledAt: new Date() })
      .where(eq(schema.users.id, userId));
    await redis.del(pendingTotpKey(userId));
    return { ok: true, data: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function disableTwoFactor(code: string): Promise<Result> {
  try {
    const userId = await requireUser();
    const attempts = await checkRateLimit(`2fa_disable:${userId}`, 5, 15 * 60);
    if (!attempts.ok) throw new UserFacingError("Too many attempts. Please wait 15 minutes.");
    if (!(await checkTwoFactorCode(userId, String(code ?? "")))) throw new UserFacingError("That code didn't match.");

    await db
      .update(schema.users)
      .set({ twoFactorSecret: null, twoFactorEnabledAt: null })
      .where(eq(schema.users.id, userId));
    return { ok: true, data: undefined };
  } catch (err) {
    return fail(err);
  }
}


export type PasskeyRow = { id: number; name: string; createdAt: string; lastUsedAt: string | null };

async function passkeyRows(userId: number): Promise<PasskeyRow[]> {
  const rows = await listPasskeys(userId);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.createdAt.toISOString(),
    lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
  }));
}

export async function beginAddPasskey(): Promise<Result<PublicKeyCredentialCreationOptionsJSON>> {
  try {
    const userId = await requireUser();
    const [pwRow] = await db.select({ password: schema.users.password }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!pwRow?.password) throw new UserFacingError("Set a password first to add passkeys.");
    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    if ((await listPasskeys(userId)).length >= MAX_PASSKEYS) throw new UserFacingError(`You can add up to ${MAX_PASSKEYS} passkeys.`);
    return { ok: true, data: await startPasskeyRegistration(userId, user.email ?? user.username) };
  } catch (err) {
    return fail(err);
  }
}

export async function finishAddPasskey(response: RegistrationResponseJSON, rawName: string): Promise<Result<PasskeyRow[]>> {
  try {
    const userId = await requireUser();
    const name = String(rawName ?? "").replace(/\s+/g, " ").trim().slice(0, 64) || "Passkey";
    if (!(await finishPasskeyRegistration(userId, response, name))) {
      throw new UserFacingError("Couldn't verify that passkey. Please try again.");
    }
    return { ok: true, data: await passkeyRows(userId) };
  } catch (err) {
    if ((err as { code?: string })?.code === "ER_DUP_ENTRY") return { ok: false, error: "That passkey is already added." };
    return fail(err);
  }
}

export async function removePasskey(id: number): Promise<Result<PasskeyRow[]>> {
  try {
    const userId = await requireUser();
    if (!(await deletePasskey(userId, Number(id)))) throw new UserFacingError("Passkey not found.");
    return { ok: true, data: await passkeyRows(userId) };
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

export async function disconnectDiscord(): Promise<Result> {
  try {
    const userId = await requireUser();
    const user = await getUserById(userId);
    if (!user) throw new UserFacingError("Please sign in again.");
    if (!user.discordId) throw new UserFacingError("Discord is not connected.");
    await db.update(schema.users).set({ discordId: null, discordUsername: null }).where(eq(schema.users.id, userId));
    return { ok: true, data: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function setUsernameLoginEnabled(enabled: boolean): Promise<Result<{ enabled: boolean }>> {
  try {
    const userId = await requireUser();
    const [row] = await db.select({ password: schema.users.password }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!row?.password) throw new UserFacingError("Set a password first.");
    await db.update(schema.users).set({ usernameLoginEnabled: Boolean(enabled) }).where(eq(schema.users.id, userId));
    return { ok: true, data: { enabled: Boolean(enabled) } };
  } catch (err) {
    return fail(err);
  }
}

export async function getActiveSessions(): Promise<Result<import("@/lib/auth/session").ActiveSession[]>> {
  try {
    const userId = await requireUser();
    const { getActiveSessionsForUser } = await import("@/lib/auth/session");
    const sessions = await getActiveSessionsForUser(userId);
    return { ok: true, data: sessions };
  } catch (err) { return fail(err) as never; }
}

export async function revokeSessionAction(jti: string): Promise<Result> {
  try {
    const userId = await requireUser();
    const { revokeSession, getCurrentJti } = await import("@/lib/auth/session");
    const current = await getCurrentJti();
    if (current && jti === current) throw new UserFacingError("You can't revoke your current session.");
    const ok = await revokeSession(userId, String(jti ?? ""));
    if (!ok) throw new UserFacingError("Session not found or already expired.");
    return { ok: true, data: undefined };
  } catch (err) { return fail(err); }
}

export async function revokeOtherSessionsAction(): Promise<Result<{ revoked: number }>> {
  try {
    const userId = await requireUser();
    const { revokeOtherSessions, getCurrentJti } = await import("@/lib/auth/session");
    const current = await getCurrentJti();
    if (!current) throw new UserFacingError("Current session not found.");
    const n = await revokeOtherSessions(userId, current);
    return { ok: true, data: { revoked: n } };
  } catch (err) { return fail(err) as never; }
}
