"use client";

import Image from "next/image";
import { SITE_CONFIG } from "@/lib/config";

interface EmbedPreviewSectionProps {
  username: string;
  displayName: string | null;
  title: string;
  description: string;
  color: string;
  embedBackgroundUrl: string;
  embedIconUrl: string;
  ogImagePath: string | null;
}

const DEFAULT_BG = "/og%20banner.png";
const DEFAULT_ICON = "/Og.png";

export default function EmbedPreviewSection({
  username,
  displayName,
  title,
  description,
  color,
  embedBackgroundUrl,
  embedIconUrl,
  ogImagePath,
}: EmbedPreviewSectionProps) {
  const name = (displayName?.trim() || username).slice(0, 32);
  const bg = embedBackgroundUrl || DEFAULT_BG;
  const savedAutoCard = ogImagePath;

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
            <span className="text-[13.5px] text-[#5b6cf5] font-medium truncate">
              {title || username}
            </span>
            {description && (
              <p className="text-[12.5px] text-white/60 whitespace-pre-wrap break-words line-clamp-4">
                {description}
              </p>
            )}

            {}
            <div className="mt-1.5 relative w-full aspect-[1200/630] rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/5">
              {savedAutoCard && !embedBackgroundUrl && !embedIconUrl ? (
                <Image src={savedAutoCard} alt="" fill className="object-cover" unoptimized priority />
              ) : (
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[rgba(5,5,5,0.7)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={embedIconUrl || DEFAULT_ICON}
                      alt=""
                      className="w-[18%] aspect-square rounded-full object-cover"
                    />
                    <span className="mt-2 text-white text-[22px] leading-none truncate max-w-[80%]">
                      {name}
                    </span>
                  </div>
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
