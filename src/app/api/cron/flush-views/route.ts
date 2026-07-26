import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { Redis } from "@upstash/redis";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function handler(request: Request) {
  try {
    const profileIds = await redis.smembers('profiles_with_pending_views');
    
    if (!profileIds || profileIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending views to flush.' });
    }

    let totalFlushed = 0;

    for (const idStr of profileIds) {
      const profileId = parseInt(idStr);
      if (isNaN(profileId)) continue;
      
      const redisKey = `views_pending:${profileId}`;
      const viewsStr = await redis.get<string | number>(redisKey);
      const viewsToPush = typeof viewsStr === 'number' ? viewsStr : parseInt(viewsStr || '0');

      if (viewsToPush > 0) {
        await db.execute(sql`
          UPDATE users 
          SET views = views + ${viewsToPush} 
          WHERE id = ${profileId}
        `);
        totalFlushed += viewsToPush;
      }
      
      // Completely delete their counter so it disappears from Redis
      await redis.del(redisKey);
    }

    await redis.del('profiles_with_pending_views');

    return NextResponse.json({ 
      success: true, 
      message: `Flushed ${totalFlushed} views across ${profileIds.length} profiles.` 
    });

  } catch (error: any) {
    console.error('[cron] Bulk flush failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = verifySignatureAppRouter(handler);
export const POST = verifySignatureAppRouter(handler);
