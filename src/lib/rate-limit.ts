import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
  cooldownSeconds: number,
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const cooldownKey = `cooldown:${key}`;

  const cooldownTtl = await redis.ttl(cooldownKey);
  if (cooldownTtl > 0) {
    return { ok: false, retryAfterSeconds: cooldownTtl };
  }

  const now = Date.now();
  const windowKey = `window:${key}`;

  await redis.zadd(windowKey, { score: now, member: `${now}:${Math.random()}` });
  await redis.zremrangebyscore(windowKey, 0, now - windowSeconds * 1000);
  await redis.expire(windowKey, windowSeconds);

  const count = await redis.zcard(windowKey);

  if (count > maxAttempts) {
    await redis.set(cooldownKey, "1", { ex: cooldownSeconds });
    await redis.del(windowKey);
    return { ok: false, retryAfterSeconds: cooldownSeconds };
  }

  return { ok: true };
}

export async function loginRateLimit(email: string) {
  return checkRateLimit(`login:${email}`, 5, 10 * 60, 5 * 60);
}

export async function registerRateLimit(email: string) {
  return checkRateLimit(`register:${email}`, 3, 30 * 60, 5 * 60);
}

async function resetPasswordRateLimit(email: string) {
  return checkRateLimit(`reset:${email}`, 3, 30 * 60, 5 * 60);
}

export async function uploadRateLimit(userId: number, assetType: string) {
  return checkRateLimit(`upload:${userId}:${assetType}`, 10, 5 * 60, 60);
}

export async function forgotPasswordRateLimit(email: string) {
  return checkRateLimit(`forgot:${email}`, 5, 10 * 60, 5 * 60);
}

export async function sendOTPRateLimit(email: string) {
  return checkRateLimit(`otp:${email}`, 5, 10 * 60, 5 * 60);
}

export async function resendVerificationRateLimit(email: string) {
  return checkRateLimit(`resend:${email}`, 5, 10 * 60, 5 * 60);
}

export async function commentRateLimit(userId: number) {
  // 5 comments per 2 minutes
  return checkRateLimit(`comment:${userId}`, 5, 2 * 60, 2 * 60);
}

export async function profileUpdateRateLimit(userId: number) {
  // 10 updates per 1 minute
  return checkRateLimit(`profile_update:${userId}`, 10, 60, 60);
}
