import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LeaderboardClient from "@/app/dashboard/leaderboard/LeaderboardClient";
import { isAuthenticated, getSessionUserId } from "@/lib/auth/session";
import {
  getLeaderboard,
  LEADERBOARD_CATEGORIES,
  LEADERBOARD_PERIODS,
  type LeaderboardCategory,
  type LeaderboardPeriod,
} from "@/lib/features/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "The most viewed profiles on iuno.lol",
};

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; period?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category: LeaderboardCategory = pick(params.category, LEADERBOARD_CATEGORIES, "views");
  const period: LeaderboardPeriod = pick(params.period, LEADERBOARD_PERIODS, "all");
  const page = Math.max(1, Math.min(10, Number.parseInt(params.page ?? "1", 10) || 1));

  const [entries, userId, auth] = await Promise.all([
    getLeaderboard(category, period),
    getSessionUserId(),
    isAuthenticated(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={auth} />
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-28 pb-16">
        <LeaderboardClient
          entries={entries}
          category={category}
          period={period}
          page={page}
          currentUserId={userId ?? null}
          basePath="/leaderboard"
        />
      </main>
    </div>
  );
}