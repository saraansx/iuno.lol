"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const Dither = dynamic(() => import("@/components/effects/Dither"), { ssr: false });

const THEME_WAVE_COLOR: [number, number, number] = [0.357, 0.424, 0.961];

export default function AliasPromo({ premium }: { premium: boolean }) {
  return (
    <div className="relative overflow-hidden bg-[#0c0c0c] border border-white/5 rounded-[20px] shadow-sm">
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/35" aria-hidden="true" />
      <div className="absolute inset-0 bg-[#5b6cf5]/[0.06]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 p-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Image src="/Favicon.png" alt="Iuno Logo" width={44} height={44} className="shrink-0 w-11 h-11 object-contain" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Want an extra username?</h2>
              <span className="text-[11px] font-normal rounded-full px-2.5 py-0.5 border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30">Alias</span>
              {premium && (
                <span className="inline-flex items-center gap-1 text-[11px] font-normal rounded-full px-2.5 py-0.5 border text-[#e9d5ff] bg-[#c084fc]/12 border-[#c084fc]/25">
                  <svg width="10" height="10" viewBox="0 0 512 512" fill="#c084fc" aria-hidden="true">
                    <path d="M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z" />
                  </svg>
                  4× slots
                </span>
              )}
            </div>
            <p className="text-white/40 text-[13px] mt-1 leading-relaxed">
              {premium
                ? "Every alias token gives you 4 aliases with Premium - 1 + 3 bonus."
                : "Buy an alias token - an extra handle that redirects to your profile. Premium gets 4 aliases per token."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            href="/checkout/alias-token"
            className="bg-[#5b6cf5] hover:bg-[#4b5ce4] border border-[#5b6cf5] text-white font-normal rounded-xl px-5 py-2.5 text-[13px] transition-colors cursor-pointer shadow-[0_0_20px_rgba(91,108,245,0.45)]"
          >
            Buy alias token
          </Link>
          {!premium && (
            <Link
              href="/checkout"
              className="bg-[#101010] hover:bg-[#1a1a1a] border border-white/15 text-white font-normal rounded-xl px-5 py-2.5 text-[13px] transition-colors cursor-pointer"
            >
              Get Premium
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
