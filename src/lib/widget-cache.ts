import { redis } from "@/lib/redis";

/** Every widget data cache shares this window. */
export const WIDGET_CACHE_TTL_SECONDS = 3600;

/**
 * Builds a Redis key for a widget's cached payload.
 *
 * One key per distinct target (username, repo, Spotify type+id, ...) so each
 * entry keeps its own independent TTL — a single shared key would expire every
 * profile at once. Namespaced under `widget:` so they group together in Redis.
 */
export function widgetCacheKey(platform: string, ...parts: string[]): string {
  return ["widget", platform, ...parts.map((p) => p.toLowerCase())].join(":");
}

/**
 * Returns cached JSON for `key`, or null on a miss.
 * Cache failures are non-fatal — the caller just refetches.
 */
export async function readWidgetCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch {
    // Cache is best-effort only.
  }
  return null;
}

/** Stores `data` under `key`. Failures are ignored. */
export async function writeWidgetCache(
  key: string,
  data: unknown,
  ttlSeconds: number = WIDGET_CACHE_TTL_SECONDS
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch {
    // Cache is best-effort only.
  }
}

/**
 * Read-through cache wrapper: returns the cached value when present, otherwise
 * runs `fetcher` and caches a non-null result.
 */
export async function withWidgetCache<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  ttlSeconds: number = WIDGET_CACHE_TTL_SECONDS
): Promise<T | null> {
  const cached = await readWidgetCache<T>(key);
  if (cached) return cached;

  const fresh = await fetcher();
  if (fresh !== null && fresh !== undefined) {
    await writeWidgetCache(key, fresh, ttlSeconds);
  }
  return fresh;
}
