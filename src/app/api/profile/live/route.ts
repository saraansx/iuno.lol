import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redis } from '@/lib/redis';

const CACHE_TTL = 60; // seconds
const CACHE_PREFIX = 'live:';

async function getLiveStatsFromDB(profileId: number) {
  const result = await db
    .select({
      views: users.views,
      likesCount: users.likesCount,
      dislikesCount: users.dislikesCount,
    })
    .from(users)
    .where(eq(users.id, profileId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileIdStr = searchParams.get('profileId');

    if (!profileIdStr) {
      return NextResponse.json({ error: 'Missing profileId' }, { status: 400 });
    }

    const profileId = parseInt(profileIdStr, 10);

    if (isNaN(profileId)) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    const cacheKey = `${CACHE_PREFIX}${profileId}`;

    // 1. Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. Cache miss - fetch from DB
    const stats = await getLiveStatsFromDB(profileId);

    if (!stats) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Store in Redis with TTL (auto-expires, no cleanup needed)
    await redis.set(cacheKey, stats, { ex: CACHE_TTL });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[live-data] Error fetching live data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper to invalidate cache when profile stats change
export async function invalidateLiveStatsCache(profileId: number) {
  const cacheKey = `${CACHE_PREFIX}${profileId}`;
  await redis.del(cacheKey);
}
