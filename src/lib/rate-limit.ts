import { redis } from "@/lib/redis";

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

export function checkRateLimit(key: string, maxAttempts: number, windowSeconds: number) {
  return evalLimit(key, maxAttempts, windowSeconds, true);
}

export function peekRateLimit(key: string, maxAttempts: number, windowSeconds: number) {
  return evalLimit(key, maxAttempts, windowSeconds, false);
}

export async function recordAttempt(key: string, windowSeconds: number) {
  const now = Date.now();
  await redis.zadd(`rl:w:${key}`, now, `${now}:${Math.random()}`);
  await redis.expire(`rl:w:${key}`, windowSeconds);
}

const UNIDENTIFIED_IP_KEY = "noip";
const UNIDENTIFIED_IP_FACTOR = 5;
const UNIDENTIFIED_IP_CEILING = 300;

export function ipBucket(prefix: string, ip: string | null, maxPerIp: number) {
  if (ip) return { key: `${prefix}:${ip}`, max: maxPerIp };

  return {
    key: `${prefix}:${UNIDENTIFIED_IP_KEY}`,
    max: Math.min(maxPerIp * UNIDENTIFIED_IP_FACTOR, UNIDENTIFIED_IP_CEILING),
  };
}

const LOGIN_WINDOW = 10 * 60;
const LOGIN_IP_MAX = 20;
const REGISTER_IP_MAX = 5;

function emailKey(email: string) {
  return email.toLowerCase().trim();
}

export async function loginRateLimit(email: string, ip: string | null) {
  const emailRate = await peekRateLimit(`login:email:${emailKey(email)}`, 5, LOGIN_WINDOW);
  if (!emailRate.ok) return emailRate;

  const bucket = ipBucket("login:ip", ip, LOGIN_IP_MAX);
  return peekRateLimit(bucket.key, bucket.max, LOGIN_WINDOW);
}

export async function recordFailedLogin(email: string, ip: string | null) {
  await recordAttempt(`login:email:${emailKey(email)}`, LOGIN_WINDOW);
  await recordAttempt(ipBucket("login:ip", ip, LOGIN_IP_MAX).key, LOGIN_WINDOW);
}

export async function registerRateLimit(email: string, ip: string | null) {
  const emailRate = await checkRateLimit(`register:email:${emailKey(email)}`, 3, 10 * 60);
  if (!emailRate.ok) return emailRate;

  const bucket = ipBucket("register:ip", ip, REGISTER_IP_MAX);
  return checkRateLimit(bucket.key, bucket.max, 10 * 60);
}

export async function uploadPreRateLimit(userId: number) {
  return checkRateLimit(`upload:pre:${userId}`, 20, 5 * 60);
}

export async function uploadRateLimit(userId: number, assetType: string) {
  return checkRateLimit(`upload:${userId}:${assetType}`, 10, 5 * 60);
}

export async function imageHostUploadRateLimit(userId: number) {
  return checkRateLimit(`ih:upload:${userId}`, 60, 5 * 60);
}

export async function imageHostMutateRateLimit(userId: number) {
  return checkRateLimit(`ih:mutate:${userId}`, 120, 5 * 60);
}

export async function commentRateLimit(userId: number) {
  return checkRateLimit(`comment:${userId}`, 5, 2 * 60);
}

export async function profileUpdateRateLimit(userId: number) {
  return checkRateLimit(`profile_update:${userId}`, 100, 60);
}

export async function checkAvailabilityRateLimit(ip: string | null) {
  const bucket = ipBucket("check", ip, 10);
  return checkRateLimit(bucket.key, bucket.max, 60);
}

export async function discordOAuthRateLimit(ip: string | null) {
  const bucket = ipBucket("discord_oauth", ip, 10);
  return checkRateLimit(bucket.key, bucket.max, 10 * 60);
}

export async function commentLikeRateLimit(userId: number) {
  return checkRateLimit(`comment_like:${userId}`, 20, 60);
}

const CHECKOUT_ORDER_WINDOW = 60;
const CHECKOUT_ORDER_USER_MAX = 5;
const CHECKOUT_ORDER_IP_MAX = 15;

// Creating an order hits Razorpay's API and writes nothing we can't afford to
// throw away, so cap it tightly: 5/min per user, plus a per-IP ceiling so a
// batch of throwaway accounts from one machine can't get around the per-user cap.
export async function checkoutOrderRateLimit(userId: number, ip: string | null) {
  const userRate = await checkRateLimit(
    `checkout:order:user:${userId}`,
    CHECKOUT_ORDER_USER_MAX,
    CHECKOUT_ORDER_WINDOW,
  );
  if (!userRate.ok) return userRate;

  const bucket = ipBucket("checkout:order:ip", ip, CHECKOUT_ORDER_IP_MAX);
  return checkRateLimit(bucket.key, bucket.max, CHECKOUT_ORDER_WINDOW);
}
