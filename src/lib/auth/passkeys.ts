import "server-only";
import { and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransport,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { db, schema } from "@/lib/db";
import { redis } from "@/lib/redis";
import { SITE_CONFIG } from "@/lib/config";

function relyingParty() {
  const origin = new URL(SITE_CONFIG.url).origin;
  return { rpID: new URL(origin).hostname, origin, rpName: SITE_CONFIG.name };
}

const CHALLENGE_TTL = 5 * 60;
const regChallengeKey = (userId: number) => `passkey_reg:${userId}`;
const authChallengeKey = (id: string) => `passkey_auth:${id}`;

export const MAX_PASSKEYS = 10;

async function takeChallenge(key: string): Promise<string | null> {
  const value = await redis.get(key);
  if (value) await redis.del(key);
  return value;
}

export async function listPasskeys(userId: number) {
  return db
    .select({
      id: schema.userPasskeys.id,
      name: schema.userPasskeys.name,
      createdAt: schema.userPasskeys.createdAt,
      lastUsedAt: schema.userPasskeys.lastUsedAt,
    })
    .from(schema.userPasskeys)
    .where(eq(schema.userPasskeys.userId, userId))
    .orderBy(schema.userPasskeys.createdAt);
}

export async function startPasskeyRegistration(
  userId: number,
  userName: string,
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const { rpID, rpName } = relyingParty();
  const existing = await db
    .select({ credentialId: schema.userPasskeys.credentialId, transports: schema.userPasskeys.transports })
    .from(schema.userPasskeys)
    .where(eq(schema.userPasskeys.userId, userId));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName,
    userID: new TextEncoder().encode(`iuno:${userId}`),
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({
      id: c.credentialId,
      transports: (c.transports?.split(",").filter(Boolean) ?? []) as AuthenticatorTransport[],
    })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  await redis.set(regChallengeKey(userId), options.challenge, "EX", CHALLENGE_TTL);
  return options;
}

export async function finishPasskeyRegistration(userId: number, response: RegistrationResponseJSON, name: string): Promise<boolean> {
  const challenge = await takeChallenge(regChallengeKey(userId));
  if (!challenge) return false;
  const { rpID, origin } = relyingParty();

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  });
  if (!verification.verified) return false;

  const { credential } = verification.registrationInfo;
  await db.insert(schema.userPasskeys).values({
    userId,
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports?.join(",") ?? null,
    name,
  });
  return true;
}

export async function startPasskeyLogin(): Promise<{ challengeId: string; options: PublicKeyCredentialRequestOptionsJSON }> {
  const { rpID } = relyingParty();
  const options = await generateAuthenticationOptions({ rpID, userVerification: "required" });
  const challengeId = randomBytes(18).toString("base64url");
  await redis.set(authChallengeKey(challengeId), options.challenge, "EX", CHALLENGE_TTL);
  return { challengeId, options };
}

export async function finishPasskeyLogin(challengeId: string, response: AuthenticationResponseJSON): Promise<number | null> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(challengeId)) return null;
  const challenge = await takeChallenge(authChallengeKey(challengeId));
  if (!challenge) return null;

  const [row] = await db
    .select()
    .from(schema.userPasskeys)
    .where(eq(schema.userPasskeys.credentialId, String(response.id ?? "")))
    .limit(1);
  if (!row) return null;

  const { rpID, origin } = relyingParty();
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
    credential: {
      id: row.credentialId,
      publicKey: new Uint8Array(Buffer.from(row.publicKey, "base64url")),
      counter: row.counter,
      transports: (row.transports?.split(",").filter(Boolean) ?? []) as AuthenticatorTransport[],
    },
  });
  if (!verification.verified) return null;

  await db
    .update(schema.userPasskeys)
    .set({ counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() })
    .where(eq(schema.userPasskeys.id, row.id));
  return row.userId;
}

export async function deletePasskey(userId: number, id: number): Promise<boolean> {
  const [res] = await db
    .delete(schema.userPasskeys)
    .where(and(eq(schema.userPasskeys.id, id), eq(schema.userPasskeys.userId, userId)));
  return (res as { affectedRows?: number }).affectedRows === 1;
}
