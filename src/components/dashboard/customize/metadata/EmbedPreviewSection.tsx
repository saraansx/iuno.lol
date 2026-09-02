"use client";

import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config";

interface EmbedPreviewSectionProps {
  username: string;
  title: string;
  description: string;
  color: string;
  ogImagePath: string | null;
}

export default function EmbedPreviewSection({
  username,
  title,
  description,
  color,
  ogImagePath,
}: EmbedPreviewSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-4 h-max">
      <div className="flex flex-col gap-1">
        <span className="text-[14px] font-normal text-white/90 tracking-tight">Preview</span>
        <p className="text-[12.5px] text-white/40">Roughly how your link unfurls in Discord</p>
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-xl p-3.5">
        <div className="flex gap-3 border-l-[3px] pl-3" style={{ borderColor: color }}>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-[11.5px] text-white/40 truncate">{SITE_CONFIG.name}</span>
            <span className="text-[13.5px] text-[#609fda] font-medium truncate">
              {title || username}
            </span>
            {description && (
              <p className="text-[12.5px] text-white/60 whitespace-pre-wrap break-words line-clamp-4">
                {description}
              </p>
            )}

            {/* Same URL the OG tag points at, so this is the actual card apps render. */}
            <div className="mt-1.5 relative w-full aspect-[1200/630] rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/5">
              {ogImagePath ? (
                <Image src={ogImagePath} alt="" fill className="object-cover" unoptimized priority />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/15">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 items-start">
        <svg className="text-white/25 shrink-0 mt-px" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <p className="text-[12px] text-white/35">
          Apps cache previews, so changes can take a while to show up.
        </p>
      </div>
    </div>
  );
}
