"use client";

import { useState, useEffect, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BADGES } from "./badges-data";
import { saveEquippedBadges, syncDiscordBadges } from "@/actions/badges";
import { toast } from "@/components/ui/toast";
import SaveBar from "@/components/dashboard/SaveBar";

type Badge = (typeof BADGES)[number];

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

function badgeById(id: string): Badge | null {
  return (BADGES as readonly Badge[]).find((b) => b.id === id) ?? null;
}

function BadgeIcon({ badge, size = 26 }: { badge: Badge; size?: number }) {
  const isFilled = "filled" in badge;
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
      style={{ filter: `drop-shadow(0 0 6px ${badge.accent}47)` }}
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
  badge: Badge;
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
        <span className="text-[11.5px] text-white/35 truncate">{badge.description}</span>
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
      <p className="text-[12.5px] text-white/40 truncate">{badge.description}</p>
    </div>
  );
}

const TABS = [
  { id: "yours", label: "Your badges" },
  { id: "available", label: "Available badges" },
] as const;

export default function BadgesTabs({
  initialOwned = [],
  initialEquipped = [],
  earlyEligible = false,
}: {
  initialOwned?: string[];
  initialEquipped?: string[];
  earlyEligible?: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("available");
  const [owned, setOwned] = useState<string[]>(initialOwned);
  const [equipped, setEquipped] = useState<string[]>(initialEquipped);
  const [savedEquipped, setSavedEquipped] = useState<string[]>(initialEquipped);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [applyFor, setApplyFor] = useState<Badge | null>(null);
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

  function isBadgeLocked(id: string): boolean {
    if (id === "early") return !earlyEligible && !owned.includes(id);
    return !owned.includes(id);
  }

  function toggleBadge(id: string) {
    if (isBadgeLocked(id)) return;
    setEquipped((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (saving || !dirty) return;
    setSaving(true);
    try {
      const next = await saveEquippedBadges(equipped);
      setOwned(next.owned);
      setEquipped(next.equipped);
      setSavedEquipped(next.equipped);
      toast.success("Badges saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleRevert() {
    setEquipped(savedEquipped);
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
    <div className="flex flex-col gap-6">
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
              <p className="text-white/40 text-[12.5px] mt-0.5">
                Drag to reorder. Disabled badges won&apos;t appear on your page.
              </p>
              <p className="text-[#fbbf24]/70 text-[11.5px] mt-1">
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
              <p className="text-[12.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">Equip badges from the available list to show them off on your profile.</p>
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
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Available badges</h2>
              <p className="text-white/40 text-[12.5px] mt-0.5">{BADGES.length} badges you can earn</p>
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
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      <SaveBar show={dirty} onSave={handleSave} onRevert={handleRevert} />

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
  );
}
