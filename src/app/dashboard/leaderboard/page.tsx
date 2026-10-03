import { Metadata } from "next";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth/session";
import {
  getLeaderboard,
  LEADERBOARD_CATEGORIES,
  LEADERBOARD_PERIODS,
  type LeaderboardCategory,
  type LeaderboardPeriod,
} from "@/lib/features/leaderboard";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "View the top creators on iuno.lol",
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
  const period: LeaderboardPeriod = category === "badges" ? "all" : pick(params.period, LEADERBOARD_PERIODS, "all");
  const page = Math.max(1, Math.min(10, Number.parseInt(params.page ?? "1", 10) || 1));

  const [entries, userId] = await Promise.all([getLeaderboard(category, period), getSessionUserId()]);

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="border-b border-white/4 pb-5 -mx-12 px-12">
        <Breadcrumb>
          <BreadcrumbList className="text-[13px] gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-white/40 hover:text-white tracking-tight">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Leaderboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <LeaderboardClient entries={entries} category={category} period={period} page={page} currentUserId={userId ?? null} />
    </div>
  );
}
