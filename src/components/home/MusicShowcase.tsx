"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import LyricsMusicPlayer from "@/components/profile/music/LyricsMusicPlayer";
import { SHOWCASE_TRACKS } from "./showcase-tracks";

const EASE = [0.22, 1, 0.36, 1] as const;

const CHIP_SLOTS = [
  { className: "left-0 top-6 -rotate-6", duration: 5.5, delay: 0, frac: 0.2 },
  { className: "right-0 top-1/3 rotate-3", duration: 6.5, delay: 0.8, frac: 0.5 },
  { className: "left-8 -bottom-2 rotate-2", duration: 7, delay: 1.6, frac: 0.8 },
];

function Vinyl({ artwork }: { artwork: string }) {
  return (
    <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] shrink-0">
      <div
        aria-hidden
        className="absolute -inset-10 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(91,108,245,0.28) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        style={{
          background:
            "repeating-radial-gradient(circle at center, #0b0b0d 0px, #0b0b0d 2px, #17171a 3px, #0b0b0d 4px)",
        }}
      >
        <div className="absolute inset-0 rounded-full flex items-center justify-center">
          <div className="relative w-[38%] h-[38%] rounded-full overflow-hidden border border-white/15">
            <Image key={artwork} src={artwork} alt="Track artwork" fill sizes="140px" className="object-cover" />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#08080a] border border-white/20" />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: "conic-gradient(from 200deg, transparent 0deg, rgba(255,255,255,0.09) 20deg, transparent 60deg, transparent 180deg, rgba(255,255,255,0.06) 210deg, transparent 250deg)" }}
      />
    </div>
  );
}

export default function MusicShowcase() {
  const [activeTrack, setActiveTrack] = useState(0);
  const track = SHOWCASE_TRACKS[Math.min(activeTrack, SHOWCASE_TRACKS.length - 1)] ?? SHOWCASE_TRACKS[0];
  const usedTexts = new Set<string>();
  const chips = CHIP_SLOTS.map((slot) => {
    const lines = track.lyrics ?? [];
    let idx = lines.length > 0 ? Math.min(lines.length - 1, Math.floor(lines.length * slot.frac)) : -1;
    let guard = 0;
    while (idx >= 0 && usedTexts.has(lines[idx].text) && guard < lines.length) {
      idx = (idx + 1) % lines.length;
      guard++;
    }
    const text = idx >= 0 ? lines[idx].text : "";
    usedTexts.add(text);
    return { ...slot, text: text.slice(0, 28) };
  });

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 40% at 50% 30%, rgba(91,108,245,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[11px] font-medium tracking-[0.32em] text-[#8b93e8] uppercase mb-5"
        >
          Music player
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6"
        >
          Your soundtrack,{" "}
          <span className="bg-gradient-to-r from-[#8b93e8] to-[#cdd2ff] bg-clip-text text-transparent">
            built in
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
          Add your favourite tracks and let visitors press play right on your profile,
          with a player that matches your colors.
        </motion.p>

        <div className="relative w-full max-w-5xl mt-16 grid lg:grid-cols-[1fr_1.15fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="relative flex justify-center"
          >
            <Vinyl artwork={track.artwork ?? "/showcase/chanel.webp"} />
            {chips.map((chip, i) => (
              <motion.span
                key={`${track.id}-chip-${i}`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: chip.duration, repeat: Infinity, ease: "easeInOut", delay: chip.delay }}
                className={`hidden md:inline-flex absolute ${chip.className} px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md text-[12px] font-normal text-white/70 whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.45)] pointer-events-none`}
              >
                {chip.text}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="w-full max-w-[520px] mx-auto lg:mx-0 text-left"
          >
            <LyricsMusicPlayer
              tracks={SHOWCASE_TRACKS}
              defaultVolume={0.2}
              onTrackChange={setActiveTrack}
              titleStyle={{ fontFamily: "var(--font-inter)", fontSize: "15px", fontWeight: 400, letterSpacing: "0px", color: "#FFFFFF" }}
              artistStyle={{ fontFamily: "var(--font-inter)", fontSize: "12.5px", fontWeight: 400, letterSpacing: "0px", color: "#FFFFFF" }}
              lyricStyle={{ fontFamily: "var(--font-inter)", fontSize: "14px", fontWeight: 400, letterSpacing: "0px" }}
              lyricColor="#FFFFFF"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
