import { redis } from "@/lib/redis";

/**
 * Sliding window. Attempts are timestamps in a sorted set and stale ones are
 * dropped on every call, so being over the limit only blocks until the oldest
 * attempt ages out — there is no separate cooldown key to sit out in full.
 */
const RATE_LIMIT_SCRIPT = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local max = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - window)
if redis.call('ZCARD', KEYS[1]) >= max then
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  local retry = math.ceil((tonumber(oldest[2]) + window - now) / 1000)
  return {0, math.max(retry, 1)}
end
if ARGV[5] == '1' then
  redis.call('ZADD', KEYS[1], now, ARGV[4])
  redis.call('PEXPIRE', KEYS[1], window)
end
return {1, 0}
`;

type RateResult = { ok: true } | { ok: false; retryAfterSeconds: number };

async function evalLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
  record: boolean,
): Promise<RateResult> {
  const now = Date.now();

  const [ok, retryAfter] = (await redis.eval(
    RATE_LIMIT_SCRIPT,
    1,
    `rl:w:${key}`,
    String(now),
    String(windowSeconds * 1000),
    String(maxAttempts),
    `${now}:${Math.random()}`,
    record ? "1" : "0",
  )) as [number, number];

  return ok === 1 ? { ok: true } : { ok: false, retryAfterSeconds: retryAfter };
}

/** Counts this call against the limit. */
export function checkRateLimit(key: string, maxAttempts: number, windowSeconds: number) {
  return evalLimit(key, maxAttempts, windowSeconds, true);
}

/** Reads the limit without counting — pair with recordAttempt on failure only. */
export function peekRateLimit(key: string, maxAttempts: number, windowSeconds: number) {
  return evalLimit(key, maxAttempts, windowSeconds, false);
}

export async function recordAttempt(key: string, windowSeconds: number) {
  const now = Date.now();
  await redis.zadd(`rl:w:${key}`, now, `${now}:${Math.random()}`);
  await redis.expire(`rl:w:${key}`, windowSeconds);
}

const LOGIN_WINDOW = 10 * 60;

/** Only failed logins count, so a correct password never locks anyone out. */
export async function loginRateLimit(email: string, ip: string | null) {
  const emailRate = await peekRateLimit(`login:email:${email}`, 5, LOGIN_WINDOW);
  if (!emailRate.ok) return emailRate;

  if (ip) {
    const ipRate = await peekRateLimit(`login:ip:${ip}`, 20, LOGIN_WINDOW);
    if (!ipRate.ok) return ipRate;
  }

  return { ok: true as const };
}

export async function recordFailedLogin(email: string, ip: string | null) {
  await recordAttempt(`login:email:${email}`, LOGIN_WINDOW);
  if (ip) await recordAttempt(`login:ip:${ip}`, LOGIN_WINDOW);
}

export async function registerRateLimit(email: string, ip: string | null) {
  const emailRate = await checkRateLimit(`register:email:${email}`, 3, 10 * 60);
  if (!emailRate.ok) return emailRate;

  if (ip) {
    const ipRate = await checkRateLimit(`register:ip:${ip}`, 5, 10 * 60);
    if (!ipRate.ok) return ipRate;
  }

  return { ok: true as const };
}

export async function uploadPreRateLimit(userId: number) {
  return checkRateLimit(`upload:pre:${userId}`, 20, 5 * 60);
}

export async function uploadRateLimit(userId: number, assetType: string) {
  return checkRateLimit(`upload:${userId}:${assetType}`, 10, 5 * 60);
}

export async function commentRateLimit(userId: number) {
  return checkRateLimit(`comment:${userId}`, 5, 2 * 60);
}

export async function profileUpdateRateLimit(userId: number) {
  return checkRateLimit(`profile_update:${userId}`, 100, 60);
}

export async function checkAvailabilityRateLimit(ip: string | null) {
  if (!ip) return { ok: true as const };
  return checkRateLimit(`check:${ip}`, 10, 60);
}

export async function discordOAuthRateLimit(ip: string | null) {
  if (!ip) return { ok: true as const };
  return checkRateLimit(`discord_oauth:${ip}`, 10, 10 * 60);
}

export async function commentLikeRateLimit(userId: number) {
  return checkRateLimit(`comment_like:${userId}`, 20, 60);
}
