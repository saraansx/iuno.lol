import { redis } from "@/lib/redis";

const WIDGET_CACHE_TTL_SECONDS = 12 * 60 * 60;

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
  } catch (err) {
    console.warn(`[widget-cache] read failed for ${key}:`, err instanceof Error ? err.message : err);
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
  } catch (err) {
    console.warn(`[widget-cache] write failed for ${key}:`, err instanceof Error ? err.message : err);
  }
}

const inFlight = new Map<string, Promise<unknown>>();

export async function withWidgetCache<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  ttlSeconds: number = WIDGET_CACHE_TTL_SECONDS
): Promise<T | null> {
  const cached = await readWidgetCache<T>(key);
  if (cached) return cached;

  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T | null>;

  const run = (async () => {
    try {
      const filled = await readWidgetCache<T>(key);
      if (filled) return filled;

      const fresh = await fetcher();
      if (fresh !== null && fresh !== undefined) {
        await writeWidgetCache(key, fresh, ttlSeconds);
      }
      return fresh;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, run);
  return run as Promise<T | null>;
}
