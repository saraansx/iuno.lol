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

    await redis.incr(`views_pending:${profileId}`);
    
    await redis.sadd('profiles_with_pending_views', profileId);

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('[views] Redis tracking failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
