"use client";

import { useState, useEffect, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BADGES, LEVELS, VIEW_MILESTONES, LIKE_MILESTONES, DONATION_MILESTONES } from "./badges-data";
import Link from "next/link";
import { saveEquippedBadges, syncDiscordBadges } from "@/actions/badges";
import { updateEffectsProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import SaveBar from "@/components/dashboard/SaveBar";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { badgeGlowFilter } from "@/components/profile/layouts/ProfileBadges";
import { type FullUser } from "@/lib/features/users/db";

type Badge = (typeof BADGES)[number];
type LevelStage = (typeof LEVELS)[number];
type ViewMilestone = (typeof VIEW_MILESTONES)[number];
type LikeMilestone = (typeof LIKE_MILESTONES)[number];
type DonationMilestone = (typeof DONATION_MILESTONES)[number];
type AnyBadge = Badge | LevelStage | ViewMilestone | LikeMilestone | DonationMilestone;
type ContainerStyle = "pill" | "none" | "separate";
type ScrollStyle = "none" | "pingpong" | "left" | "right";

// Badges that can be applied for (modal with purchase + Discord options).
const APPLY_BADGE_IDS = ["staff", "helper", "verified"];

// Show-only CTA buttons on locked rows.
const CTA_BUTTONS: Record<string, { label: string; action: "discord" | "soon" }> = {
  premium: { label: "Get premium", action: "soon" },
  "image-host": { label: "Get image host", action: "soon" },
  donator: { label: "Donate", action: "soon" },
  "bug-hunter": { label: "Report a bug", action: "discord" },
  booster: { label: "Join Discord", action: "discord" },
  "guild-tag": { label: "Join Discord", action: "discord" },
  domain: { label: "Add Domain", action: "soon" },
  gifter: { label: "Send a gift", action: "soon" },
  featured: { label: "Apply", action: "discord" },
  suggestor: { label: "Suggest Ideas", action: "discord" },
  "discord-recruiter": { label: "Invite", action: "discord" },
};

const ROWS: Array<{ slice: [number, number?]; cols: "md:grid-cols-3" | "md:grid-cols-2" }> = [
  { slice: [0, 3], cols: "md:grid-cols-3" },
  { slice: [3, 6], cols: "md:grid-cols-3" },
  { slice: [6, 9], cols: "md:grid-cols-3" },
  { slice: [9, 12], cols: "md:grid-cols-3" },
  { slice: [12, 15], cols: "md:grid-cols-3" },
  { slice: [15], cols: "md:grid-cols-2" },
];

function badgeById(id: string): AnyBadge | null {
  return (
    (BADGES as readonly Badge[]).find((b) => b.id === id) ??
    (LEVELS as readonly LevelStage[]).find((b) => b.id === id) ??
    (VIEW_MILESTONES as readonly ViewMilestone[]).find((b) => b.id === id) ??
    (LIKE_MILESTONES as readonly LikeMilestone[]).find((b) => b.id === id) ??
    (DONATION_MILESTONES as readonly DonationMilestone[]).find((b) => b.id === id) ??
    null
  );
}

function BadgeIcon({ badge, size = 26 }: { badge: AnyBadge; size?: number }) {
  const isFilled = "filled" in badge || "level" in badge || "views" in badge || "likes" in badge || "amount" in badge;
  const glow = badgeGlowFilter(badge.accent);
  return (
    <svg
      width={size}
      height={size}
      viewBox={"viewBox" in badge ? badge.viewBox : "0 0 24 24"}
      fill={badge.id === "owner" || isFilled ? badge.accent : "none"}
      stroke={isFilled ? "none" : badge.accent}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      style={glow ? { filter: glow } : undefined}
    >
      {badge.icon}
    </svg>
  );
}

function OwnedRow({
  badge,
  onAction,
  dragging,
  dropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  badge: AnyBadge;
  onAction: () => void;
  dragging: boolean;
  dropTarget: boolean;
  onDragStart: (e: DragEvent, id: string) => void;
  onDragOver: (e: DragEvent, id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, badge.id)}
      onDragOver={(e) => onDragOver(e, badge.id)}
      onDrop={() => onDrop(badge.id)}
      onDragEnd={onDragEnd}
      className={`group flex items-center gap-3 p-3.5 bg-[#141414]/70 hover:bg-[#161616] border rounded-2xl transition-all duration-150 select-none ${
        dragging
          ? "opacity-35 border-[#5b6cf5]/40 scale-[0.99]"
          : dropTarget
            ? "border-[#5b6cf5] bg-[#161616] shadow-lg shadow-[#5b6cf5]/10"
            : "border-white/5"
      }`}
    >
      <div className="cursor-grab active:cursor-grabbing text-white/20 group-hover:text-white/60 transition-colors shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </div>
      <BadgeIcon badge={badge} />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[13.5px] font-normal text-white/90 truncate">{badge.name}</span>
        <span className="text-[10.5px] text-white/35 truncate">{badge.description}</span>
      </div>
      <button
        type="button"
        onClick={onAction}
        aria-label={`Unequip ${badge.name}`}
        className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function BadgeCell({
  badge,
  isEquipped,
  isLocked,
  showApply,
  onToggle,
  onApply,
  onDiscord,
}: {
  badge: Badge;
  isEquipped: boolean;
  isLocked: boolean;
  showApply: boolean;
  onToggle: (id: string) => void;
  onApply: (id: string) => void;
  onDiscord: () => void;
}) {
  const pillText = "pill" in badge ? badge.pill : null;
  return (
    <div
      className={`px-5 py-4 flex flex-col gap-1 transition-all ${
        isLocked ? "saturate-50 opacity-70" : ""
      } ${isEquipped ? "ring-1 ring-inset ring-[#5b6cf5]/40" : ""}`}
    >
      <div className="flex items-center gap-3">
        <BadgeIcon badge={badge} />
        <span className="text-[14px] font-medium text-white tracking-tight min-w-0 truncate">{badge.name}</span>
        <span className="ml-auto shrink-0 flex items-center gap-2">
          {isLocked && (
            <span className="text-white/30" title={badge.id === "early" ? "Only the first 100 members can earn this badge" : "Locked — sync your Discord roles to unlock"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          )}
          {showApply && (
            <button
              type="button"
              onClick={() => onApply(badge.id)}
              className="text-[12px] font-normal rounded-lg px-3 py-1 border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer"
            >
              Apply
            </button>
          )}
          {!isLocked && isEquipped && (
            <button
              type="button"
              onClick={() => onToggle(badge.id)}
              className="text-[12px] font-normal rounded-lg px-3 py-1 border text-white/70 bg-white/[0.03] border-white/15 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors cursor-pointer"
            >
              Unequip
            </button>
          )}
          {!isLocked && !isEquipped && pillText && (
            <span className="text-[12px] font-normal rounded-lg px-3 py-1 border text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20">
              {pillText}
            </span>
          )}
          {!isLocked && !isEquipped && !pillText && (
            <button
              type="button"
              onClick={() => onToggle(badge.id)}
              className="text-[12px] font-normal rounded-lg px-3 py-1 border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer"
            >
              Equip
            </button>
          )}
          {isLocked && CTA_BUTTONS[badge.id] && (
            <button
              type="button"
              onClick={() => {
                const cta = CTA_BUTTONS[badge.id];
                if (cta.action === "discord") onDiscord();
                else toast.error("Coming soon.");
              }}
              className="text-[12px] font-normal rounded-lg px-3 py-1 border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer"
            >
              {CTA_BUTTONS[badge.id].label}
            </button>
          )}
          {isLocked && (badge.id === "owner" || badge.id === "developer") && (
            <span className="text-[12px] font-normal rounded-lg px-3 py-1 border text-white/70 bg-white/[0.03] border-white/15">
              Not available
            </span>
          )}
        </span>
      </div>
      <p className="text-[11px] text-white/40 truncate">{badge.description}</p>
    </div>
  );
}

const TABS = [
  { id: "yours", label: "Your badges" },
  { id: "available", label: "Available badges" },
  { id: "customize", label: "Badge Customization" },
] as const;

function formatMoney(n: number): string {
  return `$${n}`;
}

function DonatorCard({ owned, equipped, totalDonated, onToggle }: { owned: string[]; equipped: string[]; totalDonated: number; onToggle: (id: string) => void }) {
  const reached = DONATION_MILESTONES.filter((m) => owned.includes(m.id)).map((m) => m.amount);
  const current = reached.length > 0 ? Math.max(...reached) : 0;
  const next = DONATION_MILESTONES.find((m) => m.amount > current);
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-3.5 py-2.5 flex items-center gap-2.5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-white tracking-tight">Donator</h3>
          <p className="text-[10px] text-white/40 mt-px truncate">Donate to unlock donator badges.</p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-[12px] font-medium text-white">{formatMoney(totalDonated)} donated</p>
          <p className="text-[10.5px] text-white/40">{next ? `${formatMoney(next.amount - totalDonated)} to next` : "Max level"}</p>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-white/5 border-t border-white/5">
        {DONATION_MILESTONES.map((milestone) => {
          const unlocked = owned.includes(milestone.id);
          const isEquipped = equipped.includes(milestone.id);
          return (
            <div
              key={milestone.id}
              className="px-3.5 py-2 flex items-center gap-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={milestone.accent}
                stroke="none"
                className="shrink-0"
                style={{ filter: badgeGlowFilter(milestone.accent) }}
              >
                {milestone.icon}
              </svg>
              <span className={`text-[12.5px] font-normal truncate min-w-0 ${unlocked ? "text-white/90" : "text-white/40"}`}>{milestone.name}</span>
              <span className="ml-auto shrink-0 flex items-center gap-1.5">
                {!unlocked && (
                  <span className="text-white/30">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                )}
                <span className={`text-[11px] whitespace-nowrap ${unlocked ? "text-white/40" : "text-white/25"}`}>{formatMoney(milestone.amount)}</span>
                {unlocked && (
                  <button
                    type="button"
                    onClick={() => onToggle(milestone.id)}
                    className={`text-[11px] font-normal rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                      isEquipped
                        ? "text-white/70 bg-white/[0.03] border-white/15 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                        : "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30"
                    }`}
                  >
                    {isEquipped ? "Unequip" : "Equip"}
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LevelsCard({ owned, equipped, onToggle }: { owned: string[]; equipped: string[]; onToggle: (id: string) => void }) {
  const reachedLevels = LEVELS.filter((s) => owned.includes(s.id)).map((s) => s.level);
  const current = reachedLevels.length > 0 ? Math.max(...reachedLevels) : 0;
  const next = LEVELS.find((s) => s.level > current);
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-3.5 py-2.5 flex items-center gap-2.5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-white tracking-tight">Levels</h3>
          <p className="text-[10px] text-white/40 mt-px truncate">Level up to unlock stronger badges.</p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-[12px] font-medium text-white">Level {current}</p>
          <p className="text-[10.5px] text-white/40">{next ? `${next.level - current} to next` : "Max level"}</p>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-white/5 border-t border-white/5">
        {LEVELS.map((stage, stageIdx) => {
          const unlocked = owned.includes(stage.id);
          const isEquipped = equipped.includes(stage.id);
          return (
            <div
              key={stage.id}
              className="px-3.5 py-2 flex items-center gap-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={stage.accent}
                stroke="none"
                className="shrink-0"
                style={{ filter: badgeGlowFilter(stage.accent) }}
              >
                {stage.icon}
              </svg>
              <span className={`text-[12.5px] font-normal truncate min-w-0 ${unlocked ? "text-white/90" : "text-white/40"}`}>{stage.name}</span>
              <span className="ml-auto shrink-0 flex items-center gap-1.5">
                {!unlocked && (
                  <span className="text-white/30">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                )}
                <span className={`text-[11px] whitespace-nowrap ${unlocked ? "text-white/40" : "text-white/25"}`}>Level {stage.level}</span>
                {unlocked && (
                  <button
                    type="button"
                    onClick={() => onToggle(stage.id)}
                    className={`text-[11px] font-normal rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                      isEquipped
                        ? "text-white/70 bg-white/[0.03] border-white/15 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                        : "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30"
                    }`}
                  >
                    {isEquipped ? "Unequip" : "Equip"}
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toString().replace(/\.0$/, "")}k` : `${n}`;
}

function ViewsCard({ owned, equipped, totalViews, onToggle }: { owned: string[]; equipped: string[]; totalViews: number; onToggle: (id: string) => void }) {
  const reached = VIEW_MILESTONES.filter((m) => owned.includes(m.id)).map((m) => m.views);
  const current = reached.length > 0 ? Math.max(...reached) : 0;
  const next = VIEW_MILESTONES.find((m) => m.views > current);
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-3.5 py-2.5 flex items-center gap-2.5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-white tracking-tight">Views</h3>
          <p className="text-[10px] text-white/40 mt-px truncate">Hit view milestones to unlock badges.</p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-[12px] font-medium text-white">{formatViews(totalViews)} views</p>
          <p className="text-[10.5px] text-white/40">{next ? `${formatViews(next.views - totalViews)} to next` : "Max level"}</p>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-white/5 border-t border-white/5">
        {VIEW_MILESTONES.map((milestone) => {
          const unlocked = owned.includes(milestone.id);
          const isEquipped = equipped.includes(milestone.id);
          return (
            <div
              key={milestone.id}
              className="px-3.5 py-2 flex items-center gap-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={milestone.accent}
                stroke="none"
                className="shrink-0"
                style={{ filter: badgeGlowFilter(milestone.accent) }}
              >
                {milestone.icon}
              </svg>
              <span className={`text-[12.5px] font-normal truncate min-w-0 ${unlocked ? "text-white/90" : "text-white/40"}`}>{milestone.name}</span>
              <span className="ml-auto shrink-0 flex items-center gap-1.5">
                {!unlocked && (
                  <span className="text-white/30">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                )}
                <span className={`text-[11px] whitespace-nowrap ${unlocked ? "text-white/40" : "text-white/25"}`}>{formatViews(milestone.views)}</span>
                {unlocked && (
                  <button
                    type="button"
                    onClick={() => onToggle(milestone.id)}
                    className={`text-[11px] font-normal rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                      isEquipped
                        ? "text-white/70 bg-white/[0.03] border-white/15 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                        : "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30"
                    }`}
                  >
                    {isEquipped ? "Unequip" : "Equip"}
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LikesCard({ owned, equipped, totalLikes, onToggle }: { owned: string[]; equipped: string[]; totalLikes: number; onToggle: (id: string) => void }) {
  const reached = LIKE_MILESTONES.filter((m) => owned.includes(m.id)).map((m) => m.likes);
  const current = reached.length > 0 ? Math.max(...reached) : 0;
  const next = LIKE_MILESTONES.find((m) => m.likes > current);
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-3.5 py-2.5 flex items-center gap-2.5">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-white tracking-tight">Likes</h3>
          <p className="text-[10px] text-white/40 mt-px truncate">Hit like milestones to unlock badges.</p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-[12px] font-medium text-white">{formatViews(totalLikes)} likes</p>
          <p className="text-[10.5px] text-white/40">{next ? `${formatViews(next.likes - totalLikes)} to next` : "Max level"}</p>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-white/5 border-t border-white/5">
        {LIKE_MILESTONES.map((milestone) => {
          const unlocked = owned.includes(milestone.id);
          const isEquipped = equipped.includes(milestone.id);
          return (
            <div
              key={milestone.id}
              className="px-3.5 py-2 flex items-center gap-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={milestone.accent}
                stroke="none"
                className="shrink-0"
                style={{ filter: badgeGlowFilter(milestone.accent) }}
              >
                {milestone.icon}
              </svg>
              <span className={`text-[12.5px] font-normal truncate min-w-0 ${unlocked ? "text-white/90" : "text-white/40"}`}>{milestone.name}</span>
              <span className="ml-auto shrink-0 flex items-center gap-1.5">
                {!unlocked && (
                  <span className="text-white/30">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                )}
                <span className={`text-[11px] whitespace-nowrap ${unlocked ? "text-white/40" : "text-white/25"}`}>{formatViews(milestone.likes)}</span>
                {unlocked && (
                  <button
                    type="button"
                    onClick={() => onToggle(milestone.id)}
                    className={`text-[11px] font-normal rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                      isEquipped
                        ? "text-white/70 bg-white/[0.03] border-white/15 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                        : "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30"
                    }`}
                  >
                    {isEquipped ? "Unequip" : "Equip"}
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BadgesTabs({
  user,
  initialOwned = [],
  initialEquipped = [],
  earlyEligible = false,
  initialDonated = 0,
  initialGlow = { enabled: true, strength: 50, size: 18, mono: false, container: "pill" as ContainerStyle, spacing: 6, scroll: "none" as ScrollStyle, speed: 40, show: 5, shimmer: false },
}: {
  user: FullUser | null;
  initialOwned?: string[];
  initialEquipped?: string[];
  earlyEligible?: boolean;
  initialGlow?: { enabled: boolean; strength: number; size: number; mono: boolean; container: ContainerStyle; spacing: number; scroll: ScrollStyle; speed: number; show: number; shimmer: boolean };
  initialDonated?: number;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("available");
  const [owned, setOwned] = useState<string[]>(initialOwned);
  const [equipped, setEquipped] = useState<string[]>(initialEquipped);
  const [savedEquipped, setSavedEquipped] = useState<string[]>(initialEquipped);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [glowEnabled, setGlowEnabled] = useState(initialGlow.enabled);
  const [glowStrength, setGlowStrength] = useState(initialGlow.strength);
  const [badgeSize, setBadgeSize] = useState(initialGlow.size);
  const [monoEnabled, setMonoEnabled] = useState(initialGlow.mono);
  const [containerStyle, setContainerStyle] = useState(initialGlow.container);
  const [badgeSpacing, setBadgeSpacing] = useState(initialGlow.spacing);
  const [scrollStyle, setScrollStyle] = useState<ScrollStyle>(initialGlow.scroll ?? "none");
  const [scrollSpeed, setScrollSpeed] = useState(initialGlow.speed ?? 40);
  const [visibleCount, setVisibleCount] = useState(initialGlow.show ?? 5);
  const [shimmerEnabled, setShimmerEnabled] = useState(initialGlow.shimmer ?? false);
  const [savedGlow, setSavedGlow] = useState(initialGlow);
  const [applyFor, setApplyFor] = useState<AnyBadge | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);

  function handleRowDragStart(e: DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDragId(id);
  }

  function handleRowDragOver(e: DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragId) setDropId(id);
  }

  function handleRowDrop(id: string) {
    if (dragId && dragId !== id) {
      const from = dragId;
      setEquipped((prev) => {
        const fromIdx = prev.indexOf(from);
        const toIdx = prev.indexOf(id);
        if (fromIdx < 0 || toIdx < 0) return prev;
        const next = [...prev];
        next.splice(toIdx, 0, ...next.splice(fromIdx, 1));
        return next;
      });
    }
    setDragId(null);
    setDropId(null);
  }

  function handleRowDragEnd() {
    setDragId(null);
    setDropId(null);
  }

  useEffect(() => {
    if (!applyFor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setApplyFor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyFor]);

  const dirty = JSON.stringify(equipped) !== JSON.stringify(savedEquipped);
  const glowDirty =
    glowEnabled !== savedGlow.enabled ||
    glowStrength !== savedGlow.strength ||
    badgeSize !== savedGlow.size ||
    monoEnabled !== savedGlow.mono ||
    containerStyle !== savedGlow.container ||
    badgeSpacing !== savedGlow.spacing ||
    scrollStyle !== savedGlow.scroll ||
    scrollSpeed !== savedGlow.speed ||
    visibleCount !== savedGlow.show ||
    shimmerEnabled !== savedGlow.shimmer;
  const showSaveBar = dirty || glowDirty;

  function isBadgeLocked(id: string): boolean {
    if (id === "early") return !earlyEligible && !owned.includes(id);
    return !owned.includes(id);
  }

  function toggleBadge(id: string) {
    if (isBadgeLocked(id)) return;
    setEquipped((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (saving || !showSaveBar) return;
    setSaving(true);
    try {
      if (dirty) {
        const next = await saveEquippedBadges(equipped);
        setOwned(next.owned);
        setEquipped(next.equipped);
        setSavedEquipped(next.equipped);
      }
      if (glowDirty) {
        await updateEffectsProfile({
          badgeGlowEnabled: glowEnabled,
          badgeGlowStrength: glowStrength,
          badgeSize,
          badgeMonochromeEnabled: monoEnabled,
          badgeContainerStyle: containerStyle,
          badgeSpacing,
          badgeScrollStyle: scrollStyle,
          badgeScrollSpeed: scrollSpeed,
          badgeVisibleCount: visibleCount,
          badgeShimmerEnabled: shimmerEnabled,
        });
        setSavedGlow({ enabled: glowEnabled, strength: glowStrength, size: badgeSize, mono: monoEnabled, container: containerStyle, spacing: badgeSpacing, scroll: scrollStyle, speed: scrollSpeed, show: visibleCount, shimmer: shimmerEnabled });
      }
      toast.success("Badges saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleRevert() {
    setEquipped(savedEquipped);
    setGlowEnabled(savedGlow.enabled);
    setGlowStrength(savedGlow.strength);
    setBadgeSize(savedGlow.size);
    setMonoEnabled(savedGlow.mono);
    setContainerStyle(savedGlow.container);
    setBadgeSpacing(savedGlow.spacing);
    setScrollStyle(savedGlow.scroll ?? "none");
    setScrollSpeed(savedGlow.speed ?? 40);
    setVisibleCount(savedGlow.show ?? 5);
    setShimmerEnabled(savedGlow.shimmer ?? false);
  }

  function openDiscordLink() {
    const url = process.env.NEXT_PUBLIC_DISCORD_URL;
    if (!url) {
      toast.error("Discord link isn't set up yet.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openDiscordApply() {
    openDiscordLink();
    setApplyFor(null);
  }

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      const next = await syncDiscordBadges();
      setOwned(next.owned);
      setEquipped(next.equipped);
      setSavedEquipped(next.equipped);
      const parts: string[] = [];
      if (next.added.length > 0) parts.push(`${next.added.length} added`);
      if (next.removed.length > 0) parts.push(`${next.removed.length} removed`);
      toast.success(parts.length > 0 ? `Synced — ${parts.join(", ")}` : "Already in sync");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <>
    <div
      className="flex flex-col gap-6"
      style={tab === "customize" ? { paddingRight: "calc(var(--preview-width,380px) + 2rem)" } : undefined}
    >
      <div className="flex items-center gap-1 bg-[#0c0c0c] border border-white/5 rounded-full p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-[13.5px] font-normal transition-all relative cursor-pointer ${
              tab === t.id ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab === t.id && (
              <motion.div
                layoutId="badges-tab-bubble"
                className="absolute inset-0 bg-[#5b6cf5]/20 shadow-[0_0_15px_rgba(91,108,245,0.1)] rounded-full"
                transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
      {tab === "yours" ? (
        <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm p-4 md:p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Your badges ({equipped.length})</h2>
              <p className="text-white/40 text-[11.5px] mt-0.5">
                Drag to reorder. Disabled badges won&apos;t appear on your page.
              </p>
              <p className="text-[#fbbf24]/70 text-[10.5px] mt-1">
                Got a new Discord role? Hit Sync in Available badges to unlock it.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTab("available")}
              className="shrink-0 flex items-center gap-1.5 bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/20 rounded-xl px-4 py-2 text-[13px] font-normal text-white transition-colors cursor-pointer"
            >
              <span className="text-sm leading-none">+</span>
              Add badge
            </button>
          </div>

          {equipped.length === 0 ? (
            <div className="w-full border border-dashed border-white/[0.08] rounded-2xl bg-[#141414]/30 py-12 px-6 flex flex-col items-center justify-center text-center transition-colors hover:border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 mb-3 shadow-inner">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p className="text-[13.5px] font-normal text-white/90 tracking-tight">No badges yet</p>
              <p className="text-[11.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">Equip badges from the available list to show them off on your profile.</p>
              <button
                type="button"
                onClick={() => setTab("available")}
                className="mt-4 flex items-center gap-1.5 bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/20 rounded-xl px-4 py-2 text-[13px] font-normal text-white transition-colors cursor-pointer"
              >
                Browse badges
              </button>
            </div>
          ) : (
            <>
              <div className={`flex flex-col gap-2.5 ${equipped.length > 4 ? "max-h-[310px] overflow-y-auto custom-scrollbar pr-1.5 -mr-1.5" : ""}`}>
              {equipped.map((id) => {
                const badge = badgeById(id);
                if (!badge) return null;
                return (
                  <OwnedRow
                    key={badge.id}
                    badge={badge}
                    onAction={() => toggleBadge(badge.id)}
                    dragging={dragId === badge.id}
                    dropTarget={dropId === badge.id}
                    onDragStart={handleRowDragStart}
                    onDragOver={handleRowDragOver}
                    onDrop={handleRowDrop}
                    onDragEnd={handleRowDragEnd}
                  />
                );
              })}
              </div>
            </>
          )}
        </div>
      ) : tab === "available" ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Available badges</h2>
              <p className="text-white/40 text-[11.5px] mt-0.5">{BADGES.length} badges you can earn</p>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="shrink-0 flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2 text-[13px] font-normal text-white/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={syncing ? "animate-spin" : ""}
              >
                <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              {syncing ? "Syncing…" : "Sync"}
            </button>
          </div>
          <div className={`bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col divide-y divide-white/5 transition-opacity ${syncing ? "opacity-60 pointer-events-none" : ""}`}>
            {ROWS.map((row, i) => (
              <div key={i} className={`grid grid-cols-1 ${row.cols} md:divide-x divide-white/5`}>
                {BADGES.slice(...row.slice).map((badge) => (
                  <BadgeCell
                    key={badge.id}
                    badge={badge}
                    isEquipped={equipped.includes(badge.id)}
                    isLocked={isBadgeLocked(badge.id)}
                    showApply={APPLY_BADGE_IDS.includes(badge.id) && !owned.includes(badge.id)}
                    onToggle={toggleBadge}
                    onDiscord={openDiscordLink}
                    onApply={(id) => {
                      const b = badgeById(id);
                      if (b) setApplyFor(b);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DonatorCard owned={owned} equipped={equipped} totalDonated={initialDonated} onToggle={toggleBadge} />
            <LevelsCard owned={owned} equipped={equipped} onToggle={toggleBadge} />
            <ViewsCard owned={owned} equipped={equipped} totalViews={user?.views ?? 0} onToggle={toggleBadge} />
            <LikesCard owned={owned} equipped={equipped} totalLikes={user?.likesCount ?? 0} onToggle={toggleBadge} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Badge Customization</h2>
            <p className="text-white/40 text-[11.5px] mt-0.5">Tune the glow behind your profile badges</p>
          </div>
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-white/90">Glow</span>
                <span className="text-[11px] text-white/40 leading-tight">Add a soft glow behind your badges on your profile.</span>
              </div>
              <button
                type="button"
                onClick={() => setGlowEnabled(!glowEnabled)}
                className={`w-9 h-5 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${glowEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full absolute shadow-sm bg-white transition-all ${glowEnabled ? "right-[3px]" : "left-[3px]"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-white/90">Monochrome</span>
                <span className="text-[11px] text-white/40 leading-tight">Show all badges in a single color. Pick it in color settings.</span>
              </div>
              <button
                type="button"
                onClick={() => setMonoEnabled(!monoEnabled)}
                className={`w-9 h-5 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${monoEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full absolute shadow-sm bg-white transition-all ${monoEnabled ? "right-[3px]" : "left-[3px]"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-white/90">Shimmer</span>
                <span className="text-[11px] text-white/40 leading-tight">Sweep a shine across your badges on your profile.</span>
              </div>
              <button
                type="button"
                onClick={() => setShimmerEnabled(!shimmerEnabled)}
                className={`w-9 h-5 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${shimmerEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full absolute shadow-sm bg-white transition-all ${shimmerEnabled ? "right-[3px]" : "left-[3px]"}`} />
              </button>
            </div>

            <div className="flex flex-col gap-3 transition-opacity duration-200 opacity-100">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-medium text-white/90">
                  Glow strength
                </label>
                <span className="text-[12px] text-white/40 font-mono">
                  {glowStrength}
                </span>
              </div>
              <div className="relative flex items-center h-5 group w-full">
                <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-[#5b6cf5]"
                    style={{ width: `${glowStrength}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  disabled={!glowEnabled}
                  value={glowStrength}
                  onChange={(e) => setGlowStrength(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                />
                <div
                  className={`absolute w-4 h-4 bg-[#050505] border-[2px] ${!glowEnabled ? "border-[#252a4a]" : "border-[#5b6cf5]"
                    } rounded-full pointer-events-none transition-transform shadow-lg`}
                  style={{
                    left: `calc(${glowStrength}% - 8px)`
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-medium text-white/90">
                  Badge size
                </label>
                <span className="text-[12px] text-white/40 font-mono">
                  {badgeSize}px
                </span>
              </div>
              <div className="relative flex items-center h-5 group w-full">
                <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-[#5b6cf5]"
                    style={{ width: `${((badgeSize - 12) / (32 - 12)) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="12"
                  max="32"
                  step="1"
                  value={badgeSize}
                  onChange={(e) => setBadgeSize(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div
                  className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform shadow-lg"
                  style={{
                    left: `calc(${((badgeSize - 12) / (32 - 12)) * 100}% - 8px)`
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-medium text-white/90">
                  Badges spacing
                </label>
                <span className="text-[12px] text-white/40 font-mono">
                  {badgeSpacing}px
                </span>
              </div>
              <div className="relative flex items-center h-5 group w-full">
                <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-[#5b6cf5]"
                    style={{ width: `${(badgeSpacing / 24) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={badgeSpacing}
                  onChange={(e) => setBadgeSpacing(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div
                  className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform shadow-lg"
                  style={{
                    left: `calc(${(badgeSpacing / 24) * 100}% - 8px)`
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[12.5px] font-medium text-white/90">
                Container
              </label>
              <div className="flex items-center gap-1 bg-[#161616] border border-white/5 rounded-xl p-1 w-fit">
                {(
                  [
                    { id: "pill", label: "Pill" },
                    { id: "none", label: "None" },
                    { id: "separate", label: "Separate" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setContainerStyle(opt.id)}
                    className={`rounded-lg px-4 py-1.5 text-[12.5px] font-normal transition-colors cursor-pointer ${
                      containerStyle === opt.id
                        ? "bg-[#5b6cf5]/20 text-white"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-white/35">
                {containerStyle === "pill" && "One shared bar behind all badges."}
                {containerStyle === "none" && "Bare icons, no container."}
                {containerStyle === "separate" && "Each badge in its own box."}
              </p>
              {scrollStyle === "none" && (
                <p className="text-[#fbbf24]/70 text-[11.5px]">
                  Badges spilling outside the container? Increase the Content width or decrease the badge spacing to fit them.{" "}
                  <Link href="/dashboard/customize/profile/layout" className="font-medium underline underline-offset-2 hover:text-[#fbbf24] transition-colors">
                    Go to Layout settings →
                  </Link>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[12.5px] font-medium text-white/90">
                Scroll style
              </label>
              <div className="flex items-center gap-1 bg-[#161616] border border-white/5 rounded-xl p-1 w-fit flex-wrap">
                {(
                  [
                    { id: "none", label: "None" },
                    { id: "pingpong", label: "Back & forth" },
                    { id: "left", label: "Right to left" },
                    { id: "right", label: "Left to right" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setScrollStyle(opt.id)}
                    className={`rounded-lg px-4 py-1.5 text-[12.5px] font-normal transition-colors cursor-pointer ${
                      scrollStyle === opt.id
                        ? "bg-[#5b6cf5]/20 text-white"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-white/35">
                {scrollStyle === "none" && "Badges stay still."}
                {scrollStyle === "pingpong" && "Slides back and forth in a loop."}
                {scrollStyle === "left" && "Loops endlessly right to left."}
                {scrollStyle === "right" && "Loops endlessly left to right."}
              </p>
            </div>

            <div className={`flex flex-col gap-3 transition-opacity duration-200 ${scrollStyle === "none" ? "opacity-40" : "opacity-100"}`}>
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-medium text-white/90">
                  Scroll speed
                </label>
                <span className="text-[12px] text-white/40 font-mono">
                  {scrollSpeed}
                </span>
              </div>
              <div className="relative flex items-center h-5 group w-full">
                <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-[#5b6cf5]"
                    style={{ width: `${scrollSpeed}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  disabled={scrollStyle === "none"}
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                />
                <div
                  className={`absolute w-4 h-4 bg-[#050505] border-[2px] ${scrollStyle === "none" ? "border-[#252a4a]" : "border-[#5b6cf5]"
                    } rounded-full pointer-events-none transition-transform shadow-lg`}
                  style={{
                    left: `calc(${scrollSpeed}% - 8px)`
                  }}
                />
              </div>
            </div>

            <div className={`flex flex-col gap-3 transition-opacity duration-200 ${scrollStyle === "none" ? "opacity-40" : "opacity-100"}`}>
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-medium text-white/90">
                  Badges to show
                </label>
                <span className="text-[12px] text-white/40 font-mono">
                  {visibleCount}
                </span>
              </div>
              <div className="relative flex items-center h-5 group w-full">
                <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-[#5b6cf5]"
                    style={{ width: `${((visibleCount - 1) / 19) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  disabled={scrollStyle === "none"}
                  value={visibleCount}
                  onChange={(e) => setVisibleCount(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                />
                <div
                  className={`absolute w-4 h-4 bg-[#050505] border-[2px] ${scrollStyle === "none" ? "border-[#252a4a]" : "border-[#5b6cf5]"
                    } rounded-full pointer-events-none transition-transform shadow-lg`}
                  style={{
                    left: `calc(${((visibleCount - 1) / 19) * 100}% - 8px)`
                  }}
                />
              </div>
              <p className="text-[11px] text-white/35">
                Fits {visibleCount} badge{visibleCount === 1 ? "" : "s"} in the window — the rest scroll through.
              </p>
            </div>
          </div>
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      <SaveBar show={showSaveBar} onSave={handleSave} onRevert={handleRevert} />

      {tab === "customize" && (
        <DashboardProfilePreview
          user={user}
          overrides={{
            badgeGlowEnabled: glowEnabled,
            badgeGlowStrength: glowStrength,
            badgeSize,
            badgeMonochromeEnabled: monoEnabled,
            badgeContainerStyle: containerStyle,
            badgeSpacing,
            badgeScrollStyle: scrollStyle,
            badgeScrollSpeed: scrollSpeed,
            badgeVisibleCount: visibleCount,
            badgeShimmerEnabled: shimmerEnabled,
          }}
          equippedBadges={equipped}
        />
      )}

      <AnimatePresence>
        {applyFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setApplyFor(null)}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-[min(420px,90vw)] bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 mb-1">
                <h3 className="text-[15px] font-medium text-white tracking-tight">
                  Apply for {applyFor.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setApplyFor(null)}
                  aria-label="Close"
                  className="shrink-0 w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-[12.5px] text-white/40 mb-5">
                Pick how you&apos;d like to get the {applyFor.name.toLowerCase()} badge.
              </p>
              <div className="flex flex-col gap-2.5">
                {applyFor.id === "verified" && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.error("Purchases open soon — please use Discord for now.");
                    }}
                    className="w-full flex items-center gap-3 rounded-xl border border-[#5b6cf5]/30 bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/25 transition-colors px-4 py-3 cursor-pointer"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c7cdfb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="9" cy="20" r="1.5" />
                      <circle cx="17" cy="20" r="1.5" />
                      <path d="M3 3h2l2.4 12.2a1 1 0 0 0 1 .8H17a1 1 0 0 0 1-.8L20 7H6" />
                    </svg>
                    <span className="text-[13.5px] font-normal text-white">Buy {applyFor.name}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={openDiscordApply}
                  className="w-full flex items-center gap-3 rounded-xl border border-[#5b6cf5]/25 bg-[#5b6cf5]/10 hover:bg-[#5b6cf5]/15 transition-colors px-4 py-3 cursor-pointer"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#8f9bf5" className="shrink-0">
                    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03ZM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
                  </svg>
                  <span className="text-[13.5px] font-normal text-[#8f9bf5]">Apply via Discord</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
