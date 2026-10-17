"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import FilterSelect from "@/components/ui/filter-select";
import type { LeaderboardCategory, LeaderboardEntry, LeaderboardPeriod } from "@/lib/features/leaderboard";

const PAGE_SIZE = 10;

const CATEGORY_OPTIONS: { id: LeaderboardCategory; label: string }[] = [
  { id: "views", label: "Views" },
  { id: "likes", label: "Likes" },
  { id: "comments", label: "Comments" },
  { id: "badges", label: "Custom badges" },
  { id: "aliases", label: "Aliases" },
];

const METRICS: Record<LeaderboardCategory, { unit: string; header: string; empty: string }> = {
  views: { unit: "view", header: "Views", empty: "No views yet" },
  likes: { unit: "like", header: "Likes", empty: "No likes yet" },
  comments: { unit: "comment", header: "Comments", empty: "No comments yet" },
  aliases: { unit: "alias", header: "Aliases", empty: "No aliases yet" },
  badges: { unit: "badge", header: "Badges", empty: "No custom badges yet" },
};

const PERIOD_OPTIONS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

const MEDALS = {
  1: { color: "#fbbf24", height: "h-[84px] sm:h-[124px]", ring: "clamp(60px, 19vw, 104px)", ringFont: "clamp(24px, 7.4vw, 40px)" },
  2: { color: "#cbd5e1", height: "h-[70px] sm:h-[102px]", ring: "clamp(50px, 16vw, 84px)", ringFont: "clamp(20px, 6.4vw, 32px)" },
  3: { color: "#d97706", height: "h-[62px] sm:h-[88px]", ring: "clamp(50px, 16vw, 84px)", ringFont: "clamp(20px, 6.4vw, 32px)" },
} as const;

