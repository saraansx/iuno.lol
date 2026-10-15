"use client";

import { useId, useMemo } from "react";
import { BADGES, LEVELS, VIEW_MILESTONES, LIKE_MILESTONES } from "@/app/dashboard/customize/badges/badges-data";

type Badge = (typeof BADGES)[number];
type LevelStage = (typeof LEVELS)[number];
type ViewMilestone = (typeof VIEW_MILESTONES)[number];
type LikeMilestone = (typeof LIKE_MILESTONES)[number];
type AnyBadge = Badge | LevelStage | ViewMilestone | LikeMilestone;

type BadgeScrollStyle = "none" | "pingpong" | "left" | "right";

export type CustomBadge = { id: string; name: string; iconUrl: string };

const BADGE_INDEX = new Map<string, AnyBadge>();
for (const list of [BADGES, LEVELS, VIEW_MILESTONES, LIKE_MILESTONES]) {
  for (const b of list) {
    if (!BADGE_INDEX.has(b.id)) BADGE_INDEX.set(b.id, b);
  }
}

function badgeById(id: string): AnyBadge | null {
  return BADGE_INDEX.get(id) ?? null;
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
  customBadges = [],
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
  customBadges?: CustomBadge[];
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
  const instanceId = useId().replace(/:/g, "");
  const size = Math.min(32, Math.max(12, badgeSize ?? 18));
  const gap = Math.min(24, Math.max(0, badgeSpacing ?? 6));
  const mono = monoEnabled
    ? /^#[0-9a-f]{6}$/i.test((monoColor ?? "").trim())
      ? (monoColor as string).trim()
      : "#ffffff"
    : null;
  const separate = containerStyle === "separate";

  const badges = useMemo(
    () =>
      badgeIds
        .map((id) => customBadges.find((c) => c.id === id) ?? badgeById(id))
        .filter((b): b is Badge | LevelStage | ViewMilestone | LikeMilestone | CustomBadge => b !== null),
    [badgeIds, customBadges]
  );

  const glowByColor = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const b of badges) {
      if ("iconUrl" in b) continue;
      const color = mono ?? b.accent;
      if (!map.has(color)) map.set(color, badgeGlowFilter(color, glowEnabled, glowStrength));
    }
    return map;
  }, [badges, mono, glowEnabled, glowStrength]);

  if (badges.length === 0) return null;

  const renderBadge = (badge: Badge | LevelStage | ViewMilestone | LikeMilestone | CustomBadge, keyPrefix = "") => {
    if ("iconUrl" in badge) return renderCustom(badge, keyPrefix);
    const isFilled = "filled" in badge || "level" in badge || "views" in badge || "likes" in badge;
    const color = mono ?? badge.accent;
    const glow = glowByColor.get(color);
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
    return wrap(badge.id, badge.name, icon, keyPrefix);
  };

  const renderCustom = (badge: CustomBadge, keyPrefix: string) => {
    const s = Math.min(100, Math.max(0, glowStrength ?? 50));
    const showGlow = glowEnabled && s > 0;
    const icon = (
      <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
        {showGlow && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={badge.iconUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 object-contain pointer-events-none"
            style={{ width: size, height: size, filter: `blur(${(1 + (s / 100) * 4).toFixed(1)}px)`, opacity: 0.35 + (s / 100) * 0.45 }}
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={badge.iconUrl}
          alt={badge.name}
          width={size}
          height={size}
          draggable={false}
          className="relative object-contain"
          style={{ width: size, height: size }}
        />
      </span>
    );
    return wrap(badge.id, badge.name, icon, keyPrefix);
  };

  function wrap(id: string, name: string, icon: React.ReactNode, keyPrefix: string) {
    const inner = separate ? (
      <span className="rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm inline-flex">
        {icon}
      </span>
    ) : (
      icon
    );
    return (
      <span key={`${keyPrefix}${id}`} className="relative group/pbadge inline-flex shrink-0">
        {inner}
        {showTooltip && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 pointer-events-none group-hover/pbadge:opacity-100 transition-all duration-200 z-30">
            <span className="block bg-[#0f0f12]/75 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-white text-xs shadow-lg whitespace-nowrap leading-normal">
              {name}
            </span>
          </span>
        )}
      </span>
    );
  }

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
  const duration = Math.min(40, Math.max(2.5, (badges.length * 60) / speed));

  const animation =
    style === "pingpong"
      ? `badge-scroll-pingpong ${duration}s ease-in-out infinite alternate`
      : style === "right"
        ? `badge-scroll-right ${duration}s linear infinite`
        : `badge-scroll-left ${duration}s linear infinite`;

  const visible = Math.min(Math.max(1, Math.min(20, visibleCount ?? 5)), Math.max(1, badges.length));
  const boxExtra = separate ? 10 : 0;
  const containerPad = containerStyle === "pill" ? 20 : 0;
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
    </div>
  );
}
