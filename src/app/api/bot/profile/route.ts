import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, sql, desc, asc } from 'drizzle-orm';
import { readWidgetCache, writeWidgetCache } from '@/lib/widget-cache';

const BOT_PROFILE_TTL = 120;

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function checkSecret(req: Request): boolean {
  const secret = process.env.BOT_API_SECRET || '';
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

async function rankOf(table: 'users_views' | 'users_likes' | 'users_dislikes' | 'comments' | 'badges' | 'aliases', userId: number, score: number): Promise<number | null> {
  if (score <= 0) return null;
  try {
    let count = 0;
    if (table === 'users_views') {
      const [row] = await db
        .select({ c: sql<number>`COUNT(*)` })
        .from(schema.users)
        .where(sql`${schema.users.views} > ${score}`);
      count = Number(row?.c ?? 0);
    } else if (table === 'users_likes') {
      const [row] = await db
        .select({ c: sql<number>`COUNT(*)` })
        .from(schema.users)
        .where(sql`${schema.users.likesCount} > ${score}`);
      count = Number(row?.c ?? 0);
    } else if (table === 'users_dislikes') {
      const [row] = await db
        .select({ c: sql<number>`COUNT(*)` })
        .from(schema.users)
        .where(sql`${schema.users.dislikesCount} > ${score}`);
      count = Number(row?.c ?? 0);
    } else if (table === 'comments') {
      const rows = await db.execute(sql`
        SELECT COUNT(*) AS c FROM (
          SELECT profile_id AS pid, COUNT(*) AS s FROM profile_comments
          WHERE author_id <> profile_id
          GROUP BY profile_id HAVING s > ${score}
        ) t
      `);
      const r = (rows as unknown as [{ c: number | string }[]])[0]?.[0];
      count = Number(r?.c ?? 0);
    } else if (table === 'badges') {
      const rows = await db.execute(sql`
        SELECT COUNT(*) AS c FROM (
          SELECT user_id AS uid, COUNT(*) AS s FROM user_badges GROUP BY user_id HAVING s > ${score}
        ) t
      `);
      const r = (rows as unknown as [{ c: number | string }[]])[0]?.[0];
      count = Number(r?.c ?? 0);
    } else {
      const rows = await db.execute(sql`
        SELECT COUNT(*) AS c FROM (
          SELECT user_id AS uid, COUNT(*) AS s FROM user_aliases GROUP BY user_id HAVING s > ${score}
        ) t
      `);
      const r = (rows as unknown as [{ c: number | string }[]])[0]?.[0];
      count = Number(r?.c ?? 0);
    }
    return count + 1;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  if (!checkSecret(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const discordId = searchParams.get('discordId')?.trim() || null;
  const username = searchParams.get('username')?.trim().toLowerCase() || null;
  const uidRaw = searchParams.get('uid')?.trim() || null;
  const include = (searchParams.get('include') || 'full').trim();

  const rawQuery =
    (discordId ? `discord:${discordId}` : username ? `username:${username}` : uidRaw ? `uid:${uidRaw}` : 'none') +
    `:${include}`;
  const botCacheKey = `bot:profile:${rawQuery}`;
  try {
    const cached = await readWidgetCache<Record<string, unknown>>(botCacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=120' },
      });
    }
  } catch {}

  if (!discordId && !username && !uidRaw) {
    return NextResponse.json({ error: 'Provide discordId, username or uid' }, { status: 400 });
  }

  let uid: number | null = null;
  if (uidRaw) {
    const n = parseInt(uidRaw, 10);
    if (!Number.isInteger(n) || n <= 0) {
      return NextResponse.json({ error: 'Invalid uid' }, { status: 400 });
    }
    uid = n;
  }

  try {
    let userId: number | null = null;

    if (discordId) {
      const [row] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.discordId, discordId))
        .limit(1);
      if (!row) return NextResponse.json({ error: 'Not linked', linked: false }, { status: 404 });
      userId = row.id;
    } else if (username) {
      if (username.length > 32 || !/^[a-z0-9_.]+$/.test(username)) {
        return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
      }
      const [aliasRow] = await db
        .select({ userId: schema.userAliases.userId })
        .from(schema.userAliases)
        .where(eq(schema.userAliases.alias, username))
        .limit(1);
      if (aliasRow) {
        userId = aliasRow.userId;
      } else {
        const [row] = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.username, username))
          .limit(1);
        if (!row) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        userId = row.id;
      }
    } else if (uid !== null) {
      const [row] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, uid))
        .limit(1);
      if (!row) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      userId = row.id;
    }

    if (userId === null) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [profile] = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        discordId: schema.users.discordId,
        discordUsername: schema.users.discordUsername,
        views: schema.users.views,
        likesCount: schema.users.likesCount,
        dislikesCount: schema.users.dislikesCount,
        isPremium: schema.users.isPremium,
        hasVerified: schema.users.hasVerified,
        createdAt: schema.users.createdAt,
        displayName: schema.userSettings.displayName,
        avatarUrl: schema.userSettings.avatarUrl,
        bio: schema.userSettings.bio,
      })
      .from(schema.users)
      .leftJoin(schema.userSettings, eq(schema.users.id, schema.userSettings.userId))
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [[{ c: commentsReceived }]] = (await db.execute(sql`
      SELECT COUNT(*) AS c FROM profile_comments WHERE profile_id = ${userId}
    `)) as unknown as [[{ c: number | string }]];
    const [[{ c: commentsGiven }]] = (await db.execute(sql`
      SELECT COUNT(*) AS c FROM profile_comments WHERE author_id = ${userId}
    `)) as unknown as [[{ c: number | string }]];
    const [[{ c: feedbackGiven }]] = (await db.execute(sql`
      SELECT COUNT(*) AS c FROM profile_feedback WHERE giver_id = ${userId}
    `)) as unknown as [[{ c: number | string }]];
    const badgeRows = await db
      .select({ badgeId: schema.userBadges.badgeId, customName: schema.userBadges.customName })
      .from(schema.userBadges)
      .where(eq(schema.userBadges.userId, userId))
      .orderBy(asc(schema.userBadges.sortOrder), asc(schema.userBadges.id));
    const aliasRows = await db
      .select({ alias: schema.userAliases.alias })
      .from(schema.userAliases)
      .where(eq(schema.userAliases.userId, userId))
      .orderBy(asc(schema.userAliases.createdAt));

    const badgesCount = badgeRows.length;
    const customBadges = badgeRows.filter((b) => b.badgeId.startsWith('custom-'));
    const aliasesCount = aliasRows.length;

    const [viewsRank, likesRank, dislikesRank, commentsRank, badgesRank, aliasesRank] = await Promise.all([
      rankOf('users_views', userId, Number(profile.views ?? 0)),
      rankOf('users_likes', userId, Number(profile.likesCount ?? 0)),
      rankOf('users_dislikes', userId, Number(profile.dislikesCount ?? 0)),
      rankOf('comments', userId, Number(commentsReceived ?? 0)),
      rankOf('badges', userId, badgesCount),
      rankOf('aliases', userId, aliasesCount),
    ]);

    const base: Record<string, unknown> = {
      linked: true,
      id: profile.id,
      uid: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      discordId: profile.discordId,
      discordUsername: profile.discordUsername,
      views: Number(profile.views ?? 0),
      likesCount: Number(profile.likesCount ?? 0),
      dislikesCount: Number(profile.dislikesCount ?? 0),
      commentsReceived: Number(commentsReceived ?? 0),
      commentsGiven: Number(commentsGiven ?? 0),
      feedbackGiven: Number(feedbackGiven ?? 0),
      badgesCount,
      customBadgesCount: customBadges.length,
      aliasesCount,
      viewsRank,
      likesRank,
      dislikesRank,
      commentsRank,
      badgesRank,
      aliasesRank,
      isPremium: Boolean(profile.isPremium),
      hasVerified: Boolean(profile.hasVerified),
      createdAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : null,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      profileUrl: `https://iuno.lol/${profile.username}`,
    };

    if (include === 'basic') {
      writeWidgetCache(botCacheKey, base, BOT_PROFILE_TTL).catch(() => {});
      return NextResponse.json(base, { headers: { 'X-Cache': 'MISS' } });
    }

    async function loadRecentViews() {
      try {
        const r = await db.execute(sql`
          SELECT view_date AS d, count AS c FROM profile_views
          WHERE user_id = ${userId!} ORDER BY view_date DESC LIMIT 7
        `);
        const rows = (r as unknown as [{ d: string; c: number | string }[]])[0] ?? [];
        return rows.map((x) => ({ date: String(x.d).slice(0, 10), count: Number(x.c) }));
      } catch {
        return [];
      }
    }

    async function loadRecentComments() {
      try {
        const rows = await db
          .select({
            id: schema.profileComments.id,
            content: schema.profileComments.content,
            likesCount: schema.profileComments.likesCount,
            createdAt: schema.profileComments.createdAt,
            authorUsername: sql<string>`(SELECT username FROM users WHERE id = ${schema.profileComments.authorId})`,
          })
          .from(schema.profileComments)
          .where(eq(schema.profileComments.profileId, userId!))
          .orderBy(desc(schema.profileComments.createdAt))
          .limit(5);
        return rows.map((c) => ({
          ...c,
          createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
        }));
      } catch {
        return [];
      }
    }

    async function loadRecentFeedback() {
      try {
        const r = await db.execute(sql`
          SELECT pf.type AS type, pf.created_at AS createdAt, u.username AS username
          FROM profile_feedback pf JOIN users u ON u.id = pf.giver_id
          WHERE pf.receiver_id = ${userId!} ORDER BY pf.created_at DESC LIMIT 5
        `);
        const rows = (r as unknown as [{ type: string; createdAt: string; username: string }[]])[0] ?? [];
        return rows.map((x) => ({
          type: x.type,
          username: x.username,
          createdAt: x.createdAt ? new Date(x.createdAt).toISOString() : null,
        }));
      } catch {
        return [];
      }
    }

    const [recentViews, recentComments, recentFeedback] = await Promise.all([
      loadRecentViews(),
      loadRecentComments(),
      loadRecentFeedback(),
    ]);

    const full = {
      ...base,
      badges: badgeRows.map((b) => ({ id: b.badgeId, customName: b.customName })),
      customBadges: customBadges.map((b) => ({ id: b.badgeId, customName: b.customName })),
      aliases: aliasRows.map((a) => a.alias),
      recentViews,
      recentComments,
      recentFeedback,
    };
    writeWidgetCache(botCacheKey, full, BOT_PROFILE_TTL).catch(() => {});
    return NextResponse.json(full, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    console.error('[bot/profile] failed:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
