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
    if (clean.length < 3 || clean.length > 32) {
      setError("Username must be between 3 and 32 characters.");
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
            colors={["#609fda", "#000000", "#90afcc"]}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#609fda]/10 backdrop-blur-md border border-[#609fda]/20 px-4 py-1.5 rounded-full flex items-center gap-2 mb-8"
          >
            <span className="text-[#609fda] font-medium text-xs">#</span>
            <span className="text-[#609fda]/80 text-xs font-normal tracking-wide">Craft your identity. Claim your unique handle.</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-1 md:gap-2 mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-medium text-white tracking-tight drop-shadow-sm">
              Your Internet Presence.
            </h1>
            <h2 className="text-5xl md:text-7xl font-light text-white/60 tracking-tight">
              One Clean Link.
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-white/50 text-lg md:text-xl font-light leading-relaxed mb-12"
          >
            Custom backgrounds, animated effects, Discord widgets, and more to help your page stand out, completely free.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md bg-white/2 backdrop-blur-xl border border-white/8 rounded-2xl p-1.5 flex items-center gap-2 group focus-within:border-[#609fda]/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div className="flex-1 px-4 py-2 flex items-center gap-1 text-sm">
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
              />
            </div>
            <button 
              onClick={handleClaim}
              className="bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white px-7 py-2.5 rounded-xl font-normal text-sm transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer"
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
