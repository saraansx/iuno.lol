"use client";

import { useState, useCallback, useRef, useEffect, type CSSProperties } from "react";
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
  backgrounds?: string[];
  bannerBackgroundShuffle?: boolean | null;
  bannerBackgroundAutoplay?: boolean | null;
  bgPreviewUrl?: string | null;
  auroraColor1?: string | null;
  auroraColor2?: string | null;
  auroraColor3?: string | null;
  auroraSpeed?: number | null;
  auroraBlend?: number | null;
  darkveilSpeed?: number | null;
  darkveilHueShift?: number | null;
  darkveilNoise?: number | null;
  darkveilScanFreq?: number | null;
  darkveilScan?: number | null;
  darkveilWarp?: number | null;
  pixelblastColor?: string | null;
  pixelblastVariant?: string | null;
  pixelblastPixelSize?: number | null;
  pixelblastPatternScale?: number | null;
  pixelblastPatternDensity?: number | null;
  pixelblastPixelJitter?: number | null;
  pixelblastSpeed?: number | null;
  pixelblastEdgeFade?: number | null;
  pixelblastRipples?: boolean | null;
  pixelblastLiquid?: boolean | null;
  colorbendsColor?: string | null;
  colorbendsRotation?: number | null;
  colorbendsAutoRotate?: number | null;
  colorbendsSpeed?: number | null;
  colorbendsScale?: number | null;
  colorbendsFrequency?: number | null;
  colorbendsWarp?: number | null;
  colorbendsMouse?: number | null;
  colorbendsParallax?: number | null;
  colorbendsNoise?: number | null;
  colorbendsIterations?: number | null;
  colorbendsIntensity?: number | null;
  colorbendsBandWidth?: number | null;
  liquidchromeColor?: string | null;
  liquidchromeSpeed?: number | null;
  liquidchromeAmplitude?: number | null;
  liquidchromeInteractive?: boolean | null;
  crtwarpColor?: string | null;
  crtwarpBackground?: string | null;
  crtwarpSpeed?: number | null;
  crtwarpCurvature?: number | null;
  crtwarpWaveAmount?: number | null;
  crtwarpWaveDensity?: number | null;
  crtwarpScanStrength?: number | null;
  crtwarpScanDensity?: number | null;
  crtwarpBloom?: number | null;
  crtwarpBloomRadius?: number | null;
  crtwarpNoise?: number | null;
  crtwarpVignette?: number | null;
  crtwarpBrightness?: number | null;
  crtwarpRgbShift?: number | null;
  crtwarpPixelSize?: number | null;
  crtwarpRenderQuality?: number | null;
  crtwarpFrameRate?: number | null;
  crtwarpPointerWarp?: boolean | null;
  crtwarpPointerStrength?: number | null;
  crtwarpPaused?: boolean | null;
  backgroundEffect?: string;
  backgroundEffectIntensity?: number;
  backgroundEffectColor?: string;
  backgroundEffectAboveContainer?: boolean;
  borderEffect?: string;
  borderEffectColor?: string;
  cardEffect?: string;
  cardTransition?: string;
  usernameEffect?: string;
  usernameGlowEnabled?: boolean | null;
  descriptionEffect?: string;
  descriptionGlowEnabled?: boolean | null;
  cursorTrail?: string;
  cursorTrailColor?: string;
  clickEffect?: string;
  clickSound?: string;
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
  musicPrimaryFont?: string | null;
  musicPrimaryFontSize?: number | null;
  musicPrimaryFontWeight?: number | null;
  musicPrimaryLetterSpacing?: number | null;
  musicSecondaryFont?: string | null;
  musicSecondaryFontSize?: number | null;
  musicSecondaryFontWeight?: number | null;
  musicSecondaryLetterSpacing?: number | null;
  musicLyricsFont?: string | null;
  musicLyricsFontSize?: number | null;
  musicLyricsFontWeight?: number | null;
  musicLyricsLetterSpacing?: number | null;
  musicPrimaryColor?: string | null;
  musicSecondaryColor?: string | null;
  musicLyricsColor?: string | null;
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
  widgetSecondaryFont?: string | null;
  widgetSecondaryFontSize?: number | null;
  widgetSecondaryFontWeight?: number | null;
  widgetSecondaryLetterSpacing?: number | null;
  wrapInCard?: boolean;
  contentWidth?: number;
  profilePreset?: string;
  profileStructure?: string;
  aboutSectionEnabled?: boolean;
  aboutSectionTitle?: string;
  aboutSectionDescription?: string;
  linksSectionEnabled?: boolean;
  linksSectionTitle?: string;
  linksSectionDescription?: string;
  linksSectionPosition?: string;
  profileSections?: import("@/lib/profile-sections").ProfileSection[];
  widgetsSectionEnabled?: boolean;
  contentAlignment?: string;
  avatarPlacement?: string;
  joinDatePlacement?: string;
  locationPlacement?: string;
  occupationPlacement?: string;
  uidPlacement?: string;
  viewsPlacement?: string;
  feedbackPlacement?: string;
  detailLayout?: unknown;
  joinDateEnabled?: boolean;
  joinDateFormat?: string;
  viewsEnabled?: boolean;
  viewsAnimationEnabled?: boolean;
  viewsAnimationDuration?: number;
  viewsAnimationStyle?: "none" | "countup" | "digitalroll" | "slotroll" | "speeding";
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
  showLinksTooltip?: boolean;
  showBadgesTooltip?: boolean;
  iconsGlowEnabled?: boolean;
  joinDateIconGlow?: boolean | null;
  locationIconGlow?: boolean | null;
  occupationIconGlow?: boolean | null;
  uidIconGlow?: boolean | null;
  viewsIconGlow?: boolean | null;
  feedbackIconGlow?: boolean | null;
  badgeGlowEnabled?: boolean;
  badgeGlowStrength?: number | null;
  badgeSize?: number | null;
  badgeMonochromeEnabled?: boolean;
  badgeMonochromeColor?: string | null;
  badgeContainerStyle?: string | null;
  badgeSpacing?: number | null;
  badgeScrollStyle?: string | null;
  badgeScrollSpeed?: number | null;
  badgeVisibleCount?: number | null;
  badgeShimmerEnabled?: boolean | null;
  createdAt?: string | Date;
  widgets?: import("@/components/dashboard/customize/widgets/WidgetsCustomization").WidgetItem[];
  links?: import("@/lib/links").ProfileLink[];
  linksFont?: string;
  linksFontSize?: number;
  linksFontWeight?: number;
  linksLetterSpacing?: number;
  linksAlignment?: string;
  linksSocialBackground?: boolean;
  linksBorderRadius?: number;
  linksIconSize?: number;
  linksIconGap?: number;
  linksIconColor?: string | null;
  linksTextColor?: string | null;
  musicTracks?: import("@/lib/music").MusicTrack[];
  musicPlayerStyle?: string | null;
  musicPlayerArtBg?: boolean | null;
  musicPlayerVolume?: boolean | null;
  musicPlayerDefaultVolume?: number | null;
  musicPlayerVolumeFixed?: boolean;
  musicPlayerShuffle?: boolean | null;
  musicCardColor?: string | null;
  musicCardOpacity?: number | null;
  equippedBadges?: string[];
  customBadges?: import("@/components/profile/layouts/ProfileBadges").CustomBadge[];
}

