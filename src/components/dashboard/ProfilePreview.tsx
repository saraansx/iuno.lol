"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Layout1 from "@/components/profile/layouts/Layout1";
import type { Decoration } from "@/components/dashboard/DecorationPicker";

interface ProfilePreviewProps {
  username?: string | null;
  displayName?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  avatarUrl?: string | null;
  avatarShape?: "square" | "soft" | "rounded" | "circle";
  selectedDecoration?: Decoration | null;
  decorationHue?: number;
  bannerImageUrl?: string | null;
  bannerBackgroundUrl?: string | null;
  backgroundEffect?: string;
  backgroundEffectIntensity?: number;
  backgroundEffectColor?: string;
  pageBgColor?: string;
  profileBgColor?: string;
  profileBgOpacity?: number;
  profileBorderColor?: string;
  profileBorderOpacity?: number;
  profileBorderWidth?: number;
  profileBorderRadius?: number;
  profileCardBlur?: number;
  profileBackgroundBlur?: number;
  profileShadowColor?: string;
  profileShadowOpacity?: number;
  profileOpacity?: number;
  views?: number;
  usernameFont?: string;
  usernameFontSize?: number;
  usernameFontWeight?: number;
  usernameLetterSpacing?: number;
  usernameColor?: string;
  bioFont?: string;
  bioFontSize?: number;
  bioFontWeight?: number;
  bioLetterSpacing?: number;
  bioColor?: string;
  otherFont?: string;
  otherFontSize?: number;
  otherFontWeight?: number;
  otherLetterSpacing?: number;
  otherColor?: string;
  highlightFont?: string;
  highlightFontSize?: number;
  highlightFontWeight?: number;
  highlightLetterSpacing?: number;
  highlightColor?: string;
  joinDateEnabled?: boolean;
  joinDateFormat?: string;
  viewsEnabled?: boolean;
  viewsAnimationEnabled?: boolean;
  viewsAnimationDuration?: number;
  userId?: number;
  commentsEnabled?: boolean;
  feedbackEnabled?: boolean;
  showFeedbackPublicly?: boolean;
  showUidTooltip?: boolean;
  showLocationTooltip?: boolean;
  showOccupationTooltip?: boolean;
  showLikesTooltip?: boolean;
  showDislikesTooltip?: boolean;
  showJoinDateTooltip?: boolean;
  showViewsTooltip?: boolean;
  createdAt?: string | Date;
}

