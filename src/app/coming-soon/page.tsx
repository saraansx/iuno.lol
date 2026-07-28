"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IconBrandDiscord, IconArrowRight } from "@tabler/icons-react";
import { Highlighter } from "@/components/ui/highlighter";
import { MorphingText } from "@/components/ui/morphing-text";


const MORPH_WORDS = [
  "Coming Soon",
  "Something Extraordinary",
  "Under Construction",
  "Private Beta Access",
  "Crafting Your Identity"
];

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

        {/* Brand Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 select-none"
        >
          <Image src="/logo.png" alt="Iuno Logo" width={40} height={40} className="object-contain" priority />
          <div className="-translate-y-1">
            <Highlighter action="underline">
              <span className="font-light text-white tracking-tight text-2xl uppercase">
                Iuno<span className="text-[#609fda] lowercase">.lol</span>
              </span>
            </Highlighter>
          </div>
        </motion.div>

        {/* Liquid Morphing Title */}
        <div className="h-14 sm:h-16 flex items-center justify-center w-full">
          <MorphingText
            texts={MORPH_WORDS}
            className="text-2xl sm:text-4xl font-normal text-gray-400 tracking-tight"
          />
        </div>

        {/* Description */}
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

        {/* Handle Reservation Form */}
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
            <IconArrowRight className="w-3.5 h-3.5 text-white/70" />
          </button>
        </motion.form>

        {/* Discord Action */}
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
            <IconBrandDiscord className="w-4 h-4 text-[#5865F2]" />
            <span>Join Discord for Priority Access</span>
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
