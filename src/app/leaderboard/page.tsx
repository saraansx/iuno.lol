import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  alternates: {
    canonical: "/leaderboard",
  },
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
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-40 h-28 pointer-events-none"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
        }}
      />
      <Navbar isAuthenticated={auth} />

      <section className="relative w-full max-w-6xl mx-auto px-6 pt-32 pb-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(ellipse_at_top,rgba(91,108,245,0.16),rgba(91,108,245,0.05)_42%,transparent_72%)]"
        />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8b93f0] font-medium">
              Top 100
            </p>
            <h1
              className="mt-3 text-5xl md:text-7xl font-semibold text-white tracking-[-0.03em] leading-[0.95]"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Leaderboard
            </h1>
          </div>
          <p className="max-w-sm text-[15px] text-white/45 leading-relaxed md:pb-2">
            The most viewed profiles on iuno.lol. Pick a category and a time span to see who&apos;s leading.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pb-16">
        <LeaderboardClient
          entries={entries}
          category={category}
          period={period}
          page={page}
          currentUserId={userId ?? null}
          basePath="/leaderboard"
          showHeader={false}
        />
      </main>

      <Footer />
    </div>
  );
}