import { NextResponse } from 'next/server';
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId } = body;

    if (!profileId || typeof profileId !== 'number') {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
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
