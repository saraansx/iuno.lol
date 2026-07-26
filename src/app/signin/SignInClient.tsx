"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center p-4 font-poppins relative overflow-hidden">

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-100 bg-white/2 backdrop-blur-[32px] border border-white/8 rounded-4xl p-8 md:p-10 flex flex-col items-center relative z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
      >
        {/* Logo */}
        <Link href="/" className="mb-6 flex justify-center hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Iuno Logo" width={64} height={64} className="object-contain" priority />
        </Link>

        <h1 className="text-2xl font-normal text-white mb-2 tracking-tight">Welcome back</h1>
        <p className="text-white/60 text-sm font-normal mb-8 text-center">
          Choose your preferred method to sign in
        </p>

        {error === "discord_email_unverified" && (
          <div className="w-full mb-5 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg className="text-red-400 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg>
            <p className="text-red-400 text-xs font-medium">
              Your Discord email is not verified. Please verify your email on Discord and try again.
            </p>
          </div>
        )}

        <LoginForm />

        {/* SIGN UP LINK */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/40 font-light">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#609fda] hover:text-[#609fda]/80 transition-colors font-medium">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
