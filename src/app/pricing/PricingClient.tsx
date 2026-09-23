"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { AuroraEffect } from "@/components/profile/layouts/background-effects/Aurora";
import { MorphingText } from "@/components/ui/morphing-text";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";

interface PricingProps {
  isAuthenticated?: boolean;
}

const FREE_FEATURES = [
  "Custom username & profile page",
  "1 background, 1 audio track, 3 widgets",
  "Core background & text effects",
  "Discord embeds & animated entry",
  "Custom fonts, colors & layouts",
  "Badges, likes, views & comments",
];

const PREMIUM_FEATURES = [
  "5 backgrounds, 10 tracks, 10 widgets",
  "Every background effect unlocked",
  "Every username & description effect",
  "Electric border, card effects & transitions",
  "Every click effect, sound & cursor trail",
  "Every entry transition",
  "Browser tab: title, favicon & cursor",
  "Premium badge on your profile",
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
}

export default function PricingClient({ isAuthenticated = false }: PricingProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black relative" style={{ fontFamily: "var(--font-comfortaa)" }}>
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Aurora wash over the hero half — soft bottom fade so scrolling has no hard edge */}
      <div
        className="absolute inset-x-0 top-0 h-[75vh] overflow-hidden pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
        aria-hidden="true"
      >
        <AuroraEffect color="#5b6cf5" intensity={60} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center pt-48 px-4 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 flex-wrap mb-5"
        >
          <h1 className="text-3xl md:text-5xl font-medium text-white tracking-tight drop-shadow-sm leading-[1.05]">
            Made super simple,
          </h1>
          <div className="text-[#8b7cf6]" style={{ fontFamily: "var(--font-caviar-dreams)" }}>
            <MorphingText
              texts={["for everyone.", "that scales.", "your way.", "no limits."]}
              className="mx-0 h-9 w-[13ch] max-w-none text-left text-3xl md:h-14 md:text-5xl lg:text-5xl"
            />
          </div>
        </motion.div>

        <div className="mb-12 max-w-xl">
          <BlurTextEffect className="text-base font-light leading-relaxed text-white/50">
            One profile, endless possibilities. Free forever, premium when you are ready.
          </BlurTextEffect>
        </div>

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 items-start text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm text-left flex flex-col md:mt-15"
        >
          <p className="text-[14px] font-normal text-white/90 tracking-tight mb-1">Free</p>
          <p className="text-[12.5px] font-light text-white/40 mb-4">Everything you need to start.</p>
          <div className="flex items-baseline gap-1.5 mb-6">
            <span className="text-4xl font-medium text-white">$0</span>
            <span className="text-sm font-light text-white/40">/ forever</span>
          </div>

          <ul className="flex flex-col gap-3 mb-8">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/register")}
            className="mt-auto w-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white font-normal rounded-xl py-2.5 text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-[#0c0c0c] border border-[#5b6cf5]/40 rounded-[20px] p-6 text-left flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(91,108,245,0.12)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#5b6cf5]/[0.07] via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[14px] font-normal text-white/90 tracking-tight flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 512 512" fill="#5b6cf5" aria-hidden="true">
                  <path d="M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z" />
                </svg>
                Premium
              </p>
              <span className="text-[11px] font-medium text-white bg-[#5b6cf5] rounded-full px-2.5 py-0.5">
                Popular
              </span>
            </div>
            <p className="text-[12.5px] font-light text-white/40 mb-4">Unlock everything, no limits.</p>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-medium text-white">$4.99</span>
              <span className="text-sm font-light text-white/40">/ month</span>
            </div>

            <ul className="flex flex-col gap-3 mb-8">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                  <CheckIcon />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => toast.error("Coming soon.")}
              className="mt-auto w-full bg-[#5b6cf5] hover:bg-[#5b6cf5]/85 text-white font-normal rounded-xl py-2.5 text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.25)] cursor-pointer"
            >
              Get Premium
            </button>
          </div>
        </motion.div>
        </div>

      </div>
    </main>
  );
}
