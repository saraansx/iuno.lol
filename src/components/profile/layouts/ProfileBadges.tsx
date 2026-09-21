"use client";

import { useId } from "react";
import { BADGES, LEVELS, VIEW_MILESTONES, LIKE_MILESTONES, DONATION_MILESTONES } from "@/app/dashboard/customize/badges/badges-data";

type Badge = (typeof BADGES)[number];
type LevelStage = (typeof LEVELS)[number];
type ViewMilestone = (typeof VIEW_MILESTONES)[number];
type LikeMilestone = (typeof LIKE_MILESTONES)[number];
type DonationMilestone = (typeof DONATION_MILESTONES)[number];

export type BadgeScrollStyle = "none" | "pingpong" | "left" | "right";

function badgeById(id: string): Badge | LevelStage | ViewMilestone | LikeMilestone | DonationMilestone | null {
  return (
    (BADGES as readonly Badge[]).find((b) => b.id === id) ??
    (LEVELS as readonly LevelStage[]).find((b) => b.id === id) ??
    (VIEW_MILESTONES as readonly ViewMilestone[]).find((b) => b.id === id) ??
    (LIKE_MILESTONES as readonly LikeMilestone[]).find((b) => b.id === id) ??
    (DONATION_MILESTONES as readonly DonationMilestone[]).find((b) => b.id === id) ??
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
  scrollStyle = "none",
  scrollSpeed = 40,
  visibleCount = 5,
  shimmerEnabled = false,
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
  scrollStyle?: BadgeScrollStyle | string | null;
  scrollSpeed?: number | null;
  visibleCount?: number | null;
  shimmerEnabled?: boolean | null;
}) {
  const badges = badgeIds
    .map(badgeById)
    .filter((b): b is Badge | LevelStage | ViewMilestone | LikeMilestone | DonationMilestone => b !== null);
  if (badges.length === 0) return null;

  const size = Math.min(32, Math.max(12, badgeSize ?? 18));
  const gap = Math.min(24, Math.max(0, badgeSpacing ?? 6));
  const mono = monoEnabled
    ? /^#[0-9a-f]{6}$/i.test((monoColor ?? "").trim())
      ? (monoColor as string).trim()
      : "#ffffff"
    : null;
  const separate = containerStyle === "separate";
  const instanceId = useId().replace(/:/g, "");

  const renderBadge = (badge: Badge | LevelStage | ViewMilestone | LikeMilestone | DonationMilestone, keyPrefix = "") => {
    const isFilled = "filled" in badge || "level" in badge || "views" in badge || "likes" in badge || "amount" in badge;
    const color = mono ?? badge.accent;
    const glow = badgeGlowFilter(color, glowEnabled, glowStrength);
    const vb = ("viewBox" in badge ? (badge.viewBox as string) : "0 0 24 24") || "0 0 24 24";
    const [mvx, mvy, mvw, mvh] = vb.split(/\s+/).map(Number);
    const vx = Number.isFinite(mvx) ? mvx : 0;
    const vy = Number.isFinite(mvy) ? mvy : 0;
    const vw = Number.isFinite(mvw) && mvw > 0 ? mvw : 24;
    const vh = Number.isFinite(mvh) && mvh > 0 ? mvh : 24;
    const pad = Math.max(vw, vh) * 0.08;
    const uid = `bsh-${instanceId}-${keyPrefix}${badge.id}`;
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
        {shimmerEnabled && (
          <>
            <defs>
              <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.36" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
                <stop offset="0.64" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  values="-1.4 0; 1.4 0"
                  dur="4.5s"
                  repeatCount="indefinite"
                />
              </linearGradient>
              <mask
                id={`${uid}-m`}
                maskUnits="userSpaceOnUse"
                x={vx - pad}
                y={vy - pad}
                width={vw + pad * 2}
                height={vh + pad * 2}
              >
                <g fill="#fff" stroke="#fff">
                  {badge.icon}
                </g>
              </mask>
            </defs>
            <rect
              x={vx - pad}
              y={vy - pad}
              width={vw + pad * 2}
              height={vh + pad * 2}
              fill={`url(#${uid}-g)`}
              mask={`url(#${uid}-m)`}
              opacity={0.35}
              pointerEvents="none"
            />
          </>
        )}
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
      <span key={`${keyPrefix}${badge.id}`} className="relative group/pbadge inline-flex shrink-0">
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

  const scrolling =
    (scrollStyle === "pingpong" || scrollStyle === "left" || scrollStyle === "right") &&
    badges.length > 1;

  if (!scrolling) {
    return (
      <div
        className={`flex flex-wrap items-center mb-2 ml-2 shrink-0 ${
          containerStyle === "pill"
            ? "rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 backdrop-blur-sm"
            : ""
        }`}
        style={{ gap: `${gap}px` }}
      >
        {badges.map((b) => renderBadge(b))}
      </div>
    );
  }

  const style = scrollStyle as BadgeScrollStyle;
  const speed = Math.min(100, Math.max(1, scrollSpeed ?? 40));
  // Constant visual speed regardless of badge count. All modes loop forever.
  const duration = Math.min(40, Math.max(2.5, (badges.length * 60) / speed));

  const animation =
    style === "pingpong"
      ? `badge-scroll-pingpong ${duration}s ease-in-out infinite alternate`
      : style === "right"
        ? `badge-scroll-right ${duration}s linear infinite`
        : `badge-scroll-left ${duration}s linear infinite`;

  // Viewport fits exactly `visible` badges — e.g. 5 shows 5, the rest scroll through.
  const visible = Math.min(Math.max(1, Math.min(20, visibleCount ?? 5)), Math.max(1, badges.length));
  const boxExtra = separate ? 10 : 0; // separate boxes add padding + border
  const containerPad = containerStyle === "pill" ? 20 : 0; // px-2.5 on both sides
  const viewportWidth = visible * (size + boxExtra) + (visible - 1) * gap + containerPad;

  return (
    <div
      className={`flex items-center mb-2 ml-2 shrink-0 min-w-0 overflow-hidden ${
        containerStyle === "pill"
          ? "rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 backdrop-blur-sm"
          : ""
      }`}
      style={{
        width: `${viewportWidth}px`,
        // Soft edge fade so scrolling badges never hit a hard cut.
        maskImage: "linear-gradient(to right, transparent, black 14px, black calc(100% - 14px), transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 14px, black calc(100% - 14px), transparent)",
      }}
    >
      <div
        className="badge-scroll-track flex w-max items-center hover:[animation-play-state:paused]"
        style={{ animation, willChange: "transform" }}
      >
        <div className="flex items-center" style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}>
          {badges.map((b) => renderBadge(b, "a-"))}
        </div>
        <div className="flex items-center" aria-hidden="true" style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}>
          {badges.map((b) => renderBadge(b, "b-"))}
        </div>
      </div>
      <style>{`
        @keyframes badge-scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes badge-scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes badge-scroll-pingpong {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .badge-scroll-track { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