const ProfilePreview = ({ userId, username, displayName, bio, location, occupation, avatarUrl, avatarShape, selectedDecoration, selectedEffect, decorationHue, effectHue, bannerImageUrl, bannerBlend, backgrounds, bannerBackgroundShuffle, bannerBackgroundAutoplay, bgPreviewUrl, auroraColor1, auroraColor2, auroraColor3, auroraSpeed, auroraBlend, darkveilSpeed, darkveilHueShift, darkveilNoise, darkveilScanFreq, darkveilScan, darkveilWarp, pixelblastColor, pixelblastVariant, pixelblastPixelSize, pixelblastPatternScale, pixelblastPatternDensity, pixelblastPixelJitter, pixelblastSpeed, pixelblastEdgeFade, pixelblastRipples, pixelblastLiquid, colorbendsColor, colorbendsRotation, colorbendsAutoRotate, colorbendsSpeed, colorbendsScale, colorbendsFrequency, colorbendsWarp, colorbendsMouse, colorbendsParallax, colorbendsNoise, colorbendsIterations, colorbendsIntensity, colorbendsBandWidth, liquidchromeColor, liquidchromeSpeed, liquidchromeAmplitude, liquidchromeInteractive, crtwarpColor, crtwarpBackground, crtwarpSpeed, crtwarpCurvature, crtwarpWaveAmount, crtwarpWaveDensity, crtwarpScanStrength, crtwarpScanDensity, crtwarpBloom, crtwarpBloomRadius, crtwarpNoise, crtwarpVignette, crtwarpBrightness, crtwarpRgbShift, crtwarpPixelSize, crtwarpRenderQuality, crtwarpFrameRate, crtwarpPointerWarp, crtwarpPointerStrength, crtwarpPaused, backgroundEffect, backgroundEffectIntensity, backgroundEffectColor, backgroundEffectAboveContainer, borderEffect, borderEffectColor, cardEffect, cardTransition, usernameEffect, usernameGlowEnabled = false, descriptionEffect, descriptionGlowEnabled = false, cursorTrail, cursorTrailColor, clickEffect, clickSound, entryTransition, pageBgColor, profileBgColor, profileBgOpacity, profileBorderColor, profileBorderOpacity, profileBorderWidth, profileBorderRadius, profileCardBlur, profileBackgroundBlur, profileShadowColor, profileShadowOpacity, profileOpacity, views, usernameFont, usernameFontSize, usernameFontWeight, usernameLetterSpacing, usernameColor, bioFont, bioFontSize, bioFontWeight, bioLetterSpacing, bioColor, otherFont, otherFontSize, otherFontWeight, otherLetterSpacing, otherColor, highlightFont, highlightFontSize, highlightFontWeight, highlightLetterSpacing, widgetPrimaryTextColor, widgetSecondaryTextColor, widgetBorderColor, widgetBorderOpacity, widgetBorderWidth, widgetBorderRadius, widgetFont, widgetFontSize, widgetFontWeight, widgetLetterSpacing, widgetSecondaryFont, widgetSecondaryFontSize, widgetSecondaryFontWeight, widgetSecondaryLetterSpacing, wrapInCard, contentWidth, profilePreset, profileStructure, aboutSectionEnabled, aboutSectionTitle, aboutSectionDescription, linksSectionEnabled, linksSectionTitle, linksSectionDescription, linksSectionPosition, profileSections, widgetsSectionEnabled, contentAlignment, avatarPlacement, joinDatePlacement, locationPlacement, occupationPlacement, uidPlacement, viewsPlacement, feedbackPlacement, detailLayout, joinDateEnabled, joinDateFormat, viewsEnabled, viewsAnimationEnabled, viewsAnimationDuration, viewsAnimationStyle, commentsEnabled, feedbackEnabled, showFeedbackPublicly, showUidTooltip, showLocationTooltip, showOccupationTooltip, showLikesTooltip, showDislikesTooltip, showJoinDateTooltip, showViewsTooltip, showLinksTooltip, showBadgesTooltip, iconsGlowEnabled, joinDateIconGlow, locationIconGlow, occupationIconGlow, uidIconGlow, viewsIconGlow, feedbackIconGlow, badgeGlowEnabled = true, badgeGlowStrength = 50, badgeSize = 18, badgeMonochromeEnabled = false, badgeMonochromeColor = null, badgeContainerStyle = "pill", badgeSpacing = 6, badgeScrollStyle = "none", badgeScrollSpeed = 40, badgeVisibleCount = 5, badgeShimmerEnabled = false,
createdAt, widgets,     musicTracks = [], musicPlayerStyle = "compact", musicPlayerArtBg = false, musicPlayerVolume = true, musicPlayerDefaultVolume = 100, musicPlayerVolumeFixed = true, musicPlayerShuffle = false, musicCardColor = null, musicCardOpacity = 100, links = [], linksAlignment = "center", linksSocialBackground = true, linksBorderRadius = 16, linksIconSize = 17, linksIconGap = 10, linksIconColor = null, linksTextColor = null, linksFont = "Inter", linksFontSize = 13.5, linksFontWeight = 400, linksLetterSpacing = 0, sectionTitleFont = "Inter", sectionTitleFontSize = 15, sectionTitleFontWeight = 500, sectionTitleLetterSpacing = 0, sectionDescFont = "Inter", sectionDescFontSize = 12.5, sectionDescFontWeight = 400, sectionDescLetterSpacing = 0, sectionTitleColor = "#FFFFFF", sectionDescColor = "#FFFFFF", musicPrimaryFont = "Inter", musicPrimaryFontSize = 15, musicPrimaryFontWeight = 400, musicPrimaryLetterSpacing = 0, musicSecondaryFont = "Inter", musicSecondaryFontSize = 12.5, musicSecondaryFontWeight = 400, musicSecondaryLetterSpacing = 0, musicLyricsFont = "Inter", musicLyricsFontSize = 14, musicLyricsFontWeight = 400, musicLyricsLetterSpacing = 0, musicPrimaryColor = "#FFFFFF", musicSecondaryColor = "#FFFFFF", musicLyricsColor =
"#FFFFFF", equippedBadges = [], customBadges = [] }: ProfilePreviewProps) => {
  const [width, setWidth] = useState(380);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollerW, setScrollerW] = useState(0);
  const [open, setOpen] = useState(false);

  const MIN_WIDTH = 300;
  const MAX_WIDTH = 600;

  const dragRef = useRef<{ pointerId: number; el: HTMLDivElement; raf: number | null; x: number } | null>(null);
  const restoreRef = useRef<{ cursor: string; userSelect: string } | null>(null);

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.raf !== null) cancelAnimationFrame(drag.raf);
    try {
      if (drag.el.hasPointerCapture(drag.pointerId)) drag.el.releasePointerCapture(drag.pointerId);
    } catch {
    }
    const restore = restoreRef.current;
    if (restore) {
      document.body.style.cursor = restore.cursor;
      document.body.style.userSelect = restore.userSelect;
      restoreRef.current = null;
    }
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const applyDrag = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    drag.raf = null;
    const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, window.innerWidth - drag.x));
    setWidth((prev) => (prev === next ? prev : next));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
    }
    dragRef.current = { pointerId: e.pointerId, el, raf: null, x: e.clientX };
    restoreRef.current = { cursor: document.body.style.cursor, userSelect: document.body.style.userSelect };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      drag.x = e.clientX;
      if (drag.raf === null) drag.raf = requestAnimationFrame(applyDrag);
    };
    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (drag && e.pointerId !== drag.pointerId) return;
      endDrag();
    };
    const onWindowBlur = () => endDrag();
    const onVisibility = () => {
      if (document.hidden) endDrag();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      endDrag();
    };
  }, [isDragging, applyDrag, endDrag]);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      root.style.setProperty("--preview-width", mq.matches ? `${width}px` : "-2rem");
      if (mq.matches) setOpen(false);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      root.style.removeProperty("--preview-width");
    };
  }, [width]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setScrollerW(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const forceCardWidth = scrollerW > 0 ? Math.max(260, Math.floor(scrollerW - 24)) : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open profile preview"
        title="Open preview"
        className={`lg:hidden fixed bottom-6 right-4 z-50 h-12 w-12 rounded-full bg-[#5b6cf5] text-white flex items-center justify-center transition-all duration-300 ease-out ${
          open ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100 active:scale-95"
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-[69] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

    <div
      ref={panelRef}
      className={`bg-[#0c0c0c] fixed inset-0 z-[70] flex flex-col w-full lg:w-[var(--panel-w)] lg:z-40 lg:left-auto lg:top-4 lg:bottom-4 lg:border-y lg:border-l lg:border-white/5 transition-[opacity,transform] duration-300 ease-out ${
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
      } lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto`}
      style={{ "--panel-w": `${width}px` } as CSSProperties}
    >
      <div
        onPointerDown={handlePointerDown}
        className={`absolute left-0 top-0 bottom-0 w-1.5 touch-none cursor-col-resize z-50 group transition-colors hover:bg-white/5 hidden lg:block ${
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
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close preview"
          title="Close preview"
          className="lg:hidden p-1 -mr-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div
        id="template-capture-root"
        className="flex-1 overflow-hidden relative"
        style={{ backgroundColor: pageBgColor || '#0a0a0a' }}
      >
        <div
          ref={scrollerRef}
          className="w-full h-full overflow-y-auto overflow-x-hidden relative z-10 no-scrollbar [transform:translateZ(0)]"
        >
          <Layout1
            forceCardWidth={forceCardWidth}
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
            backgrounds={backgrounds}
            bannerBackgroundShuffle={bannerBackgroundShuffle}
            bannerBackgroundAutoplay={bannerBackgroundAutoplay}
            bgPreviewUrl={bgPreviewUrl}
            bannerBackgroundSound={false}
            auroraColor1={auroraColor1}
            auroraColor2={auroraColor2}
            auroraColor3={auroraColor3}
            auroraSpeed={auroraSpeed}
            auroraBlend={auroraBlend}
            darkveilSpeed={darkveilSpeed}
            darkveilHueShift={darkveilHueShift}
            darkveilNoise={darkveilNoise}
            darkveilScanFreq={darkveilScanFreq}
            darkveilScan={darkveilScan}
            darkveilWarp={darkveilWarp}
            pixelblastColor={pixelblastColor}
            pixelblastVariant={pixelblastVariant}
            pixelblastPixelSize={pixelblastPixelSize}
            pixelblastPatternScale={pixelblastPatternScale}
            pixelblastPatternDensity={pixelblastPatternDensity}
            pixelblastPixelJitter={pixelblastPixelJitter}
            pixelblastSpeed={pixelblastSpeed}
            pixelblastEdgeFade={pixelblastEdgeFade}
            pixelblastRipples={pixelblastRipples}
            pixelblastLiquid={pixelblastLiquid}
            colorbendsColor={colorbendsColor}
            colorbendsRotation={colorbendsRotation}
            colorbendsAutoRotate={colorbendsAutoRotate}
            colorbendsSpeed={colorbendsSpeed}
            colorbendsScale={colorbendsScale}
            colorbendsFrequency={colorbendsFrequency}
            colorbendsWarp={colorbendsWarp}
            colorbendsMouse={colorbendsMouse}
            colorbendsParallax={colorbendsParallax}
            colorbendsNoise={colorbendsNoise}
            colorbendsIterations={colorbendsIterations}
            colorbendsIntensity={colorbendsIntensity}
            colorbendsBandWidth={colorbendsBandWidth}
            liquidchromeColor={liquidchromeColor}
            liquidchromeSpeed={liquidchromeSpeed}
            liquidchromeAmplitude={liquidchromeAmplitude}
            liquidchromeInteractive={liquidchromeInteractive}
            crtwarpColor={crtwarpColor}
            crtwarpBackground={crtwarpBackground}
            crtwarpSpeed={crtwarpSpeed}
            crtwarpCurvature={crtwarpCurvature}
            crtwarpWaveAmount={crtwarpWaveAmount}
            crtwarpWaveDensity={crtwarpWaveDensity}
            crtwarpScanStrength={crtwarpScanStrength}
            crtwarpScanDensity={crtwarpScanDensity}
            crtwarpBloom={crtwarpBloom}
            crtwarpBloomRadius={crtwarpBloomRadius}
            crtwarpNoise={crtwarpNoise}
            crtwarpVignette={crtwarpVignette}
            crtwarpBrightness={crtwarpBrightness}
            crtwarpRgbShift={crtwarpRgbShift}
            crtwarpPixelSize={crtwarpPixelSize}
            crtwarpRenderQuality={crtwarpRenderQuality}
            crtwarpFrameRate={crtwarpFrameRate}
            crtwarpPointerWarp={crtwarpPointerWarp}
            crtwarpPointerStrength={crtwarpPointerStrength}
            crtwarpPaused={crtwarpPaused}
            backgroundEffect={backgroundEffect}
            backgroundEffectIntensity={backgroundEffectIntensity}
            backgroundEffectColor={backgroundEffectColor}
            backgroundEffectAboveContainer={backgroundEffectAboveContainer}
            borderEffect={borderEffect}
            borderEffectColor={borderEffectColor}
            cardEffect={cardEffect}
            cardTransition={cardTransition}
            usernameEffect={usernameEffect}
            usernameGlowEnabled={usernameGlowEnabled}
            descriptionEffect={descriptionEffect}
            descriptionGlowEnabled={descriptionGlowEnabled}
            cursorTrail={cursorTrail}
            cursorTrailColor={cursorTrailColor}
            clickEffect={clickEffect}
            clickSound={clickSound}
            clickScopeRef={scrollerRef}
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
            musicPrimaryFont={musicPrimaryFont}
            musicPrimaryFontSize={musicPrimaryFontSize}
            musicPrimaryFontWeight={musicPrimaryFontWeight}
            musicPrimaryLetterSpacing={musicPrimaryLetterSpacing}
            musicSecondaryFont={musicSecondaryFont}
            musicSecondaryFontSize={musicSecondaryFontSize}
            musicSecondaryFontWeight={musicSecondaryFontWeight}
            musicSecondaryLetterSpacing={musicSecondaryLetterSpacing}
            musicLyricsFont={musicLyricsFont}
            musicLyricsFontSize={musicLyricsFontSize}
            musicLyricsFontWeight={musicLyricsFontWeight}
            musicLyricsLetterSpacing={musicLyricsLetterSpacing}
            musicPrimaryColor={musicPrimaryColor}
            musicSecondaryColor={musicSecondaryColor}
            musicLyricsColor={musicLyricsColor}
            equippedBadges={equippedBadges}
            customBadges={customBadges}
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
            widgetSecondaryFont={widgetSecondaryFont ?? undefined}
            widgetSecondaryFontSize={widgetSecondaryFontSize ?? undefined}
            widgetSecondaryFontWeight={widgetSecondaryFontWeight ?? undefined}
            widgetSecondaryLetterSpacing={widgetSecondaryLetterSpacing ?? undefined}
            wrapInCard={wrapInCard}
            contentWidth={contentWidth}
            profilePreset={profilePreset}
            profileStructure={profileStructure}
            aboutSectionEnabled={aboutSectionEnabled}
            aboutSectionTitle={aboutSectionTitle}
            aboutSectionDescription={aboutSectionDescription}
            linksSectionEnabled={linksSectionEnabled}
            linksSectionTitle={linksSectionTitle}
            linksSectionDescription={linksSectionDescription}
            linksSectionPosition={linksSectionPosition}
            profileSections={profileSections}
            widgetsSectionEnabled={widgetsSectionEnabled}
            contentAlignment={contentAlignment}
            avatarPlacement={avatarPlacement}
            joinDatePlacement={joinDatePlacement}
            locationPlacement={locationPlacement}
            occupationPlacement={occupationPlacement}
            uidPlacement={uidPlacement}
            viewsPlacement={viewsPlacement}
            feedbackPlacement={feedbackPlacement}
            detailLayout={detailLayout}
            joinDateEnabled={joinDateEnabled}
            joinDateFormat={joinDateFormat}
            viewsEnabled={viewsEnabled}
            viewsAnimationEnabled={viewsAnimationEnabled}
            viewsAnimationDuration={viewsAnimationDuration}
            viewsAnimationStyle={viewsAnimationStyle}
            commentsEnabled={commentsEnabled ?? false}
            feedbackEnabled={feedbackEnabled ?? true}
            showFeedbackPublicly={showFeedbackPublicly ?? true}
            showUidTooltip={showUidTooltip}
            showLocationTooltip={showLocationTooltip}
            showOccupationTooltip={showOccupationTooltip}
            showLikesTooltip={showLikesTooltip}
            showDislikesTooltip={showDislikesTooltip}
            showJoinDateTooltip={showJoinDateTooltip}
            showViewsTooltip={showViewsTooltip}
            showLinksTooltip={showLinksTooltip}
            showBadgesTooltip={showBadgesTooltip}
            iconsGlowEnabled={iconsGlowEnabled}
            joinDateIconGlow={joinDateIconGlow}
            locationIconGlow={locationIconGlow}
            occupationIconGlow={occupationIconGlow}
            uidIconGlow={uidIconGlow}
            viewsIconGlow={viewsIconGlow}
            feedbackIconGlow={feedbackIconGlow}
            badgeGlowEnabled={badgeGlowEnabled}
            badgeGlowStrength={badgeGlowStrength}
            badgeSize={badgeSize}
            badgeMonochromeEnabled={badgeMonochromeEnabled}
            badgeMonochromeColor={badgeMonochromeColor}
            badgeContainerStyle={badgeContainerStyle}
            badgeScrollStyle={badgeScrollStyle}
            badgeScrollSpeed={badgeScrollSpeed}
            badgeVisibleCount={badgeVisibleCount}
            badgeShimmerEnabled={badgeShimmerEnabled}
            badgeSpacing={badgeSpacing}
            createdAt={createdAt}
            widgets={widgets}
            links={links}
            linksAlignment={linksAlignment}
            linksSocialBackground={linksSocialBackground}
            linksBorderRadius={linksBorderRadius}
            linksIconSize={linksIconSize}
            linksIconGap={linksIconGap}
            linksIconColor={linksIconColor}
            linksTextColor={linksTextColor}
            linksFont={linksFont}
            linksFontSize={linksFontSize}
            linksFontWeight={linksFontWeight}
            linksLetterSpacing={linksLetterSpacing}
            musicTracks={musicTracks}
            musicPlayerStyle={musicPlayerStyle}
            musicAutoPlay={false}
            musicPlayerArtBg={musicPlayerArtBg ?? false}
            musicPlayerVolume={musicPlayerVolume ?? true}
            musicPlayerDefaultVolume={musicPlayerDefaultVolume}
            musicPlayerVolumeFixed={musicPlayerVolumeFixed}
            musicPlayerShuffle={musicPlayerShuffle ?? false}
            musicCardColor={musicCardColor}
            musicCardOpacity={musicCardOpacity}
            profileId={userId ?? -1}
            viewerId={-1}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePreview;
