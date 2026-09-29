import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export const LIVE_STATS_CACHE_TTL = 60;
const LIVE_STATS_CACHE_PREFIX = 'live:';

export function liveStatsCacheKey(username: string) {
  return `${LIVE_STATS_CACHE_PREFIX}${username.toLowerCase()}`;
}

export async function invalidateLiveStatsCache(identifier: string | number) {
  if (typeof identifier === 'string') {
    await redis.del(liveStatsCacheKey(identifier));
    return;
  }

  const [user] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, identifier))
    .limit(1);

  if (user?.username) {
    await redis.del(liveStatsCacheKey(user.username));
  }
}
