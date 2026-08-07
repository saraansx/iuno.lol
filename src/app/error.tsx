"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console. digest is Next.js's server-side
    // error ID — always include it so you can correlate issues with
    // Vercel function logs.
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4 font-poppins">
      <main className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full space-y-5 p-12 rounded-3xl bg-white/[0.02] backdrop-blur-[16px] border border-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        <Image src="/logo.png" alt="Iuno" width={40} height={40} className="object-contain" priority />

        <h1 className="text-white text-xl font-normal tracking-tight">
          Something went wrong
        </h1>

        <p className="text-white/50 text-sm font-light leading-relaxed">
          An unexpected error occurred. You can try again or head back to the home page.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={reset}
            className="bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white px-5 py-2.5 rounded-xl font-normal text-sm transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-5 py-2.5 rounded-xl font-normal text-sm transition-all border border-white/[0.05] hover:border-white/10"
          >
            Go home
          </Link>
        </div>
      </main>
    </div>
  );
}