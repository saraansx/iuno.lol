"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FREE_FEATURES, PREMIUM_FEATURES } from "@/lib/plan-features";

const EASE = [0.22, 1, 0.36, 1] as const;

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 512 512" fill="#5b6cf5" aria-hidden="true">
      <path d="M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z" />
    </svg>
  );
}

const FREE_PICKS = FREE_FEATURES;
const PREMIUM_PICKS = PREMIUM_FEATURES;

export default function PlanShowcase() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 38% at 50% 35%, rgba(91,108,245,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[11px] font-medium tracking-[0.32em] text-[#8b93e8] uppercase mb-5"
        >
          Pricing
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6"
        >
          Free hits hard.{" "}
          <span className="bg-gradient-to-r from-[#8b93e8] to-[#cdd2ff] bg-clip-text text-transparent">
            Premium hits harder
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
          className="max-w-xl text-white/50 text-base md:text-lg font-light leading-relaxed"
        >
          Start free, upgrade once, keep it forever.
          No subscriptions, no funny business.
        </motion.p>

        <div className="w-full max-w-3xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 items-end text-left">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="w-full bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col"
          >
            <p className="text-[14px] font-normal text-white/90 tracking-tight mb-1">Free</p>
            <p className="text-[12.5px] font-light text-white/40 mb-4">Everything you need to start.</p>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-medium text-white">$0</span>
              <span className="text-sm font-light text-white/40">/ forever</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8">
              {FREE_PICKS.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                  <CheckIcon />
                  {f}
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-[13px] font-light text-white/35">
                <CheckIcon />
                And much more, etc.
              </li>
            </ul>
            <Link
              href="/register"
              className="mt-auto w-full text-center bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white font-normal rounded-xl py-2.5 text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
            >
              Claim your link
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="w-full bg-[#0c0c0c] border border-[#5b6cf5]/40 rounded-[20px] p-6 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(91,108,245,0.12)]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#5b6cf5]/[0.07] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[14px] font-normal text-white/90 tracking-tight flex items-center gap-2">
                  <CrownIcon />
                  Premium
                </p>
                <span className="text-[11px] font-medium text-white bg-[#5b6cf5] rounded-full px-2.5 py-0.5">
                  Recommended
                </span>
              </div>
              <p className="text-[12.5px] font-light text-white/40 mb-4">Unlock everything, no limits.</p>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl font-medium text-white">$4.99</span>
                <span className="text-sm font-light text-white/40">/ lifetime</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8">
                {PREMIUM_PICKS.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-[13px] font-light text-white/35">
                  <CheckIcon />
                  And much more, etc.
                </li>
              </ul>
              <Link
                href="/pricing"
                className="mt-auto w-full text-center bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white font-normal rounded-xl py-2.5 text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
              >
                Get Premium
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Link href="/pricing" className="text-[13px] font-light text-white/40 hover:text-white/80 transition-colors cursor-pointer">
            View full pricing <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
