import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

const getLiveStats = unstable_cache(
  async (profileId: number) => {
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
  },
  ['profile-live-stats'],
  { revalidate: 60, tags: ['profile-stats'] }
);

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

    const stats = await getLiveStats(profileId);

    if (!stats) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[live-data] Error fetching live data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
