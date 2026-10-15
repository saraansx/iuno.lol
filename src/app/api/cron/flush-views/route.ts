import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { acquireCronLock } from '@/lib/cron-lock';
import { revalidateProfile } from '@/app/[username]/profile-data';
import { liveStatsCacheKey } from '@/lib/live-stats-cache';

const SET_KEY = 'profiles_with_pending_views';

const BATCH_SIZE = 500;

const LOCK_TTL_SECONDS = 120;

const TIME_BUDGET_MS = 50_000;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handler() {
  const startedAt = Date.now();
  const lock = await acquireCronLock('flush-views', LOCK_TTL_SECONDS);
  if (!lock.acquired) {
    return NextResponse.json({ success: true, message: 'Flush already running; skipped.' });
  }

  try {
    let totalFlushed = 0;
    let totalProfiles = 0;
    let cursor = '0';
    let stoppedEarly = false;
    const changedUsernames = new Set<string>();

    do {
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        stoppedEarly = true;
        break;
      }
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

      const grabCountry = redis.multi();
      for (const idStr of profileIds) {
        grabCountry.hgetall(`views_country_pending:${idStr}`);
        grabCountry.del(`views_country_pending:${idStr}`);
      }
      const grabbedCountry = (await grabCountry.exec()) || [];
      const countryByProfile = new Map<number, Record<string, number>>();
      for (let i = 0; i < profileIds.length; i++) {
        const profileId = parseInt(profileIds[i]);
        if (isNaN(profileId)) continue;
        const [cErr, cRaw] = grabbedCountry[i * 2] ?? [null, null];
        if (cErr || !cRaw || typeof cRaw !== 'object') continue;
        const counts: Record<string, number> = {};
        for (const [code, val] of Object.entries(cRaw as Record<string, string>)) {
          const n = parseInt(String(val));
          if (/^[A-Z]{2}$/.test(code) && n > 0) counts[code] = n;
        }
        if (Object.keys(counts).length > 0) countryByProfile.set(profileId, counts);
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
            sql`SELECT id, username FROM users WHERE id IN (${sql.join(chunk.map(e => sql`${e.profileId}`), sql`, `)})`
          );
          const resultRows = (rows as unknown as [Array<{ id: number | string; username: string }>])[0];
          const usernameById = new Map<number, string>(
            (resultRows || []).map(r => [Number(r.id), String(r.username)]),
          );
          const existing = new Set(usernameById.keys());

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

            const countryTuples = validChunk.flatMap((e) => {
              const counts = countryByProfile.get(e.profileId);
              if (!counts) return [];
              return Object.entries(counts).map(([code, n]) => sql`(${e.profileId}, ${code}, ${n})`);
            });
            if (countryTuples.length > 0) {
              try {
                await db.execute(sql`
                  INSERT INTO profile_view_countries (user_id, country, count)
                  VALUES ${sql.join(countryTuples, sql`, `)}
                  ON DUPLICATE KEY UPDATE count = count + VALUES(count)
                `);
              } catch (countryErr) {
                console.error('[cron] Country flush failed (views already saved); dropping this batch of country counts:', countryErr);
              }
            }

            for (const e of validChunk) {
              const name = usernameById.get(e.profileId);
              if (name) changedUsernames.add(name);
            }
          }
        } catch (err) {
          console.error(`[cron] Flush failed for chunk starting at profile ${chunk[0]?.profileId}, restoring to Redis:`, err);
          try {
            const restore = redis.pipeline();
            const safe = (n: number) => Number.isInteger(n) && n > 0;
            for (const e of chunk) {
              const key = `views_pending:${e.profileId}`;
              if (safe(e.total)) restore.hincrby(key, 'total', e.total);
              if (safe(e.ios)) restore.hincrby(key, 'ios', e.ios);
              if (safe(e.android)) restore.hincrby(key, 'android', e.android);
              if (safe(e.windows)) restore.hincrby(key, 'windows', e.windows);
              if (safe(e.mac)) restore.hincrby(key, 'mac', e.mac);
              if (safe(e.other)) restore.hincrby(key, 'other', e.other);
              const countries = countryByProfile.get(e.profileId);
              if (countries) {
                const ckey = `views_country_pending:${e.profileId}`;
                for (const [code, n] of Object.entries(countries)) {
                  if (safe(n)) restore.hincrby(ckey, code, n);
                }
              }
              if (safe(e.total)) restore.sadd(SET_KEY, String(e.profileId));
            }
            await restore.exec();
          } catch (restoreErr) {
            console.error('[cron] Could not restore pending views to Redis — these views are lost:', restoreErr);
          }
        }
      }

      totalProfiles += pending.length;
    } while (cursor !== '0' && Date.now() - startedAt <= TIME_BUDGET_MS);

    if (totalProfiles === 0) {
      return NextResponse.json({
        success: true,
        message: stoppedEarly ? 'Time budget reached; remaining views deferred to next run.' : 'No pending views to flush.',
      });
    }

    if (changedUsernames.size > 0) {
      try {
        for (const name of changedUsernames) revalidateProfile(name);
      } catch (revalErr) {
        console.error('[cron] Failed to revalidate profiles after view flush:', revalErr);
      }
      try {
        const pipe = redis.pipeline();
        for (const name of changedUsernames) pipe.del(liveStatsCacheKey(name));
        await pipe.exec();
      } catch (liveErr) {
        console.error('[cron] Failed to clear live-stats cache after view flush:', liveErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Flushed ${totalFlushed} views across ${totalProfiles} profiles.${stoppedEarly ? ' Stopped at time budget; rest deferred to next run.' : ''}`
    });

  } catch (error) {
    console.error('[cron] Bulk flush failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await lock.release();
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
