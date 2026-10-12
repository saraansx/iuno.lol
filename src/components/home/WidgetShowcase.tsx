"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Inline brand marks                                                        */
/* -------------------------------------------------------------------------- */

function SpotifyMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1ED760" className="shrink-0">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
    </svg>
  );
}

function GitHubMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.3-5.47-5.8 0-1.28.47-2.33 1.23-3.15-.12-.3-.53-1.5.12-3.13 0 0 1-.32 3.3 1.2a11.6 11.6 0 0 1 6 0c2.3-1.52 3.3-1.2 3.3-1.2.65 1.63.24 2.83.12 3.13.77.82 1.23 1.87 1.23 3.15 0 4.51-2.81 5.5-5.49 5.79.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.57A12 12 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

function ValorantMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ff4655" className="shrink-0">
      <path d="M23.79 2.47c0-.07-.08-.11-.14-.03l-9.42 11.79c-.06.08-.01.19.09.19h6.1c.12 0 .24-.06.31-.15l3.02-3.78a.5.5 0 0 0 .11-.31V2.47zM.21 7.56c0 .11.03.22.1.31l7.56 9.45c.07.09.19.15.31.15h6.1c.1 0 .15-.11.09-.19L.35 1.09c-.06-.08-.14-.04-.14.03v6.44z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card shell                                                                */
/* -------------------------------------------------------------------------- */

const CARD =
  "bg-[#101010]/85 backdrop-blur-md border border-white/10 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.55)]";

function Thumb({ gradient, children, round = "rounded-2xl" }: { gradient: string; children?: ReactNode; round?: string }) {
  return (
    <div
      className={`relative w-[64px] h-[64px] shrink-0 overflow-hidden border border-white/10 flex items-center justify-center ${round}`}
      style={{ background: gradient }}
    >
      {children}
    </div>
  );
}

