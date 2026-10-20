import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';
import { revalidateProfile } from '@/app/[username]/profile-data';
import { invalidateLiveStatsCache } from '@/lib/live-stats-cache';
import { profileFeedbackRateLimit, commentRateLimit } from '@/lib/rate-limit';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function checkSecret(req: Request): boolean {
  const secret = process.env.BOT_API_SECRET || '';
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

async function resolveUserId(opts: {
  discordId?: string | null;
  username?: string | null;
  uid?: number | null;
}): Promise<number | null> {
  const discordId = opts.discordId?.trim() || null;
  if (discordId) {
    const [row] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.discordId, discordId))
      .limit(1);
    return row?.id ?? null;
  }

  const username = opts.username?.trim().toLowerCase() || null;
  if (username) {
    if (username.length > 32 || !/^[a-z0-9_.]+$/.test(username)) return null;
    const [row] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return row?.id ?? null;
  }

  if (opts.uid != null) {
    if (!Number.isInteger(opts.uid) || opts.uid <= 0) return null;
    const [row] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, opts.uid))
      .limit(1);
    return row?.id ?? null;
  }

  return null;
}

async function applyFeedback(
  receiverId: number,
  giverId: number,
  type: 'like' | 'dislike',
): Promise<{ changed: boolean; username: string } | null> {
  return db.transaction(async (tx) => {
    const [target] = await tx
      .select({ id: schema.users.id, username: schema.users.username })
      .from(schema.users)
      .where(eq(schema.users.id, receiverId))
      .for('update');

    if (!target) return null;

    const existingRows = await tx
      .select({ type: schema.profileFeedback.type })
      .from(schema.profileFeedback)
      .where(
        and(
          eq(schema.profileFeedback.receiverId, receiverId),
          eq(schema.profileFeedback.giverId, giverId),
        ),
      )
      .for('update');

    const existingType = existingRows[0]?.type as string | undefined;
    if (existingType === type) {
      return { changed: false, username: target.username };
    }

    const counterDiffs: Record<string, import('drizzle-orm').SQL> = {};
    if (type === 'like') {
      counterDiffs.likesCount = sql`${schema.users.likesCount} + 1`;
      if (existingType === 'dislike') {
        counterDiffs.dislikesCount = sql`GREATEST(0, ${schema.users.dislikesCount} - 1)`;
      }
    } else {
      counterDiffs.dislikesCount = sql`${schema.users.dislikesCount} + 1`;
      if (existingType === 'like') {
        counterDiffs.likesCount = sql`GREATEST(0, ${schema.users.likesCount} - 1)`;
      }
    }

    await tx.update(schema.users).set(counterDiffs).where(eq(schema.users.id, receiverId));

    await tx
      .insert(schema.profileFeedback)
      .values({ receiverId, giverId, type })
      .onDuplicateKeyUpdate({ set: { type, createdAt: sql`CURRENT_TIMESTAMP` } });

    return { changed: true, username: target.username };
  });
}

async function invalidate(username: string | null | undefined) {
  if (!username) return;
  try {
    await invalidateLiveStatsCache(username);
    revalidateProfile(username);
  } catch (e) {
    console.error('[bot/feedback] cache invalidation failed:', e);
  }
}

export async function POST(req: Request) {
  if (!checkSecret(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const giverDiscordId = String(body.giverDiscordId ?? '').trim();
  if (!giverDiscordId) {
    return NextResponse.json({ error: 'giverDiscordId is required', code: 'missing_giver' }, { status: 400 });
  }

  const receiverDiscordId = String(body.receiverDiscordId ?? '').trim();
  const receiverUsername = typeof body.receiverUsername === 'string' ? body.receiverUsername : null;
  const receiverUid =
    typeof body.receiverUid === 'number'
      ? body.receiverUid
      : body.receiverUid != null
        ? parseInt(String(body.receiverUid), 10)
        : null;

  const giverId = await resolveUserId({ discordId: giverDiscordId });
  if (giverId == null) {
    return NextResponse.json(
      { error: 'Giver is not linked to iuno.lol', code: 'giver_not_linked' },
      { status: 404 },
    );
  }

  const hasUsername = !receiverDiscordId && !!receiverUsername;
  const resolvedUid = !receiverDiscordId && !hasUsername && Number.isInteger(receiverUid) ? (receiverUid as number) : null;
  const receiverId = await resolveUserId({
    discordId: receiverDiscordId || null,
    username: hasUsername ? receiverUsername : null,
    uid: resolvedUid,
  });
  if (receiverId == null) {
    return NextResponse.json(
      { error: 'Profile not found', code: 'receiver_not_found' },
      { status: 404 },
    );
  }

  const type = String(body.type ?? '').trim().toLowerCase();

  if (type === 'like' || type === 'dislike') {
    const [targetSettings] = await db
      .select({ feedbackEnabled: schema.userSettings.feedbackEnabled })
      .from(schema.userSettings)
      .where(eq(schema.userSettings.userId, receiverId))
      .limit(1);
    if (targetSettings?.feedbackEnabled === false) {
      return NextResponse.json(
        { error: 'Feedback is turned off for this profile.', code: 'feedback_disabled' },
        { status: 403 },
      );
    }

    const rate = await profileFeedbackRateLimit(giverId);
    if (!rate.ok) {
      return NextResponse.json(
        { error: `You're doing that too fast. Please wait ${rate.retryAfterSeconds} second${rate.retryAfterSeconds === 1 ? '' : 's'}.`, code: 'rate_limited' },
        { status: 429 },
      );
    }

    const result = await applyFeedback(receiverId, giverId, type);
    if (!result) {
      return NextResponse.json({ error: 'Profile not found', code: 'receiver_not_found' }, { status: 404 });
    }

    if (result.changed) await invalidate(result.username);

    return NextResponse.json({ success: true, changed: result.changed, type });
  }

  if (type === 'comment') {
    const content = String(body.content ?? '').trim();
    if (!content) {
      return NextResponse.json({ error: 'Comment cannot be empty', code: 'empty_comment' }, { status: 400 });
    }
    if (content.length > 200) {
      return NextResponse.json(
        { error: 'Comment is too long (maximum 200 characters)', code: 'comment_too_long' },
        { status: 400 },
      );
    }

    const [profile] = await db
      .select({
        commentsEnabled: schema.userSettings.commentsEnabled,
        allowNewComments: schema.userSettings.allowNewComments,
      })
      .from(schema.userSettings)
      .where(eq(schema.userSettings.userId, receiverId))
      .limit(1);

    if (profile?.commentsEnabled !== true) {
      return NextResponse.json(
        { error: 'Comments are turned off for this profile.', code: 'comments_disabled' },
        { status: 403 },
      );
    }
    if (profile.allowNewComments === false && giverId !== receiverId) {
      return NextResponse.json(
        { error: 'New comments are turned off for this profile.', code: 'comments_closed' },
        { status: 403 },
      );
    }

    const rate = await commentRateLimit(giverId);
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60);
      return NextResponse.json(
        { error: `You're posting too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`, code: 'rate_limited' },
        { status: 429 },
      );
    }

    const [inserted] = await db
      .insert(schema.profileComments)
      .values({ profileId: receiverId, authorId: giverId, content });

    const [receiver] = await db
      .select({ username: schema.users.username })
      .from(schema.users)
      .where(eq(schema.users.id, receiverId))
      .limit(1);
    await invalidate(receiver?.username);

    return NextResponse.json({ success: true, changed: true, commentId: inserted.insertId });
  }

  return NextResponse.json(
    { error: 'Invalid type. Allowed: like, dislike, comment' },
    { status: 400 },
  );
}
