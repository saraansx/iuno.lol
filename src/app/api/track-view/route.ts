import { NextResponse } from 'next/server';
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, fingerprint } = body;

    if (!profileId || typeof profileId !== 'number') {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const clientFingerprint = fingerprint || 'no_fp';

    const visitorHash = Array.from(ip + userAgent + clientFingerprint)
      .reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0)
      .toString(36);

    const lockKey = `view_lock:${profileId}:${visitorHash}`;
    const acquiredLock = await redis.set(lockKey, 1, { ex: 86400, nx: true });

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

  } catch (error: any) {
    console.error('[views] Redis tracking failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
