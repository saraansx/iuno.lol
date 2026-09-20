"use client";

import { BADGES, LEVELS } from "@/app/dashboard/customize/badges/badges-data";

type Badge = (typeof BADGES)[number];
type LevelStage = (typeof LEVELS)[number];

function badgeById(id: string): Badge | LevelStage | null {
  return (
    (BADGES as readonly Badge[]).find((b) => b.id === id) ??
    (LEVELS as readonly LevelStage[]).find((b) => b.id === id) ??
    null
  );
}

export function badgeGlowFilter(
  accent: string,
  enabled: boolean = true,
  strength: number | null | undefined = 50
): string | undefined {
  const s = Math.min(100, Math.max(0, strength ?? 50));
  if (!enabled || s <= 0) return undefined;
  const hex = /^#[0-9a-f]{6}$/i.test(accent.trim()) ? accent.trim() : "#ffffff";
  const core = (1 + (s / 100) * 2).toFixed(1).replace(/\.0$/, "");
  const soft = ((s / 100) * 8).toFixed(1).replace(/\.0$/, "");
  return `drop-shadow(0 0 ${core}px ${hex}) drop-shadow(0 0 ${soft}px ${hex}66)`;
}

export default function ProfileBadges({
  badgeIds,
  showTooltip = true,
  glowEnabled = true,
  glowStrength = 50,
  badgeSize = 18,
  monoEnabled = false,
  monoColor = null,
  containerStyle = "pill",
  badgeSpacing = 6,
}: {
  badgeIds: string[];
  showTooltip?: boolean;
  glowEnabled?: boolean;
  glowStrength?: number | null;
  badgeSize?: number | null;
  monoEnabled?: boolean;
  monoColor?: string | null;
  containerStyle?: string | null;
  badgeSpacing?: number | null;
}) {
  const badges = badgeIds
    .map(badgeById)
    .filter((b): b is Badge | LevelStage => b !== null);
  if (badges.length === 0) return null;

  const size = Math.min(32, Math.max(12, badgeSize ?? 18));
  const gap = Math.min(24, Math.max(0, badgeSpacing ?? 6));
  const mono = monoEnabled
    ? /^#[0-9a-f]{6}$/i.test((monoColor ?? "").trim())
      ? (monoColor as string).trim()
      : "#ffffff"
    : null;
  const separate = containerStyle === "separate";

  const renderBadge = (badge: Badge | LevelStage) => {
    const isFilled = "filled" in badge || "level" in badge;
    const color = mono ?? badge.accent;
    const glow = badgeGlowFilter(color, glowEnabled, glowStrength);
    const icon = (
      <svg
        width={size}
        height={size}
        viewBox={"viewBox" in badge ? badge.viewBox : "0 0 24 24"}
        fill={badge.id === "owner" || isFilled ? color : "none"}
        stroke={isFilled ? "none" : color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
        style={glow ? { filter: glow } : undefined}
      >
        {badge.icon}
      </svg>
    );
    const inner = separate ? (
      <span className="rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm inline-flex">
        {icon}
      </span>
    ) : (
      icon
    );
    return (
      <span key={badge.id} className="relative group/pbadge inline-flex">
        {inner}
        {showTooltip && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 pointer-events-none group-hover/pbadge:opacity-100 transition-all duration-200 z-30">
            <span className="block bg-[#0f0f12]/75 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-white text-xs shadow-lg whitespace-nowrap leading-normal">
              {badge.name}
            </span>
          </span>
        )}
      </span>
    );
  };

  return (
    <div
      className={`flex flex-wrap items-center mb-2 ml-2 shrink-0 ${
        containerStyle === "pill"
          ? "rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 backdrop-blur-sm"
          : ""
      }`}
      style={{ gap: `${gap}px` }}
    >
      {badges.map(renderBadge)}
    </div>
  );
}
