"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  selectedEffect?: {
    id: string;
    name: string;
    sku_id: string;
    effects: {
      src: string;
      loop: boolean;
      duration: number;
      start: number;
      z_index?: number;
    }[];
  } | null;
  decorationHue?: number;
  effectHue?: number;
  bannerImageUrl?: string | null;
  bannerBlend?: boolean;
  bannerBackgroundUrl?: string | null;
  backgroundEffect?: string;
  backgroundEffectIntensity?: number;
  backgroundEffectColor?: string;
  backgroundEffectAboveContainer?: boolean;
  borderEffect?: string;
  borderEffectColor?: string;
  cardEffect?: string;
  cardTransition?: string;
  usernameEffect?: string;
  descriptionEffect?: string;
  cursorTrail?: string;
  cursorTrailColor?: string;
  entryTransition?: string;
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
  sectionTitleFont?: string;
  sectionTitleFontSize?: number;
  sectionTitleFontWeight?: number;
  sectionTitleLetterSpacing?: number;
  sectionDescFont?: string;
  sectionDescFontSize?: number;
  sectionDescFontWeight?: number;
  sectionDescLetterSpacing?: number;
  sectionTitleColor?: string;
  sectionDescColor?: string;
  otherFont?: string;
  otherFontSize?: number;
  otherFontWeight?: number;
  otherLetterSpacing?: number;
  otherColor?: string;
  highlightFont?: string;
  highlightFontSize?: number;
  highlightFontWeight?: number;
  highlightLetterSpacing?: number;
  widgetPrimaryTextColor?: string;
  widgetSecondaryTextColor?: string;
  widgetBorderColor?: string;
  widgetBorderOpacity?: number;
  widgetBorderWidth?: number;
  widgetBorderRadius?: number;
  widgetFont?: string;
  widgetFontSize?: number;
  widgetFontWeight?: number;
  widgetLetterSpacing?: number;
  wrapInCard?: boolean;
  contentWidth?: number;
  profilePreset?: string;
  profileStructure?: string;
  aboutSectionEnabled?: boolean;
  aboutSectionTitle?: string;
  aboutSectionDescription?: string;
  widgetsSectionEnabled?: boolean;
  contentAlignment?: string;
  avatarPlacement?: string;
  joinDatePlacement?: string;
  locationPlacement?: string;
  occupationPlacement?: string;
  uidPlacement?: string;
  viewsPlacement?: string;
  feedbackPlacement?: string;
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
  widgets?: import("@/components/dashboard/customize/widgets/WidgetsCustomization").WidgetItem[];
  musicTracks?: import("@/lib/music").MusicTrack[];
  musicPlayerStyle?: string | null;
  musicPlayerArtBg?: boolean | null;
  musicPlayerVolume?: boolean | null;
  musicPlayerVolumeFixed?: boolean;
}

