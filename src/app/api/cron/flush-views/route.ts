import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { Redis } from "@upstash/redis";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const SET_KEY = 'profiles_with_pending_views';

// Write up to this many profiles per DB transaction. Batching turns N
// per-profile transactions into N/500, so a viral spike stays well under the
// 60s maxDuration. Chunking (instead of one giant statement) keeps each
// transaction small and lets a failed chunk be retried on the next run.
const BATCH_SIZE = 500;

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

    let hgetResults: (Record<string, string> | null)[] | null = null;
    try {
      const pipe = redis.pipeline();
      for (const idStr of profileIds) {
        pipe.hgetall(`views_pending:${idStr}`);
      }
      hgetResults = (await pipe.exec()) as (Record<string, string> | null)[];
    } catch {
      hgetResults = null;
    }

    const pending: {
      profileId: number;
      total: number;
      ios: number;
      android: number;
      windows: number;
      mac: number;
      other: number;
    }[] = [];

    for (let i = 0; i < profileIds.length; i++) {
      const idStr = profileIds[i];
      const profileId = parseInt(idStr);
      if (isNaN(profileId)) continue;

      const redisKey = `views_pending:${profileId}`;
      let data: Record<string, string | number> | null = null;
      let legacyCount = 0;

      const raw = hgetResults ? hgetResults[i] : null;
      if (raw && Object.keys(raw).length > 0) {
        data = raw;
      } else {
        try {
          const individual = (await redis.hgetall(redisKey)) as Record<string, string> | null;
          if (individual && Object.keys(individual).length > 0) {
            data = individual;
          }
        } catch {
          // WRONGTYPE — this is a legacy plain-string key.
        }

        if (!data) {
          try {
            const legacyVal = await redis.get<string | number>(redisKey);
            if (legacyVal) legacyCount = typeof legacyVal === 'number' ? legacyVal : parseInt(String(legacyVal));
          } catch {
            // ignore
          }
        }
      }

      if (!data && legacyCount === 0) {
        // Nothing pending — clean up and remove from the set.
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

      if (total <= 0) {
        // Key exists but nothing to flush — clean up and remove from the set.
        await redis.del(redisKey);
        await redis.srem(SET_KEY, idStr);
        continue;
      }

      pending.push({ profileId, total, ios, android, windows, mac, other });
    }

    if (pending.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending views to flush.' });
    }

    let totalFlushed = 0;

    // ── Batch write: one transaction per chunk instead of one per profile ────
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const chunk = pending.slice(i, i + BATCH_SIZE);

      try {
        // Guard: verify profiles exist before touching the DB.
        // Prevents FK-violation crashes from poisoned Redis keys.
        const rows = await db.execute(
          sql`SELECT id FROM users WHERE id IN (${sql.join(chunk.map(e => sql`${e.profileId}`), sql`, `)})`
        );
        const resultRows = (rows as unknown as [Array<{ id: number | string }>])[0];
        const existing = new Set((resultRows || []).map(r => Number(r.id)));

        const validChunk = chunk.filter(e => existing.has(e.profileId));
        const removedChunk = chunk.filter(e => !existing.has(e.profileId));

        if (validChunk.length > 0) {
          // UPDATE + INSERT run in one transaction so a retry can never
          // double-count (both succeed or both fail together).
          await db.transaction(async (tx) => {
            // One conditional UPDATE covers the whole chunk instead of N updates.
            const caseClause = sql.join(
              validChunk.map(e => sql`WHEN ${e.profileId} THEN ${e.total}`),
              sql` `
            );
            await tx.execute(sql`
              UPDATE users
              SET views = views + CASE id ${caseClause} END
              WHERE id IN (${sql.join(validChunk.map(e => sql`${e.profileId}`), sql`, `)})
            `);

            // One multi-row UPSERT covers the whole chunk instead of N upserts.
            const values = sql.join(
              validChunk.map(e => sql`(${e.profileId}, UTC_DATE(), ${e.total}, ${e.ios}, ${e.android}, ${e.windows}, ${e.mac}, ${e.other})`),
              sql`, `
            );
            await tx.execute(sql`
              INSERT INTO profile_views (user_id, view_date, count, ios_count, android_count, windows_count, mac_count, other_count)
              VALUES ${values}
              ON DUPLICATE KEY UPDATE
                count = count + VALUES(count),
                ios_count = ios_count + VALUES(ios_count),
                android_count = android_count + VALUES(android_count),
                windows_count = windows_count + VALUES(windows_count),
                mac_count = mac_count + VALUES(mac_count),
                other_count = other_count + VALUES(other_count)
            `);
          });

          totalFlushed += validChunk.reduce((sum, e) => sum + e.total, 0);
        }

        // Fully processed (written, or profile removed) — now safe to drop
        // from Redis in one pipeline.
        const cleanupPipe = redis.pipeline();
        for (const e of [...validChunk, ...removedChunk]) {
          cleanupPipe.del(`views_pending:${e.profileId}`);
          cleanupPipe.srem(SET_KEY, String(e.profileId));
        }
        await cleanupPipe.exec();
      } catch (err) {
        // Leave this chunk's keys AND set membership intact so the next
        // cron run retries it. No views are lost.
        console.error(`[cron] Flush failed for chunk starting at profile ${chunk[0]?.profileId}, will retry:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Flushed ${totalFlushed} views across ${pending.length} profiles.`
    });

  } catch (error) {
    console.error('[cron] Bulk flush failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = verifySignatureAppRouter(handler);
export const POST = verifySignatureAppRouter(handler);
