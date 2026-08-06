"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error.tsx]", error);
  }, [error]);

  // Global error boundary catches failures in the root layout itself, so it
  // must render its own <html>/<body>. Kept self-contained — no fonts or
  // shared layout here.
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full flex items-center justify-center bg-[#080808] text-white font-sans"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        <main className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full space-y-5 p-12 rounded-3xl bg-white/[0.02] backdrop-blur-[16px] border border-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#609fda"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>

          <h1 className="text-white text-xl font-normal tracking-tight">
            Something went wrong
          </h1>

          <p className="text-white/50 text-sm font-light leading-relaxed">
            An unexpected error occurred. Please try again.
          </p>

          <button
            onClick={reset}
            className="bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white px-5 py-2.5 rounded-xl font-normal text-sm transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
