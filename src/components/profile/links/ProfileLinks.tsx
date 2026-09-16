"use client";

import type { CSSProperties } from "react";
import type { ProfileLink } from "@/lib/links";
import { DEFAULT_LINK_COLOR } from "@/lib/links";
import { hexToRgba } from "@/lib/utils/color";
import LinkIcon from "@/components/links/LinkIcon";

interface ProfileLinksProps {
  links?: ProfileLink[] | null;
  titleStyle?: CSSProperties;
  className?: string;
  showTooltip?: boolean;
}

function ExternalArrow({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export default function ProfileLinks({ links, titleStyle, className, showTooltip = true }: ProfileLinksProps) {
  const items = (links ?? []).filter((l) => l && l.url && l.title);
  if (items.length === 0) return null;

  const tooltip = (title: string) =>
    showTooltip ? (
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-30">
        <span
          className="block bg-[#0f0f12]/75 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-white shadow-lg whitespace-nowrap text-[11px] font-normal max-w-[220px] truncate"
          style={titleStyle}
        >
          {title}
        </span>
      </span>
    ) : null;

  return (
    <div className={`w-full flex flex-wrap items-stretch gap-2.5 ${className ?? ""}`}>
      {items.map((link) => {
        const color = link.color || DEFAULT_LINK_COLOR;
        return link.variant === "small" ? (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.title}
            className="group relative flex w-11 h-11 items-center justify-center rounded-xl border transition-all hover:scale-[1.04] active:scale-95 cursor-pointer"
            style={{
              borderColor: hexToRgba(color, 25),
              backgroundColor: hexToRgba(color, 8),
              color,
            }}
          >
            {tooltip(link.title)}
            <LinkIcon icon={link.icon} size={17} />
          </a>
        ) : (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex basis-full items-center gap-3 rounded-2xl border px-4 py-3 transition-all active:scale-[0.99] cursor-pointer"
            style={{
              borderColor: hexToRgba(color, 25),
              backgroundColor: hexToRgba(color, 6),
            }}
          >
            {tooltip(link.title)}
            <span
              className="flex w-9 h-9 shrink-0 items-center justify-center rounded-xl border"
              style={{
                borderColor: hexToRgba(color, 30),
                backgroundColor: hexToRgba(color, 14),
                color,
              }}
            >
              <LinkIcon icon={link.icon} size={17} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-normal text-white/90 tracking-tight" style={titleStyle}>
              {link.title}
            </span>
            <ExternalArrow />
          </a>
        );
      })}
    </div>
  );
}