const ProfilePreview = ({ userId, username, displayName, bio, location, occupation, avatarUrl, avatarShape, selectedDecoration, selectedEffect, decorationHue, effectHue, bannerImageUrl, bannerBlend, bannerBackgroundUrl, backgroundEffect, backgroundEffectIntensity, backgroundEffectColor, backgroundEffectAboveContainer, borderEffect, borderEffectColor, cardEffect, cardTransition, usernameEffect, descriptionEffect, cursorTrail, cursorTrailColor, entryTransition, pageBgColor, profileBgColor, profileBgOpacity, profileBorderColor, profileBorderOpacity, profileBorderWidth, profileBorderRadius, profileCardBlur, profileBackgroundBlur, profileShadowColor, profileShadowOpacity, profileOpacity, views, usernameFont, usernameFontSize, usernameFontWeight, usernameLetterSpacing, usernameColor, bioFont, bioFontSize, bioFontWeight, bioLetterSpacing, bioColor, otherFont, otherFontSize, otherFontWeight, otherLetterSpacing, otherColor, highlightFont, highlightFontSize, highlightFontWeight, highlightLetterSpacing, widgetPrimaryTextColor, widgetSecondaryTextColor, widgetBorderColor, widgetBorderOpacity, widgetBorderWidth, widgetBorderRadius, widgetFont, widgetFontSize, widgetFontWeight, widgetLetterSpacing, wrapInCard, contentWidth, profilePreset, profileStructure, aboutSectionEnabled, aboutSectionTitle, aboutSectionDescription, widgetsSectionEnabled, contentAlignment, avatarPlacement, joinDatePlacement, locationPlacement, occupationPlacement, uidPlacement, viewsPlacement, feedbackPlacement, joinDateEnabled, joinDateFormat, viewsEnabled, viewsAnimationEnabled, viewsAnimationDuration, commentsEnabled, feedbackEnabled, showFeedbackPublicly, showUidTooltip, showLocationTooltip, showOccupationTooltip, showLikesTooltip, showDislikesTooltip, showJoinDateTooltip, showViewsTooltip, createdAt, widgets, musicTracks = [], musicPlayerStyle = "compact", musicPlayerArtBg = true, musicPlayerVolume = false, musicPlayerVolumeFixed = true, sectionTitleFont = "Inter", sectionTitleFontSize = 15, sectionTitleFontWeight = 500, sectionTitleLetterSpacing = 0, sectionDescFont = "Inter", sectionDescFontSize = 12.5, sectionDescFontWeight = 400, sectionDescLetterSpacing = 0, sectionTitleColor = "#FFFFFF", sectionDescColor = "#FFFFFF" }: ProfilePreviewProps) => {
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

      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/20 font-normal">
          Preview
        </p>
      </div>

      <div
        className="flex-1 overflow-hidden relative"
        style={{ backgroundColor: pageBgColor || '#0a0a0a' }}
      >
        <div
          className="w-full h-full overflow-y-auto overflow-x-hidden relative z-10 [&::-webkit-scrollbar]:hidden"
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
            selectedEffect={selectedEffect}
            decorationHue={decorationHue}
            effectHue={effectHue}
            bannerImageUrl={bannerImageUrl}
            bannerBlend={bannerBlend}
            bannerBackgroundUrl={bannerBackgroundUrl}
            bannerBackgroundSound={false}
            backgroundEffect={backgroundEffect}
            backgroundEffectIntensity={backgroundEffectIntensity}
            backgroundEffectColor={backgroundEffectColor}
            backgroundEffectAboveContainer={backgroundEffectAboveContainer}
            borderEffect={borderEffect}
            borderEffectColor={borderEffectColor}
            cardEffect={cardEffect}
            cardTransition={cardTransition}
            usernameEffect={usernameEffect}
            descriptionEffect={descriptionEffect}
            cursorTrail={cursorTrail}
            cursorTrailColor={cursorTrailColor}
            entryTransition={entryTransition}
            enterScreenEnabled={false}
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
            sectionTitleFont={sectionTitleFont}
            sectionTitleFontSize={sectionTitleFontSize}
            sectionTitleFontWeight={sectionTitleFontWeight}
            sectionTitleLetterSpacing={sectionTitleLetterSpacing}
            sectionDescFont={sectionDescFont}
            sectionDescFontSize={sectionDescFontSize}
            sectionDescFontWeight={sectionDescFontWeight}
            sectionDescLetterSpacing={sectionDescLetterSpacing}
            sectionTitleColor={sectionTitleColor}
            sectionDescColor={sectionDescColor}
            otherFont={otherFont}
            otherFontSize={otherFontSize}
            otherFontWeight={otherFontWeight}
            otherLetterSpacing={otherLetterSpacing}
            otherColor={otherColor}
            highlightFont={highlightFont}
            highlightFontSize={highlightFontSize}
            highlightFontWeight={highlightFontWeight}
            highlightLetterSpacing={highlightLetterSpacing}
            widgetPrimaryTextColor={widgetPrimaryTextColor}
            widgetSecondaryTextColor={widgetSecondaryTextColor}
            widgetBorderColor={widgetBorderColor}
            widgetBorderOpacity={widgetBorderOpacity}
            widgetBorderWidth={widgetBorderWidth}
            widgetBorderRadius={widgetBorderRadius}
            widgetFont={widgetFont}
            widgetFontSize={widgetFontSize}
            widgetFontWeight={widgetFontWeight}
            widgetLetterSpacing={widgetLetterSpacing}
            wrapInCard={wrapInCard}
            contentWidth={contentWidth}
            profilePreset={profilePreset}
            profileStructure={profileStructure}
            aboutSectionEnabled={aboutSectionEnabled}
            aboutSectionTitle={aboutSectionTitle}
            aboutSectionDescription={aboutSectionDescription}
            widgetsSectionEnabled={widgetsSectionEnabled}
            contentAlignment={contentAlignment}
            avatarPlacement={avatarPlacement}
            joinDatePlacement={joinDatePlacement}
            locationPlacement={locationPlacement}
            occupationPlacement={occupationPlacement}
            uidPlacement={uidPlacement}
            viewsPlacement={viewsPlacement}
            feedbackPlacement={feedbackPlacement}
            joinDateEnabled={joinDateEnabled}
            joinDateFormat={joinDateFormat}
            viewsEnabled={viewsEnabled}
            viewsAnimationEnabled={viewsAnimationEnabled}
            viewsAnimationDuration={viewsAnimationDuration}
            commentsEnabled={commentsEnabled ?? false}
            feedbackEnabled={feedbackEnabled ?? false}
            showFeedbackPublicly={showFeedbackPublicly ?? false}
            showUidTooltip={showUidTooltip}
            showLocationTooltip={showLocationTooltip}
            showOccupationTooltip={showOccupationTooltip}
            showLikesTooltip={showLikesTooltip}
            showDislikesTooltip={showDislikesTooltip}
            showJoinDateTooltip={showJoinDateTooltip}
            showViewsTooltip={showViewsTooltip}
            createdAt={createdAt}
            widgets={widgets}
            musicTracks={musicTracks}
            musicPlayerStyle={musicPlayerStyle}
            musicAutoPlay={false}
            musicPlayerArtBg={musicPlayerArtBg ?? true}
            musicPlayerVolume={musicPlayerVolume ?? false}
            musicPlayerVolumeFixed={musicPlayerVolumeFixed}
            profileId={userId ?? -1}
            viewerId={-1}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
