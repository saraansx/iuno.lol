"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BADGES } from "./badges-data";

type Badge = (typeof BADGES)[number];

const ROWS: Array<{ slice: [number, number?]; cols: "md:grid-cols-3" | "md:grid-cols-2" }> = [
  { slice: [0, 3], cols: "md:grid-cols-3" },
  { slice: [3, 6], cols: "md:grid-cols-3" },
  { slice: [6, 9], cols: "md:grid-cols-3" },
  { slice: [9, 12], cols: "md:grid-cols-3" },
  { slice: [12, 15], cols: "md:grid-cols-3" },
  { slice: [15], cols: "md:grid-cols-2" },
];

function BadgeCell({ badge }: { badge: Badge }) {
  const isFilled = "filled" in badge;
  return (
    <div className="px-5 py-4 flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <svg
          width="26"
          height="26"
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
        <span className="text-[14px] font-medium text-white tracking-tight min-w-0 truncate">{badge.name}</span>
        <span
          className={`ml-auto shrink-0 text-[12px] font-normal rounded-lg px-3 py-1 border ${
            "pill" in badge
              ? "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20"
              : "text-white/70 bg-white/[0.03] border-white/15"
          }`}
        >
          {"pill" in badge ? badge.pill : "Not available"}
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

export default function BadgesTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("available");

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
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Your badges (0)</h2>
            <p className="text-white/40 text-[12.5px] mt-0.5">Badges you have earned will appear on your profile</p>
          </div>
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
            <p className="text-[12.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">Earn badges below to show them off on your profile.</p>
          </div>
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
                  <BadgeCell key={badge.id} badge={badge} />
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
