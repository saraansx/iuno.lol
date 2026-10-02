import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';
import { isAuthorizedCron } from '@/lib/cron-auth';

const SET_KEY = 'profiles_with_pending_views';

const BATCH_SIZE = 500;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handler() {
  try {
    let totalFlushed = 0;
    let totalProfiles = 0;
    let cursor = '0';

    do {
      const [nextCursor, ids] = await redis.sscan(SET_KEY, cursor, 'COUNT', BATCH_SIZE);
      cursor = nextCursor;
      if (ids.length === 0) continue;

      const profileIds = [...new Set(ids)];

      const grab = redis.multi();
      for (const idStr of profileIds) {
        const key = `views_pending:${idStr}`;
        grab.hgetall(key);
        grab.get(key);
        grab.del(key);
        grab.srem(SET_KEY, idStr);
      }
      const grabbed = (await grab.exec()) || [];

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
        const profileId = parseInt(profileIds[i]);
        if (isNaN(profileId)) continue;

        const [hashErr, hashRaw] = grabbed[i * 4] ?? [null, null];
        const [strErr, strRaw] = grabbed[i * 4 + 1] ?? [null, null];

        const data = !hashErr && hashRaw && Object.keys(hashRaw as object).length > 0
          ? (hashRaw as Record<string, string>)
          : null;
        const legacyCount = !strErr && strRaw ? parseInt(String(strRaw)) : 0;

        const total = data ? parseInt(String(data.total || '0')) : legacyCount;
        if (!total || total <= 0) continue;

        pending.push({
          profileId,
          total,
          ios: parseInt(String(data?.ios || '0')),
          android: parseInt(String(data?.android || '0')),
          windows: parseInt(String(data?.windows || '0')),
          mac: parseInt(String(data?.mac || '0')),
          other: parseInt(String(data?.other || '0')),
        });
      }

      if (pending.length === 0) continue;

      for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        const chunk = pending.slice(i, i + BATCH_SIZE);

        try {
          const rows = await db.execute(
            sql`SELECT id FROM users WHERE id IN (${sql.join(chunk.map(e => sql`${e.profileId}`), sql`, `)})`
          );
          const resultRows = (rows as unknown as [Array<{ id: number | string }>])[0];
          const existing = new Set((resultRows || []).map(r => Number(r.id)));

          const validChunk = chunk.filter(e => existing.has(e.profileId));

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

              const hourly = sql.join(
                validChunk.map(e => sql`(${e.profileId}, DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%d %H:00:00'), ${e.total})`),
                sql`, `
              );
              await tx.execute(sql`
                INSERT INTO profile_views_hourly (user_id, view_hour, count)
                VALUES ${hourly}
                ON DUPLICATE KEY UPDATE count = count + VALUES(count)
              `);
            });

            totalFlushed += validChunk.reduce((sum, e) => sum + e.total, 0);
          }
        } catch (err) {
          console.error(`[cron] Flush failed for chunk starting at profile ${chunk[0]?.profileId}, restoring to Redis:`, err);
          try {
            const restore = redis.pipeline();
            for (const e of chunk) {
              const key = `views_pending:${e.profileId}`;
              restore.hincrby(key, 'total', e.total);
              if (e.ios) restore.hincrby(key, 'ios', e.ios);
              if (e.android) restore.hincrby(key, 'android', e.android);
              if (e.windows) restore.hincrby(key, 'windows', e.windows);
              if (e.mac) restore.hincrby(key, 'mac', e.mac);
              if (e.other) restore.hincrby(key, 'other', e.other);
              restore.sadd(SET_KEY, String(e.profileId));
            }
            await restore.exec();
          } catch (restoreErr) {
            console.error('[cron] Could not restore pending views to Redis — these views are lost:', restoreErr);
          }
        }
      }

      totalProfiles += pending.length;
    } while (cursor !== '0');

    if (totalProfiles === 0) {
      return NextResponse.json({ success: true, message: 'No pending views to flush.' });
    }

    return NextResponse.json({
      success: true,
      message: `Flushed ${totalFlushed} views across ${totalProfiles} profiles.`
    });

  } catch (error) {
    console.error('[cron] Bulk flush failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return new Response('Unauthorized', { status: 401 });
  return handler();
}

export async function POST(request: Request) {
  if (!isAuthorizedCron(request)) return new Response('Unauthorized', { status: 401 });
  return handler();
}
