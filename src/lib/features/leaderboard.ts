import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { readWidgetCache, writeWidgetCache } from "@/lib/widget-cache";

export const LEADERBOARD_CATEGORIES = ["views", "likes", "comments", "badges", "aliases"] as const;
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

async function queryLeaderboard(category: LeaderboardCategory, period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  const since = period === "all" ? null : PERIOD_DAYS[period];
  const window = since === null ? sql`1 = 1` : sql`created_at >= DATE_SUB(UTC_DATE(), INTERVAL ${since} DAY)`;
  const scoreSource =
    category === "comments"
      ? sql`SELECT profile_id AS user_id, COUNT(*) AS score FROM profile_comments
            WHERE author_id <> profile_id AND ${window}
            GROUP BY profile_id`
      : category === "aliases"
      ? since === null
        ? sql`SELECT id AS user_id, alias_tokens AS score FROM users WHERE alias_tokens > 0`
        : sql`SELECT e.user_id, SUM(IF(u.is_premium, 4, 1)) AS score FROM processed_payment_events e
              JOIN users u ON u.id = e.user_id
              WHERE e.plan = 'alias_token' AND e.created_at >= DATE_SUB(UTC_DATE(), INTERVAL ${since} DAY)
              GROUP BY e.user_id`
      : category === "likes"
      ? since === null
        ? sql`SELECT id AS user_id, likes_count AS score FROM users WHERE likes_count > 0`
        : sql`SELECT receiver_id AS user_id, COUNT(*) AS score FROM profile_feedback
              WHERE type = 'like' AND created_at >= DATE_SUB(UTC_DATE(), INTERVAL ${since} DAY)
              GROUP BY receiver_id`
      : category === "badges"
      ? since === null
        ? sql`SELECT id AS user_id, badge_tokens AS score FROM users WHERE badge_tokens > 0`
        : sql`SELECT user_id, COUNT(*) AS score FROM processed_payment_events
              WHERE plan = 'badge_token' AND user_id IS NOT NULL
                AND created_at >= DATE_SUB(UTC_DATE(), INTERVAL ${since} DAY)
              GROUP BY user_id`
      : period === "all"
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
  const fresh = await queryLeaderboard(category, period);
  await writeWidgetCache(key, fresh, CACHE_TTL_SECONDS);
  return fresh;
}
