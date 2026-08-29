import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profileFeedback } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { decrypt } from '@/lib/server/security/jwt';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = parseInt(searchParams.get('profileId') ?? '', 10);

    if (!Number.isInteger(profileId) || profileId < 1) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400, headers: NO_STORE });
    }

    const sessionCookie = request.cookies.get('iuno_session')?.value;
    const payload = sessionCookie ? await decrypt(sessionCookie) : undefined;
    const rawId = payload ? Number(payload.userId) : NaN;
    const viewerId = Number.isInteger(rawId) && rawId > 0 ? rawId : null;

    // Self-view still reports its feedback. Liking your own profile is allowed, so
    // short-circuiting here left the buttons unaware of a like the viewer had
    // already given, and they kept rendering as un-liked.
    if (!viewerId) {
      return NextResponse.json({ viewerId, feedback: null }, { headers: NO_STORE });
    }

    const rows = await db
      .select({ type: profileFeedback.type })
      .from(profileFeedback)
      .where(and(
        eq(profileFeedback.receiverId, profileId),
        eq(profileFeedback.giverId, viewerId),
      ))
      .limit(1);

    const type = rows[0]?.type;
    const feedback = type === 'like' || type === 'dislike' ? type : null;

    return NextResponse.json({ viewerId, feedback }, { headers: NO_STORE });
  } catch (error) {
    console.error('[profile/me] failed:', error);
    return NextResponse.json({ viewerId: null, feedback: null }, { headers: NO_STORE });
  }
}
