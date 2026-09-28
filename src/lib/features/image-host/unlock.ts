import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Public file names look like "k9Xa2.mp4"
export const PUBLIC_NAME_RE = /^[A-Za-z0-9]{5}\.[a-z0-9]{2,5}$/;

export const UNLOCK_TTL_SECONDS = 24 * 60 * 60;
export const FILE_PASSWORD_MIN = 4;
export const FILE_PASSWORD_MAX = 128;

export function unlockCookieName(publicName: string): string {
  return `ih_unlock_${publicName.replace(/\./g, "_")}`;
}

function sign(publicName: string, passwordHash: string, exp: number): string {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) throw new Error("JWT_SECRET_KEY is not set");
  // Binding the current hash means changing/removing the password revokes old unlocks
  return createHmac("sha256", secret)
    .update(`ih-unlock|${publicName}|${exp}|${passwordHash}`)
    .digest("base64url");
}

export function createUnlockToken(publicName: string, passwordHash: string): string {
  const exp = Math.floor(Date.now() / 1000) + UNLOCK_TTL_SECONDS;
  return `${exp}.${sign(publicName, passwordHash, exp)}`;
}

export function isValidUnlockToken(
  publicName: string,
  passwordHash: string,
  token: string | undefined,
): boolean {
  if (!token) return false;
  const [expRaw, sig] = token.split(".");
  const exp = Number(expRaw);
  if (!sig || !Number.isInteger(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(sign(publicName, passwordHash, exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
