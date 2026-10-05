import { NextResponse } from 'next/server';
import { getLeaderboard, LEADERBOARD_CATEGORIES, LEADERBOARD_PERIODS, type LeaderboardCategory, type LeaderboardPeriod } from '@/lib/features/leaderboard';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function checkSecret(req: Request): boolean {
  const secret = process.env.BOT_API_SECRET || '';
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!checkSecret(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const rawCategory = (searchParams.get('category') || 'views').toLowerCase();
  const rawPeriod = (searchParams.get('period') || 'all').toLowerCase();
  const rawLimit = searchParams.get('limit')?.trim() || searchParams.get('top')?.trim() || '10';

  const category = LEADERBOARD_CATEGORIES.includes(rawCategory as LeaderboardCategory)
    ? (rawCategory as LeaderboardCategory)
    : null;
  const period = LEADERBOARD_PERIODS.includes(rawPeriod as LeaderboardPeriod)
    ? (rawPeriod as LeaderboardPeriod)
    : null;

  if (!category) {
    return NextResponse.json({ error: `Invalid category. Allowed: ${LEADERBOARD_CATEGORIES.join(', ')}` }, { status: 400 });
  }
  if (!period) {
    return NextResponse.json({ error: `Invalid period. Allowed: ${LEADERBOARD_PERIODS.join(', ')}` }, { status: 400 });
  }

  let limit = parseInt(rawLimit, 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = 10;
  limit = Math.min(100, Math.max(1, limit));

  try {
    const entries = await getLeaderboard(category, period);
    const sliced = entries.slice(0, limit).map((e) => ({
      ...e,
      profileUrl: `https://iuno.lol/${e.username}`,
    }));

    return NextResponse.json({
      category,
      period,
      total: entries.length,
      limit,
      entries: sliced,
    });
  } catch (e) {
    console.error('[bot/leaderboard] failed:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
