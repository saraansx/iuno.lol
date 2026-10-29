"use client";

import type { CSSProperties } from "react";
import type { ProfileLink } from "@/lib/links";
import LinkIcon from "@/components/links/LinkIcon";

interface ProfileLinksProps {
  links?: ProfileLink[] | null;
  titleStyle?: CSSProperties;
  showTooltip?: boolean;
  alignment?: string | null;
  socialBackground?: boolean | null;
  borderRadius?: number | null;
  iconSize?: number | null;
  iconGap?: number | null;
}

const ALIGN_JUSTIFY: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

function ExternalArrow({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export default function ProfileLinks({ links, titleStyle, showTooltip = true, alignment, socialBackground, borderRadius, iconSize, iconGap }: ProfileLinksProps) {
  const items = (links ?? []).filter((l) => l && l.url && l.title);
  if (items.length === 0) return null;

  const justify = ALIGN_JUSTIFY[alignment ?? ""] ?? ALIGN_JUSTIFY.center;
  const social = socialBackground ?? true;
  const radius = typeof borderRadius === "number" && Number.isFinite(borderRadius) ? Math.min(32, Math.max(0, borderRadius)) : 16;
  const size = typeof iconSize === "number" && Number.isFinite(iconSize) ? Math.min(32, Math.max(12, iconSize)) : 17;
  const gap = typeof iconGap === "number" && Number.isFinite(iconGap) ? Math.min(24, Math.max(0, iconGap)) : 10;
  const iconBox = social ? Math.round(size * 1.8 + 13) : size + 4;
  const rowIconBox = social ? Math.round(size * 1.1 + 17) : size + 4;

  const tooltip = (title: string) =>
    showTooltip ? (
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 z-30">
        <span
          className="block bg-[#141414] border border-white/10 px-2.5 py-1 rounded-md text-white shadow-lg whitespace-nowrap text-[11px] font-normal max-w-[220px] truncate"
          style={titleStyle}
        >
          {title}
        </span>
      </span>
    ) : null;

  return (
    <div className={`w-full flex flex-wrap items-stretch ${justify}`} style={{ gap: `${gap}px` }}>
      {items.map((link) => {
        const color = link.color ?? null;
        return link.variant === "small" ? (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.title}
            className={`group relative flex shrink-0 items-center justify-center border cursor-pointer ${social ? "border-white/10 bg-white/[0.04] text-white/80" : "border-transparent bg-transparent text-white/80"}`}
            style={{ borderRadius: radius, width: iconBox, height: iconBox }}
          >
            {tooltip(link.title)}
            <LinkIcon icon={link.icon} size={size} color={color} />
          </a>
        ) : (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex basis-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 cursor-pointer"
            style={{ borderRadius: radius }}
          >
            {tooltip(link.title)}
            <span
              className={`flex shrink-0 items-center justify-center border ${social ? "border-white/10 bg-white/[0.05] text-white/85" : "border-transparent bg-transparent text-white/85"}`}
              style={{ borderRadius: Math.min(radius, 12), width: rowIconBox, height: rowIconBox }}
            >
              <LinkIcon icon={link.icon} size={size} color={color} />
            </span>
            <span
              className="min-w-0 flex-1 truncate text-[13.5px] font-normal text-white/90 tracking-tight"
              style={link.textColor ? { ...titleStyle, color: link.textColor } : titleStyle}
            >
              {link.title}
            </span>
            <ExternalArrow />
          </a>
        );
      })}
    </div>
  );
}