const plural = (n: number, unit = "view") => `${n.toLocaleString()} ${unit}${n === 1 ? "" : "s"}`;

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export default function LeaderboardClient({
  entries,
  category,
  period,
  page,
  currentUserId,
  basePath = "/dashboard/leaderboard",
  showHeader = true,
}: {
  entries: LeaderboardEntry[];
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  page: number;
  currentUserId: number | null;
  basePath?: string;
  showHeader?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const pageCount = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = rest.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const me = currentUserId ? entries.find((e) => e.userId === currentUserId) : undefined;
  const metric = METRICS[category];
  const periodLabel = PERIOD_OPTIONS.find((p) => p.id === period)!.label.toLowerCase();

  function go(next: { category?: string; period?: string; page?: number }) {
    const qs = new URLSearchParams({
      category: next.category ?? category,
      period: next.period ?? period,
      page: String(next.page ?? 1),
    });
    startTransition(() => router.push(`${basePath}?${qs}`, { scroll: false }));
  }

  return (
    <div className={`flex flex-col gap-6 pb-6 transition-opacity ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        {showHeader && (
          <div>
            <h1 className="text-[20px] font-normal text-white tracking-tight">Leaderboard</h1>
            <p className="text-white/40 text-[13px] mt-0.5">The top 100 creators on iuno.lol. Pick a category and a time span.</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Category"
            value={category}
            options={CATEGORY_OPTIONS}
            onChange={(v) => go({ category: v })}
            icon={<path d="M3 3v18h18M7 15l4-4 3 3 6-6" />}
          />
          <FilterSelect
            label="Time span"
            value={period}
            options={PERIOD_OPTIONS}
            onChange={(v) => go({ period: v })}
            icon={
              <>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </>
            }
          />
        </div>
      </div>

      {me && <YourRank me={me} ahead={entries[me.rank - 2]} periodLabel={periodLabel} category={category} />}

      {entries.length === 0 ? (
        <div className="relative overflow-hidden bg-[#0c0c0c] border border-white/5 rounded-[20px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[720px] h-80 bg-[radial-gradient(ellipse_at_top,rgba(91,108,245,0.12),rgba(91,108,245,0.03)_45%,transparent_72%)]"
          />
          <div className="relative flex flex-col items-center text-center mb-8">
            <span className="w-11 h-11 rounded-2xl bg-[#5b6cf5]/15 border border-[#5b6cf5]/25 flex items-center justify-center text-[#a5aef9]">
              <MetricIcon category={category} />
            </span>
            <p className="mt-3 text-[15px] font-normal text-white/90 tracking-tight">{metric.empty}</p>
            <p className="text-white/40 text-[12.5px] mt-1 max-w-xs leading-relaxed">
              {category === "views"
                ? `Nobody has views for ${periodLabel}. The top spots are wide open.`
                : category === "likes"
                ? `Nobody got a like ${period === "all" ? "yet" : periodLabel}. The top spots are wide open.`
                : category === "comments"
                ? `Nobody got a comment ${period === "all" ? "yet" : periodLabel}. The top spots are wide open.`
                : category === "aliases"
                ? period === "all"
                  ? "Nobody owns an alias slot yet. Be the first on the board."
                  : `Nobody bought an alias ${periodLabel}. Be the first on the board.`
                : period === "all"
                ? "Nobody owns a custom badge slot yet. Be the first on the board."
                : `Nobody bought a custom badge ${periodLabel}. Be the first on the board.`}
            </p>
            {(category === "badges" || category === "aliases") && (
              <Link
                href={category === "badges" ? "/checkout/badge-token" : "/checkout/alias-token"}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/25 px-4 py-2 text-[12.5px] text-white transition-colors"
              >
                {category === "badges" ? "Get a custom badge" : "Get an alias"}
              </Link>
            )}
          </div>
          <ol className="relative grid grid-cols-3 items-end gap-2 sm:gap-3 max-w-[660px] mx-auto" aria-label="Empty podium">
            {([2, 1, 3] as const).map((rank) => (
              <EmptySpot key={`empty-${rank}`} rank={rank} />
            ))}
          </ol>
        </div>
      ) : (
        <>
          {safePage === 1 && (
            <div className="relative overflow-hidden bg-[#0c0c0c] border border-white/5 rounded-[20px] px-4 sm:px-6 pt-8 sm:pt-10 pb-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[720px] h-80 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.09),rgba(251,191,36,0.02)_45%,transparent_72%)]"
              />
              <ol className="relative grid grid-cols-3 items-end gap-2 sm:gap-3 max-w-[660px] mx-auto">
                {([2, 1, 3] as const).map((rank) => {
                  const entry = podium[rank - 1];
                  return entry ? (
                    <PodiumSpot key={entry.userId} entry={entry} isMe={entry.userId === currentUserId} category={category} />
                  ) : (
                    <EmptySpot key={`empty-${rank}`} rank={rank} />
                  );
                })}
              </ol>
            </div>
          )}

          {rows.length > 0 && (
            <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_auto] sm:grid-cols-[64px_1fr_auto] px-3.5 sm:px-5 py-3 border-b border-white/5 text-[11px] uppercase tracking-wider text-white/35">
                <span>Rank</span>
                <span>User</span>
                <span>{metric.header}</span>
              </div>
              <ol>
                {rows.map((entry) => (
                  <li key={entry.userId} className="border-b border-white/5 last:border-b-0">
                    <Link
                      href={`/${entry.username}`}
                      target="_blank"
                      className={`grid grid-cols-[40px_1fr_auto] sm:grid-cols-[64px_1fr_auto] items-center px-3.5 sm:px-5 py-3 transition-colors hover:bg-white/[0.03] ${
                        entry.userId === currentUserId ? "bg-[#5b6cf5]/[0.07]" : ""
                      }`}
                    >
                      <span className="text-[12px] sm:text-[13px] text-white/50 tabular-nums">#{entry.rank}</span>
                      <span className="flex items-center gap-3 min-w-0">
                        <Avatar entry={entry} size={36} />
                        <span className="flex flex-col min-w-0">
                          <span className="flex items-center gap-1.5 min-w-0">
                            <span className="min-w-0 text-[13.5px] text-white/90 truncate">{entry.displayName ?? entry.username}</span>
                            {entry.premium && <PremiumTag />}
                            {entry.verified && <VerifiedTag />}
                            {entry.userId === currentUserId && (
                              <span className="text-[10.5px] rounded-full px-2 py-0.5 bg-[#5b6cf5]/20 text-white/80">You</span>
                            )}
                          </span>
                          <span className="text-[11.5px] text-white/35 truncate">@{entry.username}</span>
                        </span>
                      </span>
                      <span className="text-[13px] text-white tabular-nums" title={plural(entry.score, metric.unit)}>
                        {compact.format(entry.score)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="Leaderboard pages" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[12px] text-white/35">
                Ranks {3 + (safePage - 1) * PAGE_SIZE + 1}–{3 + (safePage - 1) * PAGE_SIZE + rows.length} of {entries.length}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1">
                <PageButton disabled={safePage === 1} onClick={() => go({ page: safePage - 1 })} label="Previous page">
                  <path d="m15 18-6-6 6-6" />
                </PageButton>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => go({ page: n })}
                    aria-current={n === safePage ? "page" : undefined}
                    className={`min-w-8 h-8 px-2 rounded-lg text-[12.5px] tabular-nums transition-colors cursor-pointer ${
                      n === safePage ? "bg-[#5b6cf5]/20 text-white" : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <PageButton disabled={safePage === pageCount} onClick={() => go({ page: safePage + 1 })} label="Next page">
                  <path d="m9 18 6-6-6-6" />
                </PageButton>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function PodiumBlock({ rank, score, muted = false, category = "views" }: { rank: 1 | 2 | 3; score?: number; muted?: boolean; category?: LeaderboardCategory }) {
  const unit = METRICS[category].unit;
  const medal = MEDALS[rank];
  return (
    <div
      className={`relative w-full ${medal.height} rounded-2xl border flex flex-col items-center justify-center gap-1 overflow-hidden`}
      style={
        muted
          ? { borderColor: "rgba(255,255,255,0.05)", background: "linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)" }
          : { borderColor: `${medal.color}35`, background: `linear-gradient(to bottom, ${medal.color}26, ${medal.color}08 60%, transparent)` }
      }
    >
      {!muted && (
        <div aria-hidden="true" className="absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${medal.color}, transparent)` }} />
      )}
      <span className="text-[24px] sm:text-[32px] font-semibold leading-none" style={{ color: muted ? "rgba(255,255,255,0.1)" : medal.color }}>
        <span className="sr-only">Rank </span>
        {rank}
      </span>
      {score !== undefined && (
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12.5px] tabular-nums text-white/70" title={plural(score, unit)}>
          <MetricIcon category={category} />
          {compact.format(score)} {unit}{score === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}

function PodiumSpot({ entry, isMe, category }: { entry: LeaderboardEntry; isMe: boolean; category: LeaderboardCategory }) {
  const rank = entry.rank as 1 | 2 | 3;
  const medal = MEDALS[rank];
  return (
    <li className="flex flex-col items-center min-w-0">
      <Link href={`/${entry.username}`} target="_blank" className="group flex flex-col items-center min-w-0 max-w-full mb-3 sm:mb-5 px-0.5 sm:px-1">
        {rank === 1 ? <TrophyFilled className="mb-2 sm:mb-3" color={medal.color} /> : <MedalFilled className="mb-2 sm:mb-3" color={medal.color} rank={rank} />}
        <span
          className="rounded-full transition-transform duration-200 group-hover:-translate-y-0.5"
          style={{
            border: `${rank === 1 ? 4 : 3}px solid ${medal.color}`,
            backgroundColor: medal.color,
            boxShadow: `0 0 ${rank === 1 ? 18 : 10}px ${medal.color}${rank === 1 ? "33" : "1f"}`,
          }}
        >
          <Avatar entry={entry} size={medal.ring} fontSize={medal.ringFont} ringless />
        </span>
        <span className="mt-2 sm:mt-3 text-[13px] sm:text-[14.5px] text-white truncate max-w-full">{entry.displayName ?? entry.username}</span>
        <span className="text-[10.5px] sm:text-[11.5px] text-white/35 truncate max-w-full">
          @{entry.username}
          {isMe && <span className="text-[#a5aef9]"> · You</span>}
        </span>
        {}
        <span className="mt-1.5 sm:mt-2 h-[20px] sm:h-[22px] flex items-center justify-center gap-1.5">
          {entry.premium && <PremiumTag />}
          {entry.verified && <VerifiedTag />}
        </span>
      </Link>
      <PodiumBlock rank={rank} score={entry.score} category={category} />
    </li>
  );
}

function EmptySpot({ rank }: { rank: 1 | 2 | 3 }) {
  const medal = MEDALS[rank];
  return (
    <li className="flex flex-col items-center min-w-0" aria-label={`Rank ${rank} is open`}>
      <div className="flex flex-col items-center mb-3 sm:mb-5">
        <span
          className="rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-white/20"
          style={{ width: `calc(${medal.ring} + 12px)`, height: `calc(${medal.ring} + 12px)` }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span className="mt-2 sm:mt-3 text-[12px] sm:text-[13px] text-white/35">Open spot</span>
        <span className="text-[10.5px] sm:text-[11.5px] text-white/20">Could be you</span>
        <span className="mt-1.5 sm:mt-2 h-[20px] sm:h-[22px]" aria-hidden="true" />
      </div>
      <PodiumBlock rank={rank} muted />
    </li>
  );
}

function YourRank({ me, ahead, periodLabel, category }: { me: LeaderboardEntry; ahead?: LeaderboardEntry; periodLabel: string; category: LeaderboardCategory }) {
  const gap = ahead ? ahead.score - me.score + 1 : 0;
  const unit = METRICS[category].unit;
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-[#0c0c0c] border border-[#5b6cf5]/25 rounded-[20px] px-4 sm:px-5 py-4 relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#5b6cf5]/[0.12] via-transparent to-transparent pointer-events-none" />
      <span className="relative w-11 h-11 shrink-0 rounded-2xl bg-[#5b6cf5]/15 border border-[#5b6cf5]/25 flex items-center justify-center text-[15px] text-white tabular-nums">
        #{me.rank}
      </span>
      <div className="relative flex flex-col min-w-0">
        <span className="text-[13.5px] text-white/90">Your rank for {periodLabel}</span>
        <span className="text-[12px] text-white/40 truncate">
          {ahead ? `${plural(gap, unit)} to pass @${ahead.username} for #${ahead.rank}` : "You're on top. Keep it up."}
        </span>
      </div>
      <span className="relative ml-auto inline-flex items-center gap-1.5 text-[12.5px] sm:text-[13px] text-white tabular-nums whitespace-nowrap">
        <MetricIcon category={category} />
        {plural(me.score, unit)}
      </span>
    </div>
  );
}

function MetricIcon({ category }: { category: LeaderboardCategory }) {
  if (category === "comments") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (category === "aliases") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
      </svg>
    );
  }
  if (category === "likes") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.5l-2.3 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z" />
      </svg>
    );
  }
  if (category === "badges") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  return <EyeIcon />;
}

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Avatar({ entry, size, fontSize, ringless = false }: { entry: LeaderboardEntry; size: number | string; fontSize?: number | string; ringless?: boolean }) {
  const initial = (entry.displayName ?? entry.username).charAt(0).toUpperCase();
  const fs = fontSize ?? (typeof size === "number" ? Math.round(size * 0.38) : undefined);
  return (
    <span
      className={`shrink-0 rounded-full overflow-hidden bg-[#161616] flex items-center justify-center text-white/70 ${ringless ? "" : "border border-white/10"}`}
      style={{ width: size, height: size, ...(fs !== undefined ? { fontSize: fs } : {}) }}
      aria-hidden="true"
    >
      {entry.avatarUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={entry.avatarUrl}
          alt=""
          {...(typeof size === "number" ? { width: size, height: size } : {})}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}

function PageButton({ disabled, onClick, label, children }: { disabled: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function VerifiedCheck() {
  return (
    <svg width="14" height="14" viewBox="64 64 512 512" fill="#5b6cf5" className="shrink-0" role="img" aria-label="Verified">
      <path d="M320 64C356.8 64 388.8 84.7 404.9 115.1C437.8 105 475 112.9 501 139C527 165.1 535 202.3 524.9 235.2C555.3 251.2 576 283.2 576 320C576 356.8 555.3 388.8 524.9 404.9C535 437.8 527 475 501 501C475 527 437.7 535 404.8 524.9C388.8 555.3 356.8 576 320 576C283.2 576 251.2 555.3 235.1 524.9C202.2 535 165 527 139 501C113 475 105 437.7 115.1 404.8C84.7 388.8 64 356.8 64 320C64 283.2 84.7 251.2 115.1 235.1C105 202.2 112.9 165 139 139C165.1 113 202.3 105 235.2 115.1C251.2 84.7 283.2 64 320 64zM410.9 228.6C400.2 220.8 385.2 223.2 377.4 233.9L291.8 351.6L265.3 324.2C256.1 314.7 240.9 314.4 231.4 323.6C221.9 332.8 221.6 348 230.8 357.5L277.2 405.5C282.1 410.6 289 413.3 296.1 412.8C303.2 412.3 309.7 408.7 313.9 403L416.2 262.1C424 251.4 421.6 236.4 410.9 228.6z" />
    </svg>
  );
}

const DIAMOND_PATH =
  "M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z";

function PremiumDiamond({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="#c084fc" className="shrink-0" role="img" aria-label="Premium">
      <path d={DIAMOND_PATH} />
    </svg>
  );
}

function PremiumTag() {
  return (
    <span
      title="Premium"
      className="inline-flex items-center gap-1 shrink-0 rounded-full px-1.5 sm:px-2 py-0.5 text-[10.5px] text-[#e9d5ff] bg-[#c084fc]/12 border border-[#c084fc]/25"
    >
      <PremiumDiamond size={11} />
      <span className="hidden sm:inline">Premium</span>
    </span>
  );
}

function VerifiedTag() {
  return (
    <span
      title="Verified"
      className="inline-flex items-center gap-1 shrink-0 rounded-full px-1.5 sm:px-2 py-0.5 text-[10.5px] text-[#c7cdfb] bg-[#5b6cf5]/15 border border-[#5b6cf5]/25"
    >
      <VerifiedCheck />
      <span className="hidden sm:inline">Verified</span>
    </span>
  );
}

function TrophyFilled({ className = "", color }: { className?: string; color: string }) {
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 32 32" aria-hidden="true" style={{ filter: `drop-shadow(0 0 3px ${color}40)` }}>
      <path fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" d="M9 8H5.5a1 1 0 0 0-1 1v1.5A5 5 0 0 0 9.5 15.5M23 8h3.5a1 1 0 0 1 1 1v1.5a5 5 0 0 1-5 5" />
      <path fill={color} d="M8 4.5A1.5 1.5 0 0 1 9.5 3h13A1.5 1.5 0 0 1 24 4.5V11a8 8 0 0 1-16 0V4.5Z" />
      <rect x="14" y="18.5" width="4" height="5" fill={color} />
      <rect x="9.5" y="23" width="13" height="5" rx="1.6" fill={color} />
      <path fill="#fff" fillOpacity="0.35" d="M11 5.5h2.2v6.2a4.6 4.6 0 0 0 1.2 3.1l-.9.9A6 6 0 0 1 11 11.7V5.5Z" />
    </svg>
  );
}

function MedalFilled({ className = "", color, rank }: { className?: string; color: string; rank: 2 | 3 }) {
  return (
    <svg className={className} width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" style={{ filter: `drop-shadow(0 0 2px ${color}33)` }}>
      <path fill={color} fillOpacity="0.55" d="M9 2h5l3.5 9h-5L9 2Zm14 0h-5l-3.5 9h5L23 2Z" />
      <circle cx="16" cy="20" r="10" fill={color} />
      <circle cx="16" cy="20" r="7.2" fill="none" stroke="#0c0c0c" strokeOpacity="0.25" strokeWidth="1.4" />
      <text x="16" y="24.4" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0c0c0c" fillOpacity="0.7" fontFamily="system-ui, sans-serif">
        {rank}
      </text>
    </svg>
  );
}

