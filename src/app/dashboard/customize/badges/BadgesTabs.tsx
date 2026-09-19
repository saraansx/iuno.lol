"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BADGES, MAX_EQUIPPED_BADGES } from "./badges-data";
import { equipBadge, unequipBadge } from "@/actions/badges";
import { toast } from "@/components/ui/toast";

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

function BadgeCell({
  badge,
  isEquipped,
  isPending,
  onToggle,
}: {
  badge: Badge;
  isEquipped: boolean;
  isPending: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onToggle(badge.id)}
      title={isEquipped ? `Unequip ${badge.name}` : `Equip ${badge.name}`}
      className={`px-5 py-4 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-white/[0.02] ${
        isEquipped ? "ring-1 ring-inset ring-[#5b6cf5]/40" : ""
      } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="flex items-center gap-3">
        <BadgeIcon badge={badge} />
        <span className="text-[14px] font-medium text-white tracking-tight min-w-0 truncate">{badge.name}</span>
        <span
          className={`ml-auto shrink-0 text-[12px] font-normal rounded-lg px-3 py-1 border ${
            isEquipped
              ? "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30"
              : "pill" in badge
                ? "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20"
                : "text-white/70 bg-white/[0.03] border-white/15"
          }`}
        >
          {isEquipped ? "Equipped" : "pill" in badge ? badge.pill : "Not available"}
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
}: {
  initialOwned?: string[];
  initialEquipped?: string[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("available");
  const [owned, setOwned] = useState<string[]>(initialOwned);
  const [equipped, setEquipped] = useState<string[]>(initialEquipped);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleBadge(id: string) {
    if (pendingId) return;
    const isEquipped = equipped.includes(id);
    setPendingId(id);
    try {
      const next = isEquipped ? await unequipBadge(id) : await equipBadge(id);
      setOwned(next.owned);
      setEquipped(next.equipped);
      toast.success(isEquipped ? "Badge unequipped" : "Badge equipped");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPendingId(null);
    }
  }

  const unequipped = owned.filter((id) => !equipped.includes(id));
  const slotsFull = equipped.length >= MAX_EQUIPPED_BADGES;

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
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Your badges ({owned.length})</h2>
            <p className="text-white/40 text-[12.5px] mt-0.5">
              {slotsFull
                ? "All 4 slots filled — unequip one to swap"
                : `Up to ${MAX_EQUIPPED_BADGES} badges show up front on your profile`}
            </p>
          </div>

          {owned.length === 0 ? (
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
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: MAX_EQUIPPED_BADGES }).map((_, i) => {
                  const id = equipped[i];
                  const badge = id ? badgeById(id) : null;
                  if (!badge) {
                    return (
                      <button
                        key={`empty-${i}`}
                        type="button"
                        onClick={() => setTab("available")}
                        className="border border-dashed border-white/[0.08] rounded-2xl bg-[#141414]/30 min-h-[104px] flex flex-col items-center justify-center gap-1.5 text-white/30 hover:text-white/60 hover:border-white/15 transition-colors cursor-pointer"
                      >
                        <span className="text-xl leading-none">+</span>
                        <span className="text-[11.5px]">Empty slot</span>
                      </button>
                    );
                  }
                  return (
                    <div
                      key={badge.id}
                      className="relative bg-[#0c0c0c] border border-white/5 rounded-2xl px-4 py-4 flex items-center gap-3 shadow-sm"
                    >
                      <BadgeIcon badge={badge} />
                      <span className="text-[13px] font-normal text-white/90 truncate min-w-0">{badge.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleBadge(badge.id)}
                        aria-label={`Unequip ${badge.name}`}
                        className="ml-auto shrink-0 w-6 h-6 rounded-lg bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {unequipped.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[12px] text-white/35">More of your badges — scroll to browse</p>
                  <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-1">
                    {unequipped.map((id) => {
                      const badge = badgeById(id);
                      if (!badge) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleBadge(id)}
                          title={`Equip ${badge.name}`}
                          className="shrink-0 bg-[#0c0c0c] border border-white/5 hover:border-white/15 rounded-2xl px-4 py-3 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <BadgeIcon badge={badge} size={22} />
                          <span className="text-[12.5px] text-white/80 whitespace-nowrap">{badge.name}</span>
                          <span className="text-white/30 text-sm leading-none">+</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Available badges</h2>
            <p className="text-white/40 text-[12.5px] mt-0.5">{BADGES.length} badges you can earn</p>
          </div>
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col divide-y divide-white/5">
            {ROWS.map((row, i) => (
              <div key={i} className={`grid grid-cols-1 ${row.cols} md:divide-x divide-white/5`}>
                {BADGES.slice(...row.slice).map((badge) => (
                  <BadgeCell
                    key={badge.id}
                    badge={badge}
                    isEquipped={equipped.includes(badge.id)}
                    isPending={pendingId === badge.id}
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
    </div>
  );
}
