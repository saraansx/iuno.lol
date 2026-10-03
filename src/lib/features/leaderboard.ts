import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { readWidgetCache, writeWidgetCache } from "@/lib/widget-cache";

export const LEADERBOARD_CATEGORIES = ["views"] as const;
export const LEADERBOARD_PERIODS = ["today", "week", "month", "all"] as const;
export type LeaderboardCategory = (typeof LEADERBOARD_CATEGORIES)[number];
export type LeaderboardPeriod = (typeof LEADERBOARD_PERIODS)[number];

export const LEADERBOARD_SIZE = 100;
const CACHE_TTL_SECONDS = 5 * 60;

export type LeaderboardEntry = {
  rank: number;
  userId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  verified: boolean;
  premium: boolean;
  score: number;
};

const PERIOD_DAYS: Record<Exclude<LeaderboardPeriod, "all">, number> = { today: 0, week: 6, month: 29 };

async function queryLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  const scoreSource =
    period === "all"
      ? sql`SELECT id AS user_id, views AS score FROM users WHERE views > 0`
      : sql`SELECT user_id, SUM(count) AS score FROM profile_views
            WHERE view_date >= DATE_SUB(UTC_DATE(), INTERVAL ${PERIOD_DAYS[period]} DAY)
            GROUP BY user_id`;

  const result = await db.execute(sql`
    SELECT s.user_id, s.score, u.username, us.display_name, us.avatar_url,
      (u.is_verified OR EXISTS (
        SELECT 1 FROM user_badges b WHERE b.user_id = u.id AND b.badge_id = 'verified'
      )) AS verified,
      u.is_premium AS premium
    FROM (${scoreSource}) s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN user_settings us ON us.user_id = u.id
    WHERE s.score > 0
    ORDER BY s.score DESC, u.id ASC
    LIMIT ${LEADERBOARD_SIZE}
  `);

  const rows = (result as unknown as [Array<{
    user_id: number | string;
    score: number | string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    verified: number | string | boolean;
    premium: number | string | boolean | null;
  }>])[0] ?? [];

  return rows.map((r, i) => ({
    rank: i + 1,
    userId: Number(r.user_id),
    username: r.username,
    displayName: r.display_name?.trim() || null,
    avatarUrl: r.avatar_url || null,
    verified: Boolean(Number(r.verified)),
    premium: Boolean(Number(r.premium)),
    score: Number(r.score),
  }));
}

export async function getLeaderboard(
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
): Promise<LeaderboardEntry[]> {
  const key = `leaderboard:${category}:${period}`;
  const cached = await readWidgetCache<LeaderboardEntry[]>(key);
  if (cached) return cached;
  const fresh = await queryLeaderboard(period);
  await writeWidgetCache(key, fresh, CACHE_TTL_SECONDS);
  return fresh;
}
