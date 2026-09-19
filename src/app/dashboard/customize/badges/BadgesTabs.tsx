"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BADGES } from "./badges-data";
import { saveEquippedBadges, syncDiscordBadges } from "@/actions/badges";
import { toast } from "@/components/ui/toast";
import SaveBar from "@/components/dashboard/SaveBar";

type Badge = (typeof BADGES)[number];

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
}: {
  badge: Badge;
  onAction: () => void;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3 bg-[#141414] border border-white/5 rounded-2xl">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/20 shrink-0">
        <circle cx="9" cy="5" r="1.4" />
        <circle cx="9" cy="12" r="1.4" />
        <circle cx="9" cy="19" r="1.4" />
        <circle cx="15" cy="5" r="1.4" />
        <circle cx="15" cy="12" r="1.4" />
        <circle cx="15" cy="19" r="1.4" />
      </svg>
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
  onToggle,
}: {
  badge: Badge;
  isEquipped: boolean;
  isLocked: boolean;
  onToggle: (id: string) => void;
}) {
  const pillText = isEquipped ? "Equipped" : "pill" in badge ? badge.pill : null;
  return (
    <div
      onClick={() => onToggle(badge.id)}
      title={
        isLocked
          ? badge.id === "early"
            ? "Only the first 100 members can earn this badge"
            : "Locked — sync your Discord roles to unlock"
          : isEquipped
            ? `Unequip ${badge.name}`
            : `Equip ${badge.name}`
      }
      className={`px-5 py-4 flex flex-col gap-1 transition-all ${
        isLocked
          ? "cursor-not-allowed saturate-50 opacity-70"
          : "cursor-pointer hover:bg-white/[0.02]"
      } ${
        isEquipped ? "ring-1 ring-inset ring-[#5b6cf5]/40" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <BadgeIcon badge={badge} />
        <span className="text-[14px] font-medium text-white tracking-tight min-w-0 truncate">{badge.name}</span>
        {isLocked ? (
          <span className="ml-auto shrink-0 text-white/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        ) : (
          pillText && (
            <span
              className={`ml-auto shrink-0 text-[12px] font-normal rounded-lg px-3 py-1 border ${
                isEquipped
                  ? "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30"
                  : "pill" in badge
                    ? "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20"
                    : "text-white/70 bg-white/[0.03] border-white/15"
              }`}
            >
              {pillText}
            </span>
          )
        )}
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

  const unequipped = owned.filter((id) => !equipped.includes(id));
  const frontBadges = equipped.slice(0, 4);
  const restBadges = equipped.slice(4);

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
              <div className="flex flex-col gap-3">
              {frontBadges.map((id) => {
                const badge = badgeById(id);
                if (!badge) return null;
                return (
                  <OwnedRow
                    key={badge.id}
                    badge={badge}
                    onAction={() => toggleBadge(badge.id)}
                  />
                );
              })}
              </div>
              {restBadges.length > 0 && (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {restBadges.map((id) => {
                    const badge = badgeById(id);
                    if (!badge) return null;
                    return (
                      <OwnedRow
                        key={badge.id}
                        badge={badge}
                        onAction={() => toggleBadge(badge.id)}
                      />
                    );
                  })}
                </div>
              )}
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
                    onToggle={toggleBadge}
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
    </div>
  );
}
