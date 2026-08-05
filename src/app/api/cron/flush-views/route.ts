import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { Redis } from "@upstash/redis";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const SET_KEY = 'profiles_with_pending_views';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function handler() {
  try {
    const profileIds = await redis.smembers('profiles_with_pending_views');
    
    if (!profileIds || profileIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending views to flush.' });
    }

    let totalFlushed = 0;

    for (const idStr of profileIds) {
      const profileId = parseInt(idStr);
      if (isNaN(profileId)) continue;

      // Each profile is processed independently — a failure here
      // (FK constraint, transient error, etc.) must not abort the entire batch.
      try {
        const redisKey = `views_pending:${profileId}`;
        let data: Record<string, string | number> | null = null;
        let legacyCount = 0;

        try {
          data = await redis.hgetall(redisKey);
        } catch {
          const legacyVal = await redis.get<string | number>(redisKey);
          if (legacyVal) legacyCount = typeof legacyVal === 'number' ? legacyVal : parseInt(String(legacyVal));
        }

        if (!data && legacyCount === 0) {
          // Nothing pending — clean up and remove from the set.
          await redis.del(redisKey);
          await redis.srem(SET_KEY, idStr);
          continue;
        }

        // Guard: verify profile exists before touching the DB.
        // Prevents FK-violation crashes from poisoned Redis keys.
        const rows = await db.execute(
          sql`SELECT id FROM users WHERE id = ${profileId} LIMIT 1`
        );
        const resultRows = (rows as unknown as [unknown[]])[0];
        if (!Array.isArray(resultRows) || resultRows.length === 0) {
          // Profile no longer exists — nothing to flush. Clean up and remove.
          await redis.del(redisKey);
          await redis.srem(SET_KEY, idStr);
          continue;
        }

        const total = legacyCount > 0 ? legacyCount : parseInt(String(data?.total || '0'));
        const ios = parseInt(String(data?.ios || '0'));
        const android = parseInt(String(data?.android || '0'));
        const windows = parseInt(String(data?.windows || '0'));
        const mac = parseInt(String(data?.mac || '0'));
        const other = parseInt(String(data?.other || '0'));

        if (total > 0) {
          // UPDATE + INSERT run in one transaction so a retry can never
          // double-count (both succeed or both fail together).
          await db.transaction(async (tx) => {
            await tx.execute(sql`
              UPDATE users
              SET views = views + ${total}
              WHERE id = ${profileId}
            `);

            await tx.execute(sql`
              INSERT INTO profile_views (user_id, view_date, count, ios_count, android_count, windows_count, mac_count, other_count)
              VALUES (${profileId}, UTC_DATE(), ${total}, ${ios}, ${android}, ${windows}, ${mac}, ${other})
              ON DUPLICATE KEY UPDATE
                count = count + ${total},
                ios_count = ios_count + ${ios},
                android_count = android_count + ${android},
                windows_count = windows_count + ${windows},
                mac_count = mac_count + ${mac},
                other_count = other_count + ${other}
            `);
          });

          totalFlushed += total;
        }

        // Fully processed — now safe to drop from the set.
        await redis.del(redisKey);
        await redis.srem(SET_KEY, idStr);
      } catch (err) {
        // Leave this profile's key AND set membership intact so the next
        // cron run retries it. No views are lost.
        console.error(`[cron] Flush failed for profile ${idStr}, will retry:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Flushed ${totalFlushed} views across ${profileIds.length} profiles.` 
    });

  } catch (error) {
    console.error('[cron] Bulk flush failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = verifySignatureAppRouter(handler);
export const POST = verifySignatureAppRouter(handler);
