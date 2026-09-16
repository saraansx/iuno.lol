"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Highlighter } from "@/components/ui/highlighter";
import { MorphingText } from "@/components/ui/morphing-text";

const MORPH_WORDS = [
  "Coming Soon",
  "Something Extraordinary",
  "Under Construction",
  "Private Beta Access",
  "Crafting Your Identity"
];

const LAUNCH_AT = Date.UTC(2026, 8, 18, 0, 0, 0);

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

function remainingParts(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  return [
    Math.floor(total / 86400),
    Math.floor((total % 86400) / 3600),
    Math.floor((total % 3600) / 60),
    total % 60,
  ];
}

function Countdown() {
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMsLeft(LAUNCH_AT - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const parts = remainingParts(msLeft ?? 0);
  const isLive = msLeft !== null && msLeft <= 0;

  if (isLive) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[#609fda] text-sm font-normal tracking-wide"
      >
        We&apos;re live.
      </motion.p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className="flex items-center justify-center gap-2 sm:gap-3 select-none"
      aria-label="Time until launch"
    >
      {UNITS.map((unit, i) => (
        <div key={unit} className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center gap-1 min-w-[52px] sm:min-w-[64px] rounded-2xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5 backdrop-blur-md">
            <span className="text-xl sm:text-2xl font-light text-white tabular-nums leading-none">
              {msLeft === null ? "--" : String(parts[i]).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-normal">
              {unit}
            </span>
          </div>
          {i < UNITS.length - 1 && (
            <span className="text-white/15 text-lg font-light -mt-3">:</span>
          )}
        </div>
      ))}
    </motion.div>
  );
}

export default function ComingSoonPage() {
  const [handle, setHandle] = useState("");

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) {
      return;
    }

    setTimeout(() => {
      window.open("https://discord.gg/QgZEkJjF8q", "_blank");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center relative z-10 px-4 py-12 selection:bg-[#609fda]/30 selection:text-white font-poppins">
      
      <main className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full space-y-5 p-12 rounded-3xl bg-white/[0.02] backdrop-blur-[16px] border border-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 select-none"
        >
          <Image src="/Favicon.png" alt="Iuno Logo" width={512} height={512} className="w-10 h-auto object-contain shrink-0" priority />
          <div className="-translate-y-1">
            <Highlighter action="underline">
              <span className="font-light text-white tracking-tight text-2xl uppercase">
                Iuno<span className="text-[#609fda] lowercase">.lol</span>
              </span>
            </Highlighter>
          </div>
        </motion.div>

        <div className="h-14 sm:h-16 flex items-center justify-center w-full">
          <MorphingText
            texts={MORPH_WORDS}
            className="text-2xl sm:text-4xl font-normal text-gray-400 tracking-tight"
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/50 text-base sm:text-lg max-w-lg mx-auto font-light leading-relaxed"
        >
          <span className="text-white/80 font-normal">iuno.lol</span> gives creators, gamers, and developers a{" "}
          <Highlighter action="highlight">
            <span className="text-white font-normal">clean, ultra-fast home</span>
          </Highlighter>{" "}
          on the web.
        </motion.p>

        <Countdown />

        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleReserve}
          className="w-full max-w-md bg-white/2 backdrop-blur-xl border border-white/8 hover:border-white/15 focus-within:border-[#609fda]/40 p-1.5 rounded-2xl transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center gap-2 group"
        >
          <div className="flex-1 px-4 py-2 flex items-center gap-1 text-sm">
            <span className="text-white/30 font-normal tracking-wide select-none">iuno.lol/</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="username"
              className="bg-transparent border-none outline-none text-white/90 font-normal tracking-wide placeholder:text-white/20 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white px-7 py-2.5 rounded-xl font-normal text-sm transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer flex items-center space-x-1.5 shrink-0"
          >
            <span>Reserve</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/70" />
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="https://discord.gg/QgZEkJjF8q"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-medium transition-all backdrop-blur-md"
          >
            <MessageCircle className="w-4 h-4 text-[#5865F2]" />
            <span>Join Discord for Priority Access</span>
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
