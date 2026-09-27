"use client";

import { useRouter } from "next/navigation";

const DIAMOND_PATH =
  "M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z";

export default function PremiumUpsellCard({
  description = "Take your profile to the next level. Unlock all fonts, styles and effects with premium.",
}: {
  description?: string;
}) {
  const router = useRouter();
  const goPricing = () => router.push("/pricing");

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#5b6cf5]/[0.08] via-transparent to-transparent pointer-events-none" />
      <div className="relative flex flex-col gap-1">
        <span className="flex items-center gap-2 text-[14px] font-medium text-white/90 tracking-tight">
          <svg width="14" height="14" viewBox="0 0 512 512" fill="#5b6cf5" aria-hidden="true">
            <path d={DIAMOND_PATH} />
          </svg>
          Upgrade to Premium
        </span>
        <p className="text-[12.5px] font-normal text-white/40 leading-relaxed">{description}</p>
        <div className="flex items-center gap-2.5 mt-3.5">
          <button
            type="button"
            onClick={goPricing}
            className="bg-[#5b6cf5] hover:bg-[#5b6cf5]/85 text-white text-[13px] font-medium rounded-xl px-4 py-2 transition-colors cursor-pointer"
          >
            Upgrade
          </button>
          <button
            type="button"
            onClick={goPricing}
            className="bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] text-white/80 text-[13px] font-normal rounded-xl px-4 py-2 transition-colors cursor-pointer"
          >
            Compare Plans
          </button>
        </div>
      </div>
    </div>
  );
}
