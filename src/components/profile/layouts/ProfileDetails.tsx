"use client";

import React from "react";
import { type DetailKey, type DetailPlacement } from "./ProfilePresetLayout";
import { iconGlowFilter } from "./textGlow";

export interface DetailValues {
  location?: string;
  occupation?: string;
  uid?: number;
  joinDate?: string | null;
  views?: React.ReactNode;
  feedback?: React.ReactNode;
}

export interface DetailPlacements {
  location: DetailPlacement;
  occupation: DetailPlacement;
  uid: DetailPlacement;
  joinDate: DetailPlacement;
  views: DetailPlacement;
  feedback: DetailPlacement;
}

export interface DetailTooltips {
  location?: boolean;
  occupation?: boolean;
  uid?: boolean;
  joinDate?: boolean;
  views?: boolean;
}

export interface DetailIconGlow {
  location?: boolean | null;
  occupation?: boolean | null;
  uid?: boolean | null;
  joinDate?: boolean | null;
}

interface ProfileDetailsProps {
  slot: Exclude<DetailPlacement, "hidden">;
  only?: DetailKey[];
  except?: DetailKey[];
  values: DetailValues;
  placements: DetailPlacements;
  tooltips: DetailTooltips;
  textStyle: React.CSSProperties;
  tooltipTextStyle: React.CSSProperties;
  className?: string;
  iconGlow?: DetailIconGlow;
  iconGlowColor?: string | null;
}

function Tooltip({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
      <div
        className="bg-[#0f0f12]/75 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-white shadow-lg whitespace-nowrap"
        style={style}
      >
        {label}
      </div>
    </div>
  );
}

const ICONS = {
  location: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  ),
  occupation: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  uid: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M10 3 8 21" />
      <path d="M16 3l-2 18" />
    </svg>
  ),
  joinDate: (
    <svg width="13" height="13" viewBox="0 0 512 512" fill="currentColor" stroke="none" className="shrink-0 opacity-80">
      <path d="M480 128a64 64 0 0 0-64-64h-16V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 48v16H144V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 48v16H96a64 64 0 0 0-64 64v12a4 4 0 0 0 4 4h440a4 4 0 0 0 4-4zM32 416a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V180a4 4 0 0 0-4-4H36a4 4 0 0 0-4 4z" />
    </svg>
  ),
} as const;

export default function ProfileDetails({
  slot,
  only,
  except,
  values,
  placements,
  tooltips,
  textStyle,
  tooltipTextStyle,
  className = "",
  iconGlow,
  iconGlowColor,
}: ProfileDetailsProps) {
  const inSlot = (key: DetailKey) => {
    if (placements[key] !== slot) return false;
    if (only && !only.includes(key)) return false;
    if (except?.includes(key)) return false;
    return true;
  };

  const chips: React.ReactNode[] = [];

  const glowFor = (key: keyof DetailIconGlow): React.CSSProperties => {
    const filter = iconGlowFilter(iconGlowColor, iconGlow?.[key]);
    return filter ? { filter } : {};
  };

  if (inSlot("location") && values.location) {
    chips.push(
      <span key="location" className="flex items-center gap-1.5 group relative">
        <span className="inline-flex shrink-0" style={glowFor("location")}>{ICONS.location}</span>
        {values.location}
        {tooltips.location && <Tooltip label="Location" style={tooltipTextStyle} />}
      </span>
    );
  }

  if (inSlot("occupation") && values.occupation) {
    chips.push(
      <span key="occupation" className="flex items-center gap-1.5 group relative">
        <span className="inline-flex shrink-0" style={glowFor("occupation")}>{ICONS.occupation}</span>
        {values.occupation}
        {tooltips.occupation && <Tooltip label="Occupation" style={tooltipTextStyle} />}
      </span>
    );
  }

  if (inSlot("uid") && values.uid) {
    chips.push(
      <span key="uid" className="flex items-center gap-1.5 group relative">
        <span className="inline-flex shrink-0" style={glowFor("uid")}>{ICONS.uid}</span>
        {values.uid}
        {tooltips.uid && <Tooltip label="UID" style={tooltipTextStyle} />}
      </span>
    );
  }

  if (inSlot("joinDate") && values.joinDate) {
    chips.push(
      <span key="joinDate" className="flex items-center gap-1.5 group relative">
        <span className="inline-flex shrink-0" style={glowFor("joinDate")}>{ICONS.joinDate}</span>
        {values.joinDate}
        {tooltips.joinDate && <Tooltip label="Join date" style={tooltipTextStyle} />}
      </span>
    );
  }

  if (inSlot("views") && values.views) {
    chips.push(
      <span key="views" className="flex items-center gap-2 group relative">
        {values.views}
        {tooltips.views && <Tooltip label="Views" style={tooltipTextStyle} />}
      </span>
    );
  }

  if (inSlot("feedback") && values.feedback) {
    chips.push(
      <span key="feedback" className="flex items-center">
        {values.feedback}
      </span>
    );
  }

  if (chips.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-3 flex-wrap ${className}`}
      style={textStyle}
    >
      {chips}
    </div>
  );
}
