import { NextRequest, NextResponse } from 'next/server';
import { Redis } from "@upstash/redis";
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { decrypt } from '@/lib/server/security/jwt';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, fingerprint } = body;

    if (!profileId || typeof profileId !== 'number' || !Number.isInteger(profileId) || profileId < 1) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    // Owner viewing their own profile must not inflate their own view count.
    const sessionCookie = request.cookies.get('iuno_session')?.value;
    if (sessionCookie) {
      const payload = await decrypt(sessionCookie);
      if (payload && Number(payload.userId) === profileId) {
        return NextResponse.json({ success: true, message: 'Owner view ignored' });
      }
    }

    const existsCacheKey = `profile_exists:${profileId}`;
    const cached = await redis.get(existsCacheKey);
    if (cached === 'no') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    if (cached === null) {
      const rows = await db.execute(
        sql`SELECT id FROM users WHERE id = ${profileId} LIMIT 1`
      );
      const resultRows = (rows as unknown as [unknown[]])[0];
      if (!Array.isArray(resultRows) || resultRows.length === 0) {
        await redis.set(existsCacheKey, 'no', { ex: 600 });
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      await redis.set(existsCacheKey, 'yes', { ex: 300 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const clientFingerprint = fingerprint || 'no_fp';

    const baseString = String(clientFingerprint !== 'no_fp' ? clientFingerprint : ip + userAgent);
    const visitorHash = Array.from(baseString)
      .reduce((hash: number, char: string) => 0 | (31 * hash + char.charCodeAt(0)), 0)
      .toString(36);

    const lockKey = `view_lock:${profileId}:${visitorHash}`;
    const acquiredLock = await redis.set(lockKey, 1, { ex: 172800, nx: true });

    if (!acquiredLock) {
      return NextResponse.json({ success: true, message: 'Already viewed recently' });
    }

    const ua = userAgent.toLowerCase();
    let device = 'other';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      device = 'ios';
    } else if (ua.includes('android')) {
      device = 'android';
    } else if (ua.includes('windows')) {
      device = 'windows';
    } else if (ua.includes('macintosh') || ua.includes('mac os')) {
      device = 'mac';
    }

    const p = redis.pipeline();
    p.hincrby(`views_pending:${profileId}`, 'total', 1);
    p.hincrby(`views_pending:${profileId}`, device, 1);
    p.sadd('profiles_with_pending_views', profileId);
    await p.exec();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[views] Redis tracking failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