function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-normal ${className}`}>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mock widget cards (static — purely decorative)                            */
/* -------------------------------------------------------------------------- */

function SpotifyCard() {
  return (
    <div className={`${CARD} w-[300px] p-3.5 flex items-center gap-3.5`}>
      <Thumb gradient="linear-gradient(135deg,#2b2b2b,#0f0f0f)">
        <span className="text-[22px]">🎧</span>
      </Thumb>
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <SpotifyMark />
          <span className="text-[14px] text-white/95 tracking-tight truncate">Blinding Lights</span>
        </div>
        <div className="flex items-center gap-2.5 text-[12px] text-white/60">
          <span className="truncate">The Weeknd</span>
          <span className="text-white/25">•</span>
          <span className="truncate">After Hours</span>
        </div>
        <Pill className="bg-[#1ED760]/15 text-[#5ee29a] w-fit mt-0.5">Open Track</Pill>
      </div>
    </div>
  );
}

function DiscordPresenceCard() {
  return (
    <div className={`${CARD} w-[320px] p-3.5 flex items-center gap-3.5`}>
      <div className="relative w-[64px] h-[64px] shrink-0 overflow-hidden rounded-full border border-white/10">
        <Image src="/showcase/mia.jpg" alt="Mia" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] text-white/95 tracking-tight">Mia</span>
          <Pill className="bg-white/[0.08] border border-white/10 text-white/80">❤ haunt</Pill>
        </div>
        <span className="text-[12.5px] text-white/85">Visual Studio Code</span>
        <span className="text-[11.5px] text-white/45 truncate">Editing widgets-showcase.tsx</span>
      </div>
    </div>
  );
}

function GitHubCard() {
  return (
    <div className={`${CARD} w-[300px] p-3.5 flex items-center gap-3.5`}>
      <Thumb gradient="linear-gradient(135deg,#3a3a3a,#111)" round="rounded-full">
        <GitHubMark size={26} />
      </Thumb>
      <div className="min-w-0 flex flex-col gap-1.5">
        <span className="text-[14px] text-white/95 tracking-tight">shadcn</span>
        <div className="flex items-center gap-3 text-[11.5px] text-white/55">
          <span>0 following</span>
          <span>227 repos</span>
        </div>
        <Pill className="bg-white/[0.06] border border-white/10 text-white/80 w-fit mt-0.5">
          View Profile
        </Pill>
      </div>
    </div>
  );
}

function DiscordServerCard() {
  return (
    <div className={`${CARD} w-[300px] p-3.5 flex items-center gap-3.5`}>
      <Thumb gradient="linear-gradient(135deg,#4b3b2a,#141414)">
        <span className="text-[22px]">⛏️</span>
      </Thumb>
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#23a55a]" /> 1.1M
          </span>
          <span>170K online</span>
        </div>
        <span className="text-[14px] text-white/95 tracking-tight">Minecraft</span>
        <Pill className="bg-[#5865F2]/20 text-[#aab2ff] w-fit mt-0.5">View Channel</Pill>
      </div>
    </div>
  );
}

function ValorantCard() {
  return (
    <div className={`${CARD} w-[320px] p-3.5 flex items-center gap-3.5`}>
      <Thumb gradient="linear-gradient(135deg,#1f6f5c,#0d2420)">
        <ValorantMark size={26} />
      </Thumb>
      <div className="min-w-0 flex flex-col gap-1.5">
        <span className="text-[14px] text-white/95 tracking-tight">leni#curet</span>
        <div className="flex items-center gap-3 text-[11.5px] text-white/60">
          <span>Ascendant 1</span>
          <span className="text-white/30">•</span>
          <span>11 RR</span>
          <span className="text-white/30">•</span>
          <span>Level 33</span>
        </div>
        <Pill className="bg-[#ff4655]/20 text-[#ff8a92] w-fit mt-0.5">View Profile</Pill>
      </div>
    </div>
  );
}

function MinecraftCard() {
  return (
    <div className={`${CARD} w-[280px] p-3.5 flex items-center gap-3.5`}>
      <Thumb gradient="linear-gradient(135deg,#6b4a32,#2a1d14)">
        <span className="text-[22px]">🟫</span>
      </Thumb>
      <div className="min-w-0 flex flex-col gap-1.5">
        <span className="text-[14px] text-white/95 tracking-tight">Notch</span>
        <span className="text-[11.5px] text-white/45">Minecraft</span>
        <Pill className="bg-[#1ED760]/15 text-[#5ee29a] w-fit mt-0.5">View Profile</Pill>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating wrapper                                                          */
/* -------------------------------------------------------------------------- */

interface FloatSpec {
  node: ReactNode;
  className: string; // absolute position
  rotate: number;
  depth: number; // 0 (back/dim) .. 1 (front)
  delay: number;
}

function Floating({ spec }: { spec: FloatSpec }) {
  const opacity = 0.28 + spec.depth * 0.4;
  return (
    <motion.div
      className={`absolute ${spec.className} pointer-events-none`}
      style={{ opacity, filter: `blur(${(1 - spec.depth) * 1.2}px)` }}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: spec.delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        style={{ rotate: spec.rotate }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6 + spec.depth * 2, repeat: Infinity, ease: "easeInOut", delay: spec.delay }}
      >
        {spec.node}
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

const FLOATS: FloatSpec[] = [
  { node: <SpotifyCard />, className: "left-[1%] top-[16%]", rotate: -7, depth: 0.75, delay: 0.05 },
  { node: <DiscordPresenceCard />, className: "left-1/2 -translate-x-1/2 top-[2%]", rotate: 2, depth: 0.4, delay: 0.12 },
  { node: <GitHubCard />, className: "right-[1%] top-[14%]", rotate: 6, depth: 0.7, delay: 0.18 },
  { node: <DiscordServerCard />, className: "left-[3%] bottom-[12%]", rotate: 5, depth: 0.55, delay: 0.1 },
  { node: <ValorantCard />, className: "left-1/2 -translate-x-1/2 bottom-[1%]", rotate: -2, depth: 0.85, delay: 0.22 },
  { node: <MinecraftCard />, className: "right-[2%] bottom-[14%]", rotate: -5, depth: 0.5, delay: 0.15 },
];

export default function WidgetShowcase() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-0 lg:min-h-[860px] flex items-center">
      {/* indigo ambience to match site theme */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 55%, rgba(91,108,245,0.16) 0%, rgba(91,108,245,0.05) 50%, transparent 70%)",
        }}
      />
      {/* floating cards — desktop only */}
      <div className="hidden lg:block absolute inset-0 max-w-7xl mx-auto">
        {FLOATS.map((spec, i) => (
          <Floating key={i} spec={spec} />
        ))}
      </div>

      {/* center vignette so the heading reads cleanly over the cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(50% 42% at 50% 50%, rgba(8,8,8,0.92) 30%, rgba(8,8,8,0.55) 60%, transparent 100%)",
        }}
      />

      {/* copy */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[11px] font-medium tracking-[0.32em] text-[#8b93e8] uppercase mb-5"
        >
          Profile Widgets
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6"
        >
          Bring your profile{" "}
          <span className="bg-gradient-to-r from-[#8b93e8] to-[#cdd2ff] bg-clip-text text-transparent">
            to life
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-white/50 text-base md:text-lg font-light leading-relaxed"
        >
          Drop in live widgets — your favourite song, your Valorant rank, your GitHub stats,
          your Discord presence and more. They keep themselves up to date, so your page always
          feels alive.
        </motion.p>

        {/* mobile card stack */}
        <div className="lg:hidden flex flex-col items-center gap-4 mt-12 w-full">
          <div className="opacity-90"><SpotifyCard /></div>
          <div className="opacity-90"><ValorantCard /></div>
          <div className="opacity-90"><DiscordPresenceCard /></div>
        </div>
      </div>
    </section>
  );
}
