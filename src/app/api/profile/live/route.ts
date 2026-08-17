import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redis } from '@/lib/redis';

const CACHE_TTL = 60; // seconds
const CACHE_PREFIX = 'live:';

async function getLiveStatsByUsername(username: string) {
  const result = await db
    .select({
      id: users.id,
      views: users.views,
      likesCount: users.likesCount,
      dislikesCount: users.dislikesCount,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim().toLowerCase();

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    // Validate username format to prevent injection/abuse
    if (username.length > 32 || !/^[a-z0-9_.]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    const cacheKey = `${CACHE_PREFIX}${username}`;

    // 1. Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json(parsed, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      });
    }

    // 2. Cache miss - fetch from DB
    const stats = await getLiveStatsByUsername(username);

    if (!stats) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const responseData = {
      views: stats.views,
      likesCount: stats.likesCount,
      dislikesCount: stats.dislikesCount,
    };

    // 3. Store in Redis with TTL
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", CACHE_TTL);

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('[live-data] Error fetching live data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper to invalidate cache when profile stats change (accepts username or numeric id)
export async function invalidateLiveStatsCache(identifier: string | number) {
  if (typeof identifier === 'string') {
    await redis.del(`${CACHE_PREFIX}${identifier.toLowerCase()}`);
    return;
  }

  // If numeric ID passed, find username to bust key
  const [user] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, identifier))
    .limit(1);

  if (user?.username) {
    await redis.del(`${CACHE_PREFIX}${user.username.toLowerCase()}`);
  }
}
