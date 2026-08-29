import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

const SET_KEY = 'profiles_with_pending_views';

const BATCH_SIZE = 500;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
      const rawExec = await pipe.exec();
      hgetResults = (rawExec || []).map((tuple) => {
        const [err, res] = tuple;
        if (err || !res) return null;
        return res as Record<string, string>;
      });
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
        }

        if (!data) {
          try {
            const legacyVal = await redis.get(redisKey);
            if (legacyVal) legacyCount = parseInt(String(legacyVal));
          } catch {
          }
        }
      }

      if (!data && legacyCount === 0) {
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

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const chunk = pending.slice(i, i + BATCH_SIZE);

      try {
        const rows = await db.execute(
          sql`SELECT id FROM users WHERE id IN (${sql.join(chunk.map(e => sql`${e.profileId}`), sql`, `)})`
        );
        const resultRows = (rows as unknown as [Array<{ id: number | string }>])[0];
        const existing = new Set((resultRows || []).map(r => Number(r.id)));

        const validChunk = chunk.filter(e => existing.has(e.profileId));
        const removedChunk = chunk.filter(e => !existing.has(e.profileId));

        if (validChunk.length > 0) {
          await db.transaction(async (tx) => {
            const caseClause = sql.join(
              validChunk.map(e => sql`WHEN ${e.profileId} THEN ${e.total}`),
              sql` `
            );
            await tx.execute(sql`
              UPDATE users
              SET views = views + CASE id ${caseClause} END
              WHERE id IN (${sql.join(validChunk.map(e => sql`${e.profileId}`), sql`, `)})
            `);

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

        const cleanupPipe = redis.pipeline();
        for (const e of [...validChunk, ...removedChunk]) {
          cleanupPipe.del(`views_pending:${e.profileId}`);
          cleanupPipe.srem(SET_KEY, String(e.profileId));
        }
        await cleanupPipe.exec();
      } catch (err) {
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
