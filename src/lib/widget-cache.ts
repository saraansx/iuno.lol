import { redis } from "@/lib/redis";

export const WIDGET_CACHE_TTL_SECONDS = 12 * 60 * 60;

/**
 * Second argument for a successful widget JSON response. Lets Cloudflare hold
 * it at the edge for an hour while browsers revalidate every time, so a stale
 * widget clears on reload. Only put this on success paths — a cached 404 would
 * outlive the profile edit that fixed it.
 */
export const WIDGET_EDGE_CACHE = {
  headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" },
} as const;

export function widgetCacheKey(platform: string, ...parts: string[]): string {
  return ["widget", platform, ...parts.map((p) => p.toLowerCase())].join(":");
}

export async function readWidgetCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch {
  }
  return null;
}

export async function writeWidgetCache(
  key: string,
  data: unknown,
  ttlSeconds: number = WIDGET_CACHE_TTL_SECONDS
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch {
  }
}

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
