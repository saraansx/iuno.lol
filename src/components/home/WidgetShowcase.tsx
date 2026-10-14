"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";

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

/* -------------------------------------------------------------------------- */
/*  Mock widget cards (static — purely decorative)                            */
/* -------------------------------------------------------------------------- */

const VSCODE_LOGO = "/showcase/vscode.svg";

const SHOWCASE_BADGES = [
  { id: "premium", name: "Discord Nitro", icon: "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png" },
  { id: "hypesquad_house_1", name: "HypeSquad Bravery", icon: "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png" },
  { id: "active_developer", name: "Active Developer", icon: "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png" },
  { id: "bug_hunter_level_1", name: "Discord Bug Hunter", icon: "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png" },
  { id: "early_supporter", name: "Early Supporter", icon: "https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png" },
];

function SpotifyCard() {
  return (
    <div className={`${CARD} w-[300px] p-3.5 flex items-center gap-3.5`}>
      <div className="relative w-[64px] h-[64px] shrink-0 overflow-hidden rounded-2xl border border-white/10">
        <Image src="/showcase/chanel.webp" alt="CHANEL by SAGELUNE" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <SpotifyMark />
          <span className="text-[14px] text-white/95 tracking-tight truncate">CHANEL</span>
        </div>
        <div className="flex items-center gap-2.5 text-[12px] text-white/60">
          <span className="truncate">SAGELUNE</span>
        </div>
      </div>
    </div>
  );
}

function DiscordPresenceCard() {
  return (
    <div className={`${CARD} w-[340px] h-[104px] p-4 flex items-center justify-between relative overflow-hidden`}>
      {/* avatar-blur backdrop, like the live preset */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image src="/showcase/mia.jpg" alt="" fill sizes="340px" className="w-full h-full object-cover opacity-35 blur-[12px] scale-125" />
        <div className="absolute inset-0 bg-[#101010]/50" />
      </div>
      <div className="flex items-center justify-between gap-3.5 min-w-0 w-full relative z-10">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="relative w-[74px] h-[74px] overflow-hidden rounded-full bg-[#181818] border border-white/10">
              <Image src="/showcase/mia.jpg" alt="Mia" fill sizes="74px" className="object-cover" />
            </div>
            <div className="absolute z-20 bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#101010] flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-[#23a55a]" />
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
            <OverflowPingPong>
              <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">Mia</span>
              <span className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-white/10 px-2 py-0.5 rounded-[6px] text-[12px] font-medium leading-none text-white/90 shrink-0 ml-1.5">
                <Image
                  src="https://cdn.discordapp.com/clan-badges/1511684107707355226/4f9ea046adf640ad9bf837d276b4618a.png?size=32"
                  alt="iuno clan badge"
                  width={15}
                  height={15}
                  className="object-contain"
                  unoptimized
                />
                <span>iuno</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                {SHOWCASE_BADGES.map((badge) => (
                  <div
                    key={badge.id}
                    title={badge.name}
                    className="relative w-[18px] h-[18px] shrink-0 flex items-center justify-center"
                  >
                    <Image
                      src={badge.icon}
                      alt={badge.name}
                      width={18}
                      height={18}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </OverflowPingPong>

            <OverflowPingPong>
              <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight shrink-0 whitespace-nowrap">
                <span className="relative w-3.5 h-3.5 shrink-0 rounded-[3px] overflow-hidden flex items-center justify-center">
                  <Image src={VSCODE_LOGO} alt="Visual Studio Code" width={14} height={14} className="object-contain" unoptimized />
                </span>
                <span className="text-white/85">Visual Studio Code</span>
                <span className="text-[12px] text-white/50">• Editing discord.ts</span>
              </div>
            </OverflowPingPong>
          </div>
        </div>
      </div>
    </div>
  );
}

function GitHubCard() {
  return (
    <div className={`${CARD} w-[300px] p-3.5 flex items-center gap-3.5`}>
      <div className="relative w-[64px] h-[64px] shrink-0 overflow-hidden rounded-full border border-white/10">
        <Image src="/showcase/saraansx.jpg" alt="saraansx" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex flex-col gap-1.5">
        <span className="text-[14px] text-white/95 tracking-tight">saraansx</span>
        <div className="flex items-center gap-3 text-[11.5px] text-white/55">
          <span>1 following</span>
          <span>4 repos</span>
        </div>
      </div>
    </div>
  );
}

function YouTubeCard() {
  return (
    <div className={`${CARD} w-[320px] p-3.5 flex items-center gap-3.5`}>
      <div className="relative w-[64px] h-[64px] shrink-0 overflow-hidden rounded-2xl border border-white/10">
        <Image src="/showcase/mrbeast.jpg" alt="MrBeast" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[14px] text-white/95 tracking-tight truncate">MrBeast</span>
        </div>
        <div className="flex items-center gap-3 text-[11.5px] text-white/60">
          <span>
            <span className="text-white/85">518M</span>
            <span className="text-white/40"> subscribers</span>
          </span>
          <span>
            <span className="text-white/85">1K</span>
            <span className="text-white/40"> videos</span>
          </span>
        </div>
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
        <span className="text-[14px] text-white/95 tracking-tight">TenZ</span>
        <div className="flex items-center gap-3 text-[11.5px] text-white/60">
          <span>Radiant</span>
          <span className="text-white/30">•</span>
          <span>VCT Pro</span>
        </div>
      </div>
    </div>
  );
}

function PinterestCard() {
  return (
    <div className={`${CARD} w-[300px] p-3.5 flex items-center gap-3.5`}>
      <div className="relative w-[64px] h-[64px] shrink-0 overflow-hidden rounded-2xl border border-white/10">
        <Image src="/showcase/ohjoy.jpg" alt="Oh Joy!" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[14px] text-white/95 tracking-tight truncate">Oh Joy!</span>
          <span className="text-[11.5px] font-mono text-white/40 shrink-0">@ohjoy</span>
        </div>
        <div className="flex items-center gap-1 text-[11.5px] text-white/60">
          <span className="text-white/85">15.1M</span>
          <span className="text-white/40">followers</span>
        </div>
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
  { node: <YouTubeCard />, className: "left-[3%] bottom-[12%]", rotate: 5, depth: 0.55, delay: 0.1 },
  { node: <ValorantCard />, className: "left-1/2 -translate-x-1/2 bottom-[1%]", rotate: -2, depth: 0.85, delay: 0.22 },
  { node: <PinterestCard />, className: "right-[2%] bottom-[14%]", rotate: -5, depth: 0.5, delay: 0.15 },
];

export default function WidgetShowcase() {
  return (
    <section id="widgets" className="relative overflow-hidden py-24 lg:py-0 lg:min-h-[860px] flex items-center">
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
          Live widgets
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6"
        >
          Your page,{" "}
          <span className="bg-gradient-to-r from-[#8b93e8] to-[#cdd2ff] bg-clip-text text-transparent">
            but alive
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
          Plug in live widgets for your music, games, code, videos and socials.
          They update on their own, so your profile never sits still.
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