const ProfilePreview = ({ userId, username, displayName, bio, location, occupation, avatarUrl, avatarShape, selectedDecoration, decorationHue, bannerImageUrl, bannerBackgroundUrl, backgroundEffect, backgroundEffectIntensity, backgroundEffectColor, pageBgColor, profileBgColor, profileBgOpacity, profileBorderColor, profileBorderOpacity, profileBorderWidth, profileBorderRadius, profileCardBlur, profileBackgroundBlur, profileShadowColor, profileShadowOpacity, profileOpacity, views, usernameFont, usernameFontSize, usernameFontWeight, usernameLetterSpacing, usernameColor, bioFont, bioFontSize, bioFontWeight, bioLetterSpacing, bioColor, otherFont, otherFontSize, otherFontWeight, otherLetterSpacing, otherColor, highlightFont, highlightFontSize, highlightFontWeight, highlightLetterSpacing, highlightColor, joinDateEnabled, joinDateFormat, viewsEnabled, viewsAnimationEnabled, viewsAnimationDuration, commentsEnabled, feedbackEnabled, showUidTooltip, showLocationTooltip, showOccupationTooltip, showLikesTooltip, showDislikesTooltip, showJoinDateTooltip, showViewsTooltip, createdAt }: ProfilePreviewProps) => {
  const [width, setWidth] = useState(380);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const MIN_WIDTH = 300;
  const MAX_WIDTH = 600;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  useEffect(() => {
    document.documentElement.style.setProperty('--preview-width', `${width}px`);
    return () => {
      document.documentElement.style.removeProperty('--preview-width');
    };
  }, [width]);

  return (
    <div
      ref={panelRef}
      className="bg-[#0c0c0c] fixed right-0 top-4 bottom-4 z-40 flex flex-col border-y border-l border-white/5"
      style={{ width: `${width}px` }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 group transition-colors hover:bg-white/5 ${
          isDragging ? "bg-white/5" : ""
        }`}
      >
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-12 rounded-full transition-all ${
          isDragging ? "bg-white/40" : "bg-white/10 group-hover:bg-white/20"
        }`} />
      </div>

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-normal">
          Preview
        </p>
        <a
          href={`/${username || ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#609fda] hover:text-[#609fda]/80 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
        >
          View Profile
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>

      {/* Full Page Preview */}
      <div 
        className="flex-1 overflow-hidden relative"
        style={{ backgroundColor: pageBgColor || '#0a0a0a' }}
      >
        <div
          className="w-full h-full overflow-hidden relative z-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <Layout1 
            username={username ?? undefined} 
            displayName={displayName}
            bio={bio}
            location={location}
            occupation={occupation}
            avatarUrl={avatarUrl}
            avatarShape={avatarShape}
            selectedDecoration={selectedDecoration}
            decorationHue={decorationHue}
            bannerImageUrl={bannerImageUrl}
            bannerBackgroundUrl={bannerBackgroundUrl}
            backgroundEffect={backgroundEffect}
            backgroundEffectIntensity={backgroundEffectIntensity}
            backgroundEffectColor={backgroundEffectColor}
            profileBgColor={profileBgColor}
            profileBgOpacity={profileBgOpacity}
            profileBorderColor={profileBorderColor}
            profileBorderOpacity={profileBorderOpacity}
            profileBorderWidth={profileBorderWidth}
            profileBorderRadius={profileBorderRadius}
            profileCardBlur={profileCardBlur}
            profileBackgroundBlur={profileBackgroundBlur}
            profileShadowColor={profileShadowColor}
            profileShadowOpacity={profileShadowOpacity}
            profileOpacity={profileOpacity}
            views={views}
            usernameFont={usernameFont}
            usernameFontSize={usernameFontSize}
            usernameFontWeight={usernameFontWeight}
            usernameLetterSpacing={usernameLetterSpacing}
            usernameColor={usernameColor}
            bioFont={bioFont}
            bioFontSize={bioFontSize}
            bioFontWeight={bioFontWeight}
            bioLetterSpacing={bioLetterSpacing}
            bioColor={bioColor}
            otherFont={otherFont}
            otherFontSize={otherFontSize}
            otherFontWeight={otherFontWeight}
            otherLetterSpacing={otherLetterSpacing}
            otherColor={otherColor}
            highlightFont={highlightFont}
            highlightFontSize={highlightFontSize}
            highlightFontWeight={highlightFontWeight}
            highlightLetterSpacing={highlightLetterSpacing}
            highlightColor={highlightColor}
            joinDateEnabled={joinDateEnabled}
            joinDateFormat={joinDateFormat}
            viewsEnabled={viewsEnabled}
            viewsAnimationEnabled={viewsAnimationEnabled}
            viewsAnimationDuration={viewsAnimationDuration}
            commentsEnabled={commentsEnabled ?? false}
            feedbackEnabled={feedbackEnabled ?? false}
            showUidTooltip={showUidTooltip}
            showLocationTooltip={showLocationTooltip}
            showOccupationTooltip={showOccupationTooltip}
            showLikesTooltip={showLikesTooltip}
            showDislikesTooltip={showDislikesTooltip}
            showJoinDateTooltip={showJoinDateTooltip}
            showViewsTooltip={showViewsTooltip}
            createdAt={createdAt}
            profileId={userId ?? -1}
            viewerId={-1}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
