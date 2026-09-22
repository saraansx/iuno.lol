"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SITE_CONFIG } from "@/lib/config";

interface PricingProps {
  isAuthenticated?: boolean;
}

const FEATURES = [
  "Custom username & profile page",
  "Custom backgrounds and colors",
  "Animated entry effects",
  "Discord, Spotify, GitHub & more widgets",
  "Custom fonts and layouts",
  "Profile music with lyrics",
  "Badges and profile decorations",
  "Likes, views & comments",
];

export default function PricingClient({ isAuthenticated = false }: PricingProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black relative" style={{ fontFamily: "var(--font-comfortaa)" }}>
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="relative z-10 flex flex-col items-center justify-center pt-48 px-4 pb-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-medium text-white tracking-tight drop-shadow-sm mb-4"
        >
          Simple, free pricing.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl text-white/50 text-lg font-light leading-relaxed mb-12"
        >
          Everything you need to stand out on the web — completely free.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm text-left"
        >
          <p className="text-[14px] font-normal text-white/90 tracking-tight mb-1">Free</p>
          <div className="flex items-baseline gap-1.5 mb-6">
            <span className="text-4xl font-medium text-white">$0</span>
            <span className="text-sm font-light text-white/40">/ forever</span>
          </div>

          <ul className="flex flex-col gap-3 mb-8">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M20 6L9 17L4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/register")}
            className="w-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white font-normal rounded-xl py-2.5 text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-white/30 text-xs font-light"
        >
          Questions?{" "}
          <a
            href={SITE_CONFIG.links.discord}
            target="_blank"
            rel="noreferrer"
            className="text-[#5b6cf5]/80 hover:text-[#5b6cf5] transition-colors"
          >
            Join our Discord
          </a>
        </motion.p>
      </div>
    </main>
  );
}
