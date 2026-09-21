"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { toast } from "@/components/ui/toast";

const Dither = dynamic(() => import("@/components/effects/Dither"), { ssr: false });

// #5b6cf5 -> [0.357, 0.424, 0.961]
const THEME_WAVE_COLOR: [number, number, number] = [0.357, 0.424, 0.961];

function openDiscord() {
  const url = process.env.NEXT_PUBLIC_DISCORD_URL;
  if (!url) {
    toast.error("Discord link isn't set up yet.");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function CustomBadgePromo() {
  return (
    <div className="relative overflow-hidden bg-[#0c0c0c] border border-white/5 rounded-[20px] shadow-sm">
      {/* Dither animated background */}
      <div className="absolute inset-0" aria-hidden="true">
        <Dither
          waveColor={THEME_WAVE_COLOR}
          backgroundColor={[0, 0, 0]}
          waveSpeed={0.05}
          waveFrequency={3}
          waveAmplitude={0.3}
          colorNum={4}
          pixelSize={2}
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.5}
        />
      </div>
      {/* Readability overlay — keeps theme dark glass */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/35" aria-hidden="true" />
      <div className="absolute inset-0 bg-[#5b6cf5]/[0.06]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 p-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Image
            src="/Favicon.png"
            alt="Iuno Logo"
            width={44}
            height={44}
            className="shrink-0 w-11 h-11 object-contain"
            priority
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
                Want your own badge?
              </h2>
              <span className="text-[11px] font-normal rounded-full px-2.5 py-0.5 border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30">
                Custom
              </span>
            </div>
            <p className="text-white/40 text-[13px] mt-1 leading-relaxed">
              Buy a custom badge — your own icon + name, shown on your profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => toast.error("Custom badge purchases open soon — join Discord for now.")}
            className="bg-[#5b6cf5] hover:bg-[#4b5ce4] border border-[#5b6cf5] text-white font-normal rounded-xl px-5 py-2.5 text-[13px] transition-colors cursor-pointer shadow-[0_0_20px_rgba(91,108,245,0.45)]"
          >
            Buy custom badge
          </button>
          <button
            type="button"
            onClick={openDiscord}
            className="bg-[#101010] hover:bg-[#1a1a1a] border border-white/15 text-white font-normal rounded-xl px-5 py-2.5 text-[13px] transition-colors cursor-pointer"
          >
            Join Discord
          </button>
        </div>
      </div>
    </div>
  );
}
