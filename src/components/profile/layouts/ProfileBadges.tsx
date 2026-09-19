"use client";

import { BADGES } from "@/app/dashboard/customize/badges/badges-data";

type Badge = (typeof BADGES)[number];

function badgeById(id: string): Badge | null {
  return (BADGES as readonly Badge[]).find((b) => b.id === id) ?? null;
}

export default function ProfileBadges({ badgeIds }: { badgeIds: string[] }) {
  const badges = badgeIds
    .map(badgeById)
    .filter((b): b is Badge => b !== null)
    .slice(0, 4);
  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 mb-2 ml-2 shrink-0">
      {badges.map((badge) => {
        const isFilled = "filled" in badge;
        return (
          <span key={badge.id} className="relative group/pbadge inline-flex">
            <svg
              width="18"
              height="18"
              viewBox={"viewBox" in badge ? badge.viewBox : "0 0 24 24"}
              fill={badge.id === "owner" || isFilled ? badge.accent : "none"}
              stroke={isFilled ? "none" : badge.accent}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
              style={{ filter: `drop-shadow(0 0 4px ${badge.accent}59)` }}
            >
              {badge.icon}
            </svg>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 pointer-events-none group-hover/pbadge:opacity-100 transition-all duration-200 z-30">
              <span className="block bg-[#0f0f12]/75 backdrop-blur-xl border border-white/10 px-2 py-0.5 rounded-md text-white text-[11px] shadow-lg whitespace-nowrap">
                {badge.name}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
