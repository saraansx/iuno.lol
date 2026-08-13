import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profileFeedback } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { decrypt } from '@/lib/server/security/jwt';

// Per-viewer state for a profile: whether the caller is signed in and whether
// they've already liked/disliked this profile. This is unique to each viewer,
// so the response is never cached (no-store) and never shared — keeping the
// public profile page (/[username]) fully CDN-cacheable.
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = parseInt(searchParams.get('profileId') ?? '', 10);

    if (!Number.isInteger(profileId) || profileId < 1) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400, headers: NO_STORE });
    }

    // Lightweight cookie decode (same pattern as /api/track-view). Full session
    // verification isn't needed here: this only drives UI state — the actual
    // vote goes through submitFeedbackAction, which authorizes server-side.
    const sessionCookie = request.cookies.get('iuno_session')?.value;
    const payload = sessionCookie ? await decrypt(sessionCookie) : undefined;
    const rawId = payload ? Number(payload.userId) : NaN;
    const viewerId = Number.isInteger(rawId) && rawId > 0 ? rawId : null;

    // Signed out, or the owner viewing their own profile → no feedback row.
    if (!viewerId || viewerId === profileId) {
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
    // Fail open to the signed-out state — the page still renders, voting just
    // prompts a sign-in until the next successful fetch.
    return NextResponse.json({ viewerId: null, feedback: null }, { headers: NO_STORE });
  }
}
