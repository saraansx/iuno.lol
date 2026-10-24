"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopFade from "@/components/ui/top-fade";
import FaqShowcase from "@/components/home/FaqShowcase";
import PlanShowcase from "@/components/home/PlanShowcase";
import ShowcaseProfileCard from "@/components/home/ShowcaseProfileCard";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const WidgetShowcase = dynamic(() => import("@/components/home/WidgetShowcase"), { ssr: false });
const MusicShowcase = dynamic(() => import("@/components/home/MusicShowcase"), { ssr: false });
const LinksShowcase = dynamic(() => import("@/components/home/LinksShowcase"), { ssr: false });

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleClaim = () => {
    const clean = username.trim().toLowerCase();

    if (!clean) {
      setError("Username is required.");
      return;
    }
    if (clean.length < 2 || clean.length > 32) {
      setError("Username must be between 2 and 32 characters.");
      return;
    }
    if (!/^[a-z0-9_.]+$/.test(clean)) {
      setError("Only letters, numbers, underscores, and dots allowed.");
      return;
    }

    setError("");
    router.push(`/register?username=${encodeURIComponent(clean)}`);
  };
  return (
    <>
      <main className="min-h-screen bg-transparent relative overflow-x-clip">
        <TopFade />

        <Navbar />

        <div className="relative z-10 min-h-[100svh] max-w-7xl mx-auto px-5 sm:px-6 pt-32 sm:pt-40 pb-16 sm:pb-20 grid lg:grid-cols-[1fr_1.3fr] gap-10 sm:gap-14 lg:gap-6 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

          <div className="flex flex-col gap-1 md:gap-2 mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 28, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-medium text-white tracking-tight drop-shadow-sm text-balance"
            >
              Your Internet Presence.
            </motion.h1>
            {}
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="username-blur inline-block text-2xl md:text-4xl leading-[1.1] font-light tracking-tight bg-gradient-to-r from-white via-[#9aa2f2] to-white/40 bg-clip-text text-transparent"
            >
              One Clean Link.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-white/50 text-[17px] sm:text-xl font-light leading-relaxed mb-3"
          >
            Custom backgrounds, animated effects, Discord widgets, and more to help your page stand out, completely free.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/30 text-[13px] md:text-sm font-light tracking-wide mb-12"
          >
            One link for everything you are. No code, no clutter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.66, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md bg-white/[0.04] sm:bg-white/2 sm:backdrop-blur-xl border border-white/8 rounded-2xl p-1.5 flex items-center gap-2 group focus-within:border-[#5b6cf5]/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] mx-auto lg:mx-0"
          >
            <div className="flex-1 min-w-0 px-3 sm:px-4 py-2 flex items-center gap-1 text-sm" style={{ fontFamily: "var(--font-comfortaa)" }}>
              <span className="text-white/30 font-normal tracking-wide shrink-0">iuno.lol/</span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
                className="bg-transparent border-none outline-none text-white/90 font-normal tracking-wide placeholder:text-white/20 w-full"
                style={{ fontFamily: "var(--font-comfortaa)" }}
              />
            </div>
            <button
              onClick={handleClaim}
              className="shrink-0 bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white px-6 sm:px-7 py-2.5 rounded-xl font-normal text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
              style={{ fontFamily: "var(--font-comfortaa)" }}
            >
              Claim
            </button>
          </motion.div>
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
          </div>

          {}
          <motion.div
            initial={{ opacity: 0, x: 48, filter: "blur(14px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full lg:w-[125%]"
          >
            <div className="home-showcase relative w-full">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-10 -top-16 -bottom-6 sm:-inset-x-24 sm:-top-24 sm:-bottom-10"
                style={{ background: "radial-gradient(45% 45% at 50% 25%, rgba(91,108,245,0.35) 0%, rgba(91,108,245,0.08) 45%, transparent 72%)" }}
              />
              <div className="relative flex justify-center">
                <ShowcaseProfileCard />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <WidgetShowcase />
        </div>

        <div className="relative z-10">
          <MusicShowcase />
        </div>

        <div className="relative z-10">
          <LinksShowcase />
        </div>

        <div className="relative z-10">
          <PlanShowcase />
        </div>

        <div className="relative z-10">
          <FaqShowcase />
        </div>

        <Footer />
      </main>
    </>
  );
}