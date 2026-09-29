import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redis } from '@/lib/redis';
import { LIVE_STATS_CACHE_TTL, liveStatsCacheKey } from '@/lib/live-stats-cache';

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

    if (username.length > 32 || !/^[a-z0-9_.]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    const cacheKey = liveStatsCacheKey(username);

    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        return NextResponse.json(parsed, {
          headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60' },
        });
      } catch {
        await redis.del(cacheKey);
      }
    }

    const stats = await getLiveStatsByUsername(username);

    if (!stats) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const responseData = {
      views: stats.views,
      likesCount: stats.likesCount,
      dislikesCount: stats.dislikesCount,
    };

    await redis.set(cacheKey, JSON.stringify(responseData), "EX", LIVE_STATS_CACHE_TTL);

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60' },
    });
  } catch (error) {
    console.error('[live-data] Error fetching live data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
