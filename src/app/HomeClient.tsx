"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ColorBends = dynamic(() => import("@/components/effects/ColorBends"), { ssr: false });

interface HomeProps {
  isAuthenticated?: boolean;
}

export default function Home({ isAuthenticated = false }: HomeProps) {
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
      <main className="min-h-screen bg-transparent relative">
        <div className="absolute inset-0 z-0 blur-[3px] pointer-events-none">
          <ColorBends
            colors={["#5b6cf5", "#000000", "#8b93e8"]}
            rotation={90}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={0.1}
            parallax={0.5}
            iterations={1}
            intensity={0.4}
            bandWidth={6}
            transparent
          />
        </div>

        <Navbar isAuthenticated={isAuthenticated} />

        <div className="relative z-10 flex flex-col items-center justify-center pt-48 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#5b6cf5]/10 backdrop-blur-md border border-[#5b6cf5]/20 px-4 py-1.5 rounded-full flex items-center gap-2 mb-8"
          >
            <span className="text-[#5b6cf5] font-medium text-xs">#</span>
            <span className="text-[#5b6cf5]/80 text-xs font-normal tracking-wide">Craft your identity. Claim your unique handle.</span>
          </motion.div>

          <div className="flex flex-col gap-1 md:gap-2 mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 28, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-medium text-white tracking-tight drop-shadow-sm"
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
            className="max-w-2xl text-white/50 text-lg md:text-xl font-light leading-relaxed mb-3"
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
            className="w-full max-w-md bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl p-1.5 flex items-center gap-2 group focus-within:border-[#5b6cf5]/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div className="flex-1 px-4 py-2 flex items-center gap-1 text-sm" style={{ fontFamily: "var(--font-comfortaa)" }}>
              <span className="text-white/30 font-normal tracking-wide">iuno.lol/</span>
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
              className="bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white px-7 py-2.5 rounded-xl font-normal text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
              style={{ fontFamily: "var(--font-comfortaa)" }}
            >
              Claim
            </button>
          </motion.div>
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
        </div>
      </main>
    </>
  );
}