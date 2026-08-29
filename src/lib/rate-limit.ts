import { redis } from "@/lib/redis";

const RATE_LIMIT_SCRIPT = `
local cd = redis.call('TTL', KEYS[1])
if cd > 0 then return {0, cd} end
redis.call('ZADD', KEYS[2], ARGV[2], ARGV[3])
redis.call('ZREMRANGEBYSCORE', KEYS[2], 0, ARGV[4])
redis.call('EXPIRE', KEYS[2], ARGV[5])
local count = redis.call('ZCARD', KEYS[2])
if count > tonumber(ARGV[1]) then
  redis.call('SET', KEYS[1], '1', 'EX', ARGV[6])
  redis.call('DEL', KEYS[2])
  return {0, tonumber(ARGV[6])}
end
return {1, 0}
`;

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
  cooldownSeconds: number,
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const now = Date.now();
  const cutoff = now - windowSeconds * 1000;
  const member = `${now}:${Math.random()}`;

  const [ok, retryAfter] = (await redis.eval(
    RATE_LIMIT_SCRIPT,
    2,
    `rl:cd:${key}`,
    `rl:w:${key}`,
    String(maxAttempts),
    String(now),
    member,
    String(cutoff),
    String(windowSeconds),
    String(cooldownSeconds),
  )) as [number, number];

  if (ok === 1) {
    return { ok: true };
  }
  return { ok: false, retryAfterSeconds: retryAfter };
}

export async function loginRateLimit(email: string, ip: string | null) {
  const emailRate = await checkRateLimit(`login:email:${email}`, 5, 10 * 60, 5 * 60);
  if (!emailRate.ok) return emailRate;

  if (ip) {
    const ipRate = await checkRateLimit(`login:ip:${ip}`, 20, 10 * 60, 5 * 60);
    if (!ipRate.ok) return ipRate;
  }

  return { ok: true as const };
}

export async function registerRateLimit(email: string, ip: string | null) {
  const emailRate = await checkRateLimit(`register:email:${email}`, 3, 10 * 60, 5 * 60);
  if (!emailRate.ok) return emailRate;

  if (ip) {
    const ipRate = await checkRateLimit(`register:ip:${ip}`, 5, 10 * 60, 5 * 60);
    if (!ipRate.ok) return ipRate;
  }

  return { ok: true as const };
}

export async function resetPasswordRateLimit(ip: string | null) {
  if (!ip) return { ok: true as const };
  return checkRateLimit(`reset:ip:${ip}`, 10, 10 * 60, 5 * 60);
}

export async function uploadPreRateLimit(userId: number) {
  return checkRateLimit(`upload:pre:${userId}`, 20, 5 * 60, 60);
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
  return checkRateLimit(`comment:${userId}`, 5, 2 * 60, 2 * 60);
}

export async function profileUpdateRateLimit(userId: number) {
  return checkRateLimit(`profile_update:${userId}`, 10, 60, 60);
}

export async function checkAvailabilityRateLimit(ip: string | null) {
  if (!ip) return { ok: true as const };
  return checkRateLimit(`check:${ip}`, 10, 60, 30);
}

export async function feedbackRateLimit(userId: number) {
  return checkRateLimit(`feedback:${userId}`, 20, 60, 60);
}

export async function discordOAuthRateLimit(ip: string | null) {
  if (!ip) return { ok: true as const };
  return checkRateLimit(`discord_oauth:${ip}`, 10, 10 * 60, 5 * 60);
}

export async function commentLikeRateLimit(userId: number) {
  return checkRateLimit(`comment_like:${userId}`, 20, 60, 60);
}

export async function commentEditRateLimit(userId: number) {
  return checkRateLimit(`comment_edit:${userId}`, 10, 60, 60);
}

export async function commentDeleteRateLimit(userId: number) {
  return checkRateLimit(`comment_delete:${userId}`, 10, 60, 60);
}

export async function commentPinRateLimit(userId: number) {
  return checkRateLimit(`comment_pin:${userId}`, 20, 60, 60);
}
