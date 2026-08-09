import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * Root 404. Rendered by Next.js for unmatched routes and wherever
 * notFound() is called — most often an unclaimed or deleted profile
 * handle from src/app/[username]/page.tsx.
 *
 * No card: an oversized ghost "404" sits behind crisp copy, letting the
 * shared background stay visible instead of being muted by a panel.
 */
export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-24 font-poppins">
      <main className="relative flex flex-col items-center text-center">
        {/*
          Ghost numeral. Absolutely positioned and pointer-events-none so it
          never interferes with layout or the link below. select-none keeps it
          out of text selection, aria-hidden out of the accessibility tree —
          the heading already conveys "404".
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(11rem,34vw,20rem)] font-semibold leading-none tracking-tighter text-white/[0.06] tabular-nums"
        >
          404
        </span>

        <div className="relative flex flex-col items-center">
          <h1 className="text-white text-2xl font-normal tracking-tight">
            Page not found
          </h1>

          <p className="mt-3 max-w-[19rem] text-[13.5px] font-light leading-relaxed text-white/45">
            This link may be broken, or the profile was never claimed.
          </p>

          <Link
            href="/dashboard"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#609fda]/20 px-5 py-2.5 text-sm font-normal text-white shadow-[0_0_15px_rgba(96,159,218,0.1)] backdrop-blur-sm transition-all hover:bg-[#609fda]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#609fda]/40"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
