"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUnsavedChanges } from "./UnsavedChangesProvider";
import { PREMIUM_PLAN, CURRENCIES, type Currency } from "@/lib/payments/plans";
import { FREE_FEATURES, PREMIUM_FEATURES } from "@/lib/plan-features";

const DIAMOND_PATH =
  "M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z";

export default function PremiumUpsellCard({
  description = "Take your profile to the next level. Unlock all fonts, styles and effects with premium.",
}: {
  description?: string;
}) {
  const router = useRouter();
  const unsavedChanges = useUnsavedChanges();
  const [compareOpen, setCompareOpen] = useState(false);
  const goCheckout = () => {
    if (unsavedChanges?.isDirty) {
      unsavedChanges.block();
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#5b6cf5]/[0.08] via-transparent to-transparent pointer-events-none" />
      <div className="relative flex flex-col gap-1">
        <span className="flex items-center gap-2 text-[14px] font-medium text-white/90 tracking-tight">
          <svg width="14" height="14" viewBox="0 0 512 512" fill="#5b6cf5" aria-hidden="true">
            <path d={DIAMOND_PATH} />
          </svg>
          Upgrade to Premium
        </span>
        <p className="text-[12.5px] font-normal text-white/40 leading-relaxed">{description}</p>
        <div className="flex items-center gap-2.5 mt-3.5">
          <button
            type="button"
            onClick={goCheckout}
            className="bg-[#5b6cf5] hover:bg-[#5b6cf5]/85 text-white text-[13px] font-medium rounded-xl px-4 py-2 transition-colors cursor-pointer"
          >
            Upgrade
          </button>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            className="bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] text-white/80 text-[13px] font-normal rounded-xl px-4 py-2 transition-colors cursor-pointer"
          >
            Compare Plans
          </button>
        </div>
      </div>

      <AnimatePresence>
        {compareOpen && <ComparePlansModal onClose={() => setCompareOpen(false)} onPurchase={goCheckout} />}
      </AnimatePresence>
    </div>
  );
}

function CheckIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={muted ? "#ffffff40" : "#5b6cf5"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
}

function ComparePlansModal({ onClose, onPurchase }: { onClose: () => void; onPurchase: () => void }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const price = PREMIUM_PLAN[currency];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-plans-title"
        className="w-[min(760px,94vw)] max-h-[90vh] overflow-y-auto bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 id="compare-plans-title" className="text-[15px] font-normal text-white/90 tracking-tight">
              Compare plans
            </h2>
            <p className="text-[12px] text-white/40 mt-1">One payment, Premium is yours forever.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-white/[0.03] border border-white/5 p-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  aria-pressed={currency === c}
                  className={`rounded-full px-3 py-1 text-[12px] font-normal transition-colors cursor-pointer ${
                    currency === c ? "bg-[#5b6cf5]/20 text-white" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-white/5 rounded-[20px] p-5 flex flex-col">
            <p className="text-[14px] font-normal text-white/90 tracking-tight">Free</p>
            <p className="text-[12px] text-white/40 mt-0.5 mb-4">Everything you need to start.</p>
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-3xl font-medium text-white">{price.symbol}0</span>
              <span className="text-[12px] text-white/40">/ forever</span>
            </div>
            <ul className="flex flex-col gap-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[12.5px] text-white/65">
                  <CheckIcon muted />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto w-full rounded-xl bg-white/[0.04] border border-white/5 py-2.5 text-center text-[13px] text-white/45">
              Current plan
            </div>
          </div>

          <div className="relative bg-[#111111] border border-[#5b6cf5]/40 rounded-[20px] p-5 flex flex-col overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#5b6cf5]/[0.07] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-normal text-white/90 tracking-tight flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 512 512" fill="#5b6cf5" aria-hidden="true">
                    <path d={DIAMOND_PATH} />
                  </svg>
                  Premium
                </p>
                <span className="text-[11px] font-normal text-white bg-[#5b6cf5] rounded-full px-2.5 py-0.5">Recommended</span>
              </div>
              <p className="text-[12px] text-white/40 mt-0.5 mb-4">Unlock everything, no limits.</p>
              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-3xl font-medium text-white">
                  {price.symbol}
                  {price.display}
                </span>
                <span className="text-[12px] text-white/40">/lifetime</span>
              </div>
              <ul className="flex flex-col gap-2.5 mb-6">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[12.5px] text-white/75">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onPurchase}
                className="mt-auto w-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/30 text-white font-normal rounded-xl py-2.5 text-[13px] transition-colors cursor-pointer"
              >
                Purchase Premium
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
