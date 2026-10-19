"use client";

import React, {  useEffect, useRef, useState, useSyncExternalStore  } from "react";
import Image from "next/image";
import { isVideoUrl } from "@/lib/utils/media";
import { animatedBackgroundId } from "@/lib/animated-background";
import AnimatedBackground from "./AnimatedBackground";
import dynamic from "next/dynamic";

const CommentsModal = dynamic(() => import("../comments/CommentsModal").then((m) => m.CommentsModal));
import FeedbackButtons from "../feedback/FeedbackButtons";
import { BackgroundEffect } from "./BackgroundEffect";
import { BorderEffect } from "./BorderEffect";
import { CardEffect } from "./CardEffect";
import { CardTransition } from "./CardTransition";
import { UsernameEffect } from "./UsernameEffect";
import { textGlowShadow } from "./textGlow";
import ProfileBadges from "./ProfileBadges";
import { DescriptionEffect } from "./DescriptionEffect";
import { CursorTrail } from "./CursorTrail";
import ClickEffects from "./ClickEffects";
import { EntryTransition } from "./EntryTransition";
import ProfileWidgets from "../widgets/ProfileWidgets";
import ProfileLinks from "../links/ProfileLinks";
import CompactMusicPlayer from "../music/CompactMusicPlayer";
import ViewsCounterAnimation from "./ViewsCounterAnimation";
import LyricsMusicPlayer from "../music/LyricsMusicPlayer";
import WaveformMusicPlayer from "../music/WaveformMusicPlayer";
import {
  BADGE_CLASSES,
  DEFAULT_DETAILS,
  DEFAULT_FRAME,
  DEFAULT_PRESET,
  type DetailKey,
  getPresetLayout,
  normalizeAlignment,
  normalizeAvatarPlacement,
  normalizePlacement,
} from "./ProfilePresetLayout";
import ProfileDetails, {
  type DetailPlacements,
  type DetailTooltips,
} from "./ProfileDetails";
import { iconGlowFilter } from "./textGlow";
import { FONT_FAMILY_VARS } from "@/lib/fonts";
import type { Layout1Props } from "./Layout1.types";
import { SHAPE_CLASSES, renderFormattedText, hexToRgba, MOBILE_ANIMATED_BG_MAX_BLUR, subscribeCoarsePointer, isCoarsePointer } from "./Layout1.helpers";
import { AvatarInner } from "./ProfileAvatar";
import ProfileEffectRenderer from "./ProfileEffectRenderer";

const FONT_CLASS_MAP = FONT_FAMILY_VARS;

const Layout1 = ({
  isScreenshot = false,
  username,
  displayName,
  bio,
  location,
  occupation,
  avatarUrl,
  avatarShape = "circle",
  selectedDecoration,
  decorationHue = 0,
  selectedEffect,
  effectHue = 0,
  bannerImageUrl,
  bannerBlend = false,
  backgrounds,
  bannerBackgroundShuffle,
  bannerBackgroundAutoplay,
  bgPreviewUrl,
  bannerBackgroundSound = false,
  auroraColor1,
  auroraColor2,
  auroraColor3,
  auroraSpeed,
  auroraBlend,
  darkveilSpeed,
  darkveilHueShift,
  darkveilNoise,
  darkveilScanFreq,
  darkveilScan,
  darkveilWarp,
  pixelblastColor,
  pixelblastVariant,
  pixelblastPixelSize,
  pixelblastPatternScale,
  pixelblastPatternDensity,
  pixelblastPixelJitter,
  pixelblastSpeed,
  pixelblastEdgeFade,
  pixelblastRipples,
  pixelblastLiquid,
  colorbendsColor,
  colorbendsRotation,
  colorbendsAutoRotate,
  colorbendsSpeed,
  colorbendsScale,
  colorbendsFrequency,
  colorbendsWarp,
  colorbendsMouse,
  colorbendsParallax,
  colorbendsNoise,
  colorbendsIterations,
  colorbendsIntensity,
  colorbendsBandWidth,
  liquidchromeColor,
  liquidchromeSpeed,
  liquidchromeAmplitude,
  liquidchromeInteractive,
  crtwarpColor,
  crtwarpBackground,
  crtwarpSpeed,
  crtwarpCurvature,
  crtwarpWaveAmount,
  crtwarpWaveDensity,
  crtwarpScanStrength,
  crtwarpScanDensity,
  crtwarpBloom,
  crtwarpBloomRadius,
  crtwarpNoise,
  crtwarpVignette,
  crtwarpBrightness,
  crtwarpRgbShift,
  crtwarpPixelSize,
  crtwarpRenderQuality,
  crtwarpFrameRate,
  crtwarpPointerWarp,
  crtwarpPointerStrength,
  crtwarpPaused,
  backgroundEffect,
  backgroundEffectIntensity = 50,
  backgroundEffectColor = "#ffffff",
  backgroundEffectAboveContainer = false,
  borderEffect,
  borderEffectColor = "#ffffff",
  cardEffect = "none",
  cardTransition = "none",
  usernameEffect = "none",
  usernameGlowEnabled = false,
  descriptionEffect = "none",
  descriptionGlowEnabled = false,
  equippedBadges = [],
  customBadges = [],
  badgeGlowEnabled = true,
  badgeGlowStrength = 50,
  badgeSize = 18,
  badgeMonochromeEnabled = false,
  badgeMonochromeColor = null,
  badgeContainerStyle = "pill",
  badgeSpacing = 6,
  badgeScrollStyle = "none",
  badgeScrollSpeed = 40,
  badgeVisibleCount = 5,
  badgeShimmerEnabled = false,
  cursorTrail = "none",
  cursorTrailColor = "#ffffff",
  clickEffect,
  clickSound,
  clickScopeRef,
  entryTransition = "none",
  enterScreenEnabled = false,
  enterScreenText = "click to enter",
  enterScreenFont = "Inter",
  enterScreenFontSize = 14,
  enterScreenFontWeight = 500,
  enterScreenLetterSpacing = 2,
  enterScreenColor = "#ffffff",
  enterScreenOpacity = 80,
  enterScreenBlur = 16,
  enterScreenBlurColor = "#000000",
  profileBgColor = "#050505",
  profileBgOpacity = 10,
  profileBorderColor = "#ffffff",
  profileBorderOpacity = 10,
  profileBorderWidth = 0,
  profileBorderRadius = 24,
  profileCardBlur = 0,
  profileBackgroundBlur = 0,
  profileShadowColor = "#000000",
  profileShadowOpacity = 0,
  profileOpacity = 100,
  views = 0,
  usernameFont = "Inter",
  usernameFontSize = 24,
  usernameFontWeight = 700,
  usernameLetterSpacing = 0,
  usernameColor = "#FFFFFF",
  bioFont = "Inter",
  bioFontSize = 15,
  bioFontWeight = 400,
  bioLetterSpacing = 0,
  bioColor = "#FFFFFF",
  sectionTitleFont = "Inter",
  sectionTitleFontSize = 15,
  sectionTitleFontWeight = 500,
  sectionTitleLetterSpacing = 0,
  sectionDescFont = "Inter",
  sectionDescFontSize = 12.5,
  sectionDescFontWeight = 400,
  sectionDescLetterSpacing = 0,
  sectionTitleColor = "#FFFFFF",
  sectionDescColor = "#FFFFFF",
  musicPrimaryFont = "Inter",
  musicPrimaryFontSize = 15,
  musicPrimaryFontWeight = 400,
  musicPrimaryLetterSpacing = 0,
  musicSecondaryFont = "Inter",
  musicSecondaryFontSize = 12.5,
  musicSecondaryFontWeight = 400,
  musicSecondaryLetterSpacing = 0,
  musicLyricsFont = "Inter",
  musicLyricsFontSize = 14,
  musicLyricsFontWeight = 400,
  musicLyricsLetterSpacing = 0,
  musicPrimaryColor = "#FFFFFF",
  musicSecondaryColor = "#FFFFFF",
  musicLyricsColor = "#FFFFFF",
  otherFont = "Inter",
  otherFontSize = 14,
  otherFontWeight = 400,
  otherLetterSpacing = 0,
  otherColor = "#5b6cf5",
  highlightFont = "Inter",
  highlightFontSize = 11,
  highlightFontWeight = 500,
  highlightLetterSpacing = 0,
  widgetPrimaryTextColor,
  widgetSecondaryTextColor,
  widgetBorderColor,
  widgetBorderOpacity,
  widgetBorderWidth,
  widgetBorderRadius,
  widgetFont,
  widgetFontSize,
  widgetFontWeight,
  widgetLetterSpacing,
  widgetSecondaryFont,
  widgetSecondaryFontSize,
  widgetSecondaryFontWeight,
  widgetSecondaryLetterSpacing,
  wrapInCard = DEFAULT_FRAME.wrapInCard,
  contentWidth = DEFAULT_FRAME.contentWidth,
  forceCardWidth,
  profilePreset = DEFAULT_PRESET,
  profileStructure,
  aboutSectionEnabled = true,
  aboutSectionTitle,
  aboutSectionDescription,
  linksSectionEnabled = true,
  linksSectionTitle,
  linksSectionDescription,
  linksSectionPosition,
  widgetsSectionEnabled = true,
  contentAlignment,
  avatarPlacement,
  joinDatePlacement,
  locationPlacement,
  occupationPlacement,
  uidPlacement,
  viewsPlacement,
  feedbackPlacement,
  joinDateEnabled = false,
  joinDateFormat = "Absolute (July 14, 2026)",
  viewsEnabled = true,
  viewsAnimationEnabled = false,
  viewsAnimationDuration = 1000,
  viewsAnimationStyle = "none",
  commentsEnabled = false,
  showCommentsPublicly = false,
  allowNewComments = false,
  feedbackEnabled = true,
  showFeedbackPublicly = true,
  viewerFeedback: viewerFeedbackProp = null,
  showUidTooltip = false,
  showLocationTooltip = false,
  showOccupationTooltip = false,
  showLikesTooltip = false,
  showDislikesTooltip = false,
  showJoinDateTooltip = false,
  showViewsTooltip = false,
  showLinksTooltip = false,
  showBadgesTooltip = false,
  iconsGlowEnabled = false,
  joinDateIconGlow = false,
  locationIconGlow = false,
  occupationIconGlow = false,
  uidIconGlow = false,
  viewsIconGlow = false,
  feedbackIconGlow = false,
  initialLikes = 0,
  initialDislikes = 0,
  createdAt,
  widgets = [],
  links = [],
  linksAlignment,
  linksSocialBackground,
  linksBorderRadius,
  linksIconSize,
  linksFont,
  linksFontSize,
  linksFontWeight,
  linksLetterSpacing,
  musicTracks = [],
  musicPlayerStyle = "compact",
  musicAutoPlay = true,
  musicPlayerArtBg = false,
  musicPlayerVolume = true,
  musicPlayerDefaultVolume = 100,
  musicPlayerVolumeFixed = true,
  musicPlayerShuffle = false,
  profileId,
  viewerId: viewerIdProp,
}: Layout1Props) => {
  const display = displayName?.trim() ? displayName : username?.trim() ? username : undefined;
  const hasAvatar = Boolean(avatarUrl?.trim());
  const hasBanner = Boolean(bannerImageUrl && bannerImageUrl.trim() !== "");
  const [liveViews, setLiveViews] = useState(views);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [commentsEverOpened, setCommentsEverOpened] = useState(false);
  if (isCommentsModalOpen && !commentsEverOpened) setCommentsEverOpened(true);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [dislikesCount, setDislikesCount] = useState(initialDislikes);

  const [bgSoundOn, setBgSoundOn] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const [entered, setEntered] = useState(!enterScreenEnabled);

  const locked = bgPreviewUrl !== undefined && bgPreviewUrl !== null;
  const [bgIdx, setBgIdx] = useState<number>(() => {
    if (!backgrounds || backgrounds.length === 0) return 0;
    if (locked) {
      const i = backgrounds.indexOf(bgPreviewUrl as string);
      return i >= 0 ? i : 0;
    }
    if (bannerBackgroundShuffle && backgrounds.length > 1) {
      return Math.floor(Math.random() * backgrounds.length);
    }
    return 0;
  });
  const bannerBackgroundUrl = (locked ? bgPreviewUrl : backgrounds?.[bgIdx]) || null;
  const isTouchDevice = useSyncExternalStore(subscribeCoarsePointer, isCoarsePointer, () => false);
  const hasAnimatedBg = Boolean(bannerBackgroundUrl && animatedBackgroundId(bannerBackgroundUrl));
  const cardBlur = isTouchDevice && hasAnimatedBg
    ? Math.min(profileCardBlur, MOBILE_ANIMATED_BG_MAX_BLUR)
    : profileCardBlur;
  const autoplay = bannerBackgroundAutoplay ?? true;
  const nextVideoIdx = (() => {
    if (locked || !autoplay || !backgrounds || backgrounds.length < 2) return null;
    for (let k = 1; k <= backgrounds.length; k++) {
      const j = (bgIdx + k) % backgrounds.length;
      if (isVideoUrl(backgrounds[j])) return j;
    }
    return null;
  })();
  const advanceOnEnded = nextVideoIdx !== null;
  const handleEntered = () => {
    setEntered(true);
    const el = bgVideoRef.current;
    if (el) {
      if (bannerBackgroundSound) {
        el.muted = false;
        el.defaultMuted = false;
        el.volume = 1;
      }
      el.play().catch(() => {});
    }
    if (bannerBackgroundSound) setBgSoundOn(true);
  };
  useEffect(() => {
    if (!bannerBackgroundSound || bgSoundOn) return;
    if (enterScreenEnabled && !entered) return;
    const enable = () => {
      const el = bgVideoRef.current;
      if (el) {
        el.muted = false;
        el.defaultMuted = false;
        el.volume = 1;
        el.play().catch(() => {});
      }
      setBgSoundOn(true);
    };
    window.addEventListener("pointerdown", enable);
    window.addEventListener("touchstart", enable);
    window.addEventListener("click", enable);
    window.addEventListener("keydown", enable);
    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("touchstart", enable);
      window.removeEventListener("click", enable);
      window.removeEventListener("keydown", enable);
    };
  }, [bannerBackgroundSound, bgSoundOn, enterScreenEnabled, entered]);

  const [viewerId, setViewerId] = useState<number | null>(viewerIdProp ?? null);
  const [viewerFeedback, setViewerFeedback] = useState<'like' | 'dislike' | null>(viewerFeedbackProp);

  useEffect(() => {
    if (typeof window === "undefined" || !profileId) return;
    if (viewerIdProp === -1) return;

    const controller = new AbortController();
    fetch(`/api/profile/me?profileId=${profileId}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) return;
        setViewerId(typeof data.viewerId === 'number' ? data.viewerId : null);
        setViewerFeedback(
          data.feedback === 'like' || data.feedback === 'dislike' ? data.feedback : null
        );
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('[Layout1] Failed to fetch viewer feedback:', err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [profileId, viewerIdProp]);

  useEffect(() => {
    setLikesCount(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    setDislikesCount(initialDislikes);
  }, [initialDislikes]);

  useEffect(() => {
    if (typeof window === "undefined" || !username || viewerId === -1) return;
    const controller = new AbortController();
    const loadLive = () => {
      fetch(`/api/profile/live?username=${encodeURIComponent(username)}`, {
        signal: controller.signal,
      })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            if (data.views !== undefined) setLiveViews(data.views);
            if (data.likesCount !== undefined) setLikesCount(data.likesCount);
            if (data.dislikesCount !== undefined) setDislikesCount(data.dislikesCount);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Failed to fetch live profile data:", err);
          }
        });
    };

    loadLive();
    const interval = window.setInterval(loadLive, 60000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [username, viewerId]);

  const formattedJoinDate = React.useMemo(() => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return null;

    const formatKey = joinDateFormat ? joinDateFormat.split(" (")[0] : "Absolute";

    switch (formatKey) {
      case "Short":
        return date.toLocaleDateString("en-US");
      case "Long":
        return date.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      case "Month Year":
        return date.toLocaleDateString("en-US", { month: 'long', year: 'numeric' });
      case "Year Only":
        return date.toLocaleDateString("en-US", { year: 'numeric' });
      case "Compact":
        const m = date.toLocaleDateString("en-US", { month: 'short' });
        const d = date.toLocaleDateString("en-US", { day: 'numeric' });
        const y = date.toLocaleDateString("en-US", { year: '2-digit' });
        return `${m} ${d}, '${y}`;
      case "Absolute":
      default:
        return date.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });
    }
  }, [createdAt, joinDateFormat]);

  const fontClassMap = FONT_CLASS_MAP;

  const naturalCardWidthPx = Math.min(1000, Math.max(480, contentWidth));
  const cardWidthPx = forceCardWidth ?? naturalCardWidthPx;
  const cardWidth = `${cardWidthPx}px`;

  const badgeClass = BADGE_CLASSES[getPresetLayout(profilePreset).badgePlacement];

  const alignment = normalizeAlignment(contentAlignment);
  const isLeft = alignment === "left";
  const isRight = alignment === "right";
  const alignClass = isLeft ? "items-start text-left" : isRight ? "items-end text-right" : "items-center text-center";
  const justifyClass = isLeft ? "justify-start" : isRight ? "justify-end" : "justify-center";
  const textAlignClass = isLeft ? "text-left" : isRight ? "text-right" : "text-center";

  const avatarPos = normalizeAvatarPlacement(avatarPlacement);
  const avatarBeside = avatarPos === "left" || avatarPos === "right";

  const sectioned = profileStructure === "sectioned";
  const smallLinks = (links ?? []).filter((l) => l && l.variant === "small");
  const bigLinks = (links ?? []).filter((l) => l && l.variant !== "small");
  const aboutText = bio?.trim() || "";
  const aboutSubtitle = aboutSectionDescription?.trim() || "";
  const hasOutsideWidgets = (widgets ?? []).some(
    (w) => w.enabled && (w.placement || "inside") === "outside"
  );
 const aboutHasWidgets = widgetsSectionEnabled && hasOutsideWidgets;
  const hasMusic =
    !bannerBackgroundSound &&
    (musicPlayerStyle === "compact" || musicPlayerStyle === "lyrics" || musicPlayerStyle === "waveform") &&
    musicTracks.length > 0;
  const aboutVisible =
    aboutSectionEnabled && (aboutText.length > 0 || aboutSubtitle.length > 0 || aboutHasWidgets || hasMusic);
  const linksAboveAbout = linksSectionPosition === "above";
  const linksScreenVisible = sectioned && linksSectionEnabled && bigLinks.length > 0;
  const linksScreenTitle = linksSectionTitle?.trim() || "Links";
  const linksScreenSubtitle = linksSectionDescription?.trim() || "";
  const screenCount = sectioned ? 1 + (aboutVisible ? 1 : 0) + (linksScreenVisible ? 1 : 0) : 1;
  const paged = sectioned && screenCount > 1;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeScreen, setActiveScreen] = useState(0);

  const goToScreen = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: index * el.clientHeight, behavior: "smooth" });
  };

useEffect(() => {
    const el = scrollerRef.current;
    if (!paged || !el) return;

    let locked = false;
    const turn = (dir: number) => {
      const page = Math.round(el.scrollTop / el.clientHeight);
      const next = Math.min(screenCount - 1, Math.max(0, page + dir));
      if (next === page) return;
      locked = true;
      setTimeout(() => { locked = false; }, 700);
      el.scrollTo({ top: next * el.clientHeight, behavior: "smooth" });
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const page = Math.round(el.scrollTop / el.clientHeight);
      const next = Math.min(screenCount - 1, Math.max(0, page + dir));
      if (next === page) return;
      e.preventDefault();
      if (locked) return;
      turn(dir);
    };

    let startY = 0;
    const onTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (locked || Math.abs(dy) < 40) return;
      turn(dy > 0 ? 1 : -1);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [paged, screenCount]);

  const tooltipTextStyle: React.CSSProperties = {
    fontFamily: fontClassMap[highlightFont] || "var(--font-inter)",
    fontSize: `${highlightFontSize}px`,
    fontWeight: highlightFontWeight,
    letterSpacing: `${highlightLetterSpacing}px`,
  };

  const detailPlacements: DetailPlacements = {
    location: normalizePlacement(locationPlacement, DEFAULT_DETAILS.location),
    occupation: normalizePlacement(occupationPlacement, DEFAULT_DETAILS.occupation),
    uid: normalizePlacement(uidPlacement, DEFAULT_DETAILS.uid),
    joinDate: joinDateEnabled
      ? normalizePlacement(joinDatePlacement, DEFAULT_DETAILS.joinDate)
      : "hidden",
    views: viewsEnabled
      ? normalizePlacement(viewsPlacement, DEFAULT_DETAILS.views)
      : "hidden",
    feedback: feedbackEnabled
      ? normalizePlacement(feedbackPlacement, DEFAULT_DETAILS.feedback)
      : "hidden",
  };

  const detailTooltips: DetailTooltips = {
    location: showLocationTooltip,
    occupation: showOccupationTooltip,
    uid: showUidTooltip,
    joinDate: showJoinDateTooltip,
    views: showViewsTooltip,
  };

  const detailTextStyle: React.CSSProperties = {
    fontFamily: fontClassMap[otherFont] || "var(--font-inter)",
    fontSize: `${otherFontSize}px`,
    fontWeight: otherFontWeight,
    letterSpacing: `${otherLetterSpacing}px`,
    color: otherColor ?? "#5b6cf5",
  };

  const detailGlowColor = otherColor ?? "#5b6cf5";
  const detailIconGlow = {
    location: iconsGlowEnabled && (locationIconGlow ?? false),
    occupation: iconsGlowEnabled && (occupationIconGlow ?? false),
    uid: iconsGlowEnabled && (uidIconGlow ?? false),
    joinDate: iconsGlowEnabled && (joinDateIconGlow ?? false),
  };
  const viewsIconFilter = iconGlowFilter(detailGlowColor, iconsGlowEnabled && viewsIconGlow);

  const detailValues = {
    location,
    occupation,
    uid: profileId && profileId > 0 ? profileId : undefined,
    joinDate: formattedJoinDate,
    views: (
      <>
        <span className="inline-flex shrink-0" style={viewsIconFilter ? { filter: viewsIconFilter } : undefined}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0 opacity-80">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        </span>
        <ViewsCounterAnimation
          value={liveViews}
          style={viewsAnimationStyle}
          duration={viewsAnimationDuration}
          enabled={viewsAnimationEnabled}
        />
      </>
    ),
    feedback: (
      <FeedbackButtons
        profileId={profileId}
        viewerId={viewerId}
        initialLikes={likesCount}
        initialDislikes={dislikesCount}
        initialFeedback={viewerFeedback}
        accentColor={otherColor}
        tooltipTextStyle={tooltipTextStyle}
        showLikesTooltip={showLikesTooltip}
        showDislikesTooltip={showDislikesTooltip}
        showFeedbackPublicly={showFeedbackPublicly}
        glowEnabled={iconsGlowEnabled && (feedbackIconGlow ?? false)}
        glowColor={detailGlowColor}
      />
    ),
  };

  const detailSlot = (
    slot: "top" | "beside" | "bottom-profile" | "bottom-page",
    className = "",
    filter: { only?: DetailKey[]; except?: DetailKey[] } = {}
  ) => (
    <ProfileDetails
      slot={slot}
      only={filter.only}
      except={filter.except}
      values={detailValues}
      placements={detailPlacements}
      tooltips={detailTooltips}
      textStyle={detailTextStyle}
      tooltipTextStyle={tooltipTextStyle}
      className={className}
      iconGlow={detailIconGlow}
      iconGlowColor={detailGlowColor}
    />
  );

  const insideWidgets = (className: string) => (
    <div className={className}>
      <ProfileWidgets
        widgets={widgets}
        placement="inside"
        cardWidth={naturalCardWidthPx}
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
        widgetSecondaryFont={widgetSecondaryFont}
        widgetSecondaryFontSize={widgetSecondaryFontSize}
        widgetSecondaryFontWeight={widgetSecondaryFontWeight}
        widgetSecondaryLetterSpacing={widgetSecondaryLetterSpacing}
      />
    </div>
  );

  const outsideWidgets = (
    <ProfileWidgets
      widgets={widgets}
      placement="outside"
      cardWidth={naturalCardWidthPx}
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
      widgetSecondaryFont={widgetSecondaryFont}
      widgetSecondaryFontSize={widgetSecondaryFontSize}
      widgetSecondaryFontWeight={widgetSecondaryFontWeight}
      widgetSecondaryLetterSpacing={widgetSecondaryLetterSpacing}
    />
  );

  const showMusicPlayer = hasMusic;

  const musicPlayerAutoPlay = musicAutoPlay && (!enterScreenEnabled || entered);
  const musicPlayerArtBgOn = musicPlayerArtBg ?? false;
  const musicPlayerVolumeOn = musicPlayerVolume ?? true;
  const musicPlayerDefaultVolumeOn = Math.min(100, Math.max(0, musicPlayerDefaultVolume ?? 100)) / 100;
  const musicPlayerShuffleOn = musicPlayerShuffle ?? false;

  const musicTitleStyle: React.CSSProperties = {
    fontFamily: fontClassMap[musicPrimaryFont ?? "Inter"] || "var(--font-inter)",
    fontSize: `${musicPrimaryFontSize ?? 15}px`,
    fontWeight: musicPrimaryFontWeight ?? 400,
    letterSpacing: `${musicPrimaryLetterSpacing ?? 0}px`,
    color: musicPrimaryColor ?? "#FFFFFF",
  };
  const musicArtistStyle: React.CSSProperties = {
    fontFamily: fontClassMap[musicSecondaryFont ?? "Inter"] || "var(--font-inter)",
    fontSize: `${musicSecondaryFontSize ?? 12.5}px`,
    fontWeight: musicSecondaryFontWeight ?? 400,
    letterSpacing: `${musicSecondaryLetterSpacing ?? 0}px`,
    color: musicSecondaryColor ?? "#FFFFFF",
  };
  const musicLyricStyle: React.CSSProperties = {
    fontFamily: fontClassMap[musicLyricsFont ?? "Inter"] || "var(--font-inter)",
    fontSize: `${musicLyricsFontSize ?? 14}px`,
    fontWeight: musicLyricsFontWeight ?? 400,
    letterSpacing: `${musicLyricsLetterSpacing ?? 0}px`,
  };
  const musicLyricColor = musicLyricsColor ?? "#FFFFFF";

  const musicPlayer = showMusicPlayer ? (
    <div className="w-full mt-3">
      {musicPlayerStyle === "lyrics" ? (
        <LyricsMusicPlayer tracks={musicTracks} autoPlay={musicPlayerAutoPlay} artBg={musicPlayerArtBgOn} volumeControl={musicPlayerVolumeOn} volumeFloating={musicPlayerVolumeFixed} volumeColor={otherColor} defaultVolume={musicPlayerDefaultVolumeOn} titleStyle={musicTitleStyle} artistStyle={musicArtistStyle} lyricStyle={musicLyricStyle} lyricColor={musicLyricColor} shuffle={musicPlayerShuffleOn} />
      ) : musicPlayerStyle === "waveform" ? (
        <WaveformMusicPlayer tracks={musicTracks} autoPlay={musicPlayerAutoPlay} artBg={musicPlayerArtBgOn} volumeControl={musicPlayerVolumeOn} volumeFloating={musicPlayerVolumeFixed} volumeColor={otherColor} defaultVolume={musicPlayerDefaultVolumeOn} titleStyle={musicTitleStyle} artistStyle={musicArtistStyle} shuffle={musicPlayerShuffleOn} />
      ) : (
        <CompactMusicPlayer tracks={musicTracks} autoPlay={musicPlayerAutoPlay} artBg={musicPlayerArtBgOn} volumeControl={musicPlayerVolumeOn} volumeFloating={musicPlayerVolumeFixed} volumeColor={otherColor} defaultVolume={musicPlayerDefaultVolumeOn} titleStyle={musicTitleStyle} artistStyle={musicArtistStyle} shuffle={musicPlayerShuffleOn} />
      )}
    </div>
  ) : null;

  const linkTitleStyle: React.CSSProperties = {
    fontFamily: fontClassMap[linksFont ?? "Inter"] || "var(--font-inter)",
    fontSize: `${linksFontSize ?? 13.5}px`,
    fontWeight: linksFontWeight ?? 400,
    letterSpacing: `${linksLetterSpacing ?? 0}px`,
  };

  const smallLinksSection = smallLinks.length > 0 ? (
    <div className="w-full px-6 pt-2">
      <ProfileLinks links={smallLinks} titleStyle={linkTitleStyle} showTooltip={showLinksTooltip} alignment={linksAlignment} socialBackground={linksSocialBackground} borderRadius={linksBorderRadius} iconSize={linksIconSize} />
    </div>
  ) : null;

  const bigLinksSection = bigLinks.length > 0 ? (
    <div className="w-full mt-3">
      <ProfileLinks links={bigLinks} titleStyle={linkTitleStyle} showTooltip={showLinksTooltip} alignment={linksAlignment} socialBackground={linksSocialBackground} borderRadius={linksBorderRadius} iconSize={linksIconSize} />
    </div>
  ) : null;

const textBlock = (text: string, align: "left" | "center" | "right") => (
    <div className={`w-full flex ${align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center"}`} style={{ overflow: "visible" }}>
      <DescriptionEffect effect={descriptionEffect} glow={descriptionGlowEnabled} glowColor={bioColor ?? "#FFFFFF"}>
        <p
          className={`leading-relaxed max-w-full whitespace-pre-wrap break-words ${
            align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center"
          }`}
          style={{
            fontFamily: fontClassMap[bioFont] || "var(--font-inter)",
            fontSize: `${bioFontSize}px`,
            fontWeight: bioFontWeight,
            letterSpacing: `${bioLetterSpacing}px`,
            color: bioColor ?? "#FFFFFF",
            textShadow: textGlowShadow(bioColor ?? "#FFFFFF", descriptionGlowEnabled),
            overflow: "visible",
          }}
        >
          {renderFormattedText(text, align)}
        </p>
      </DescriptionEffect>
    </div>
  );

const sectionSurface: React.CSSProperties = {
    backdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : undefined,
    WebkitBackdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : undefined,
    borderRadius: `${profileBorderRadius}px`,
    border:
      profileBorderWidth > 0
        ? `${profileBorderWidth}px solid ${hexToRgba(profileBorderColor, profileBorderOpacity)}`
        : "1px solid rgba(255,255,255,0.08)",
    background: hexToRgba(profileBgColor, profileBgOpacity),
    boxShadow:
      profileShadowOpacity > 0
        ? `0 0 24px ${hexToRgba(profileShadowColor, profileShadowOpacity)}`
        : undefined,
  };

  const shapeClass = SHAPE_CLASSES[avatarShape] || "rounded-[24px]";

  return (
    <div
      ref={scrollerRef}
      onScroll={
        paged
          ? (e) => {
              const el = e.currentTarget;
              setActiveScreen(Math.round(el.scrollTop / el.clientHeight));
            }
          : undefined
      }
      className={`w-full flex flex-col items-center relative ${
        sectioned
          ? "h-screen overflow-y-auto overflow-x-hidden no-scrollbar"
          : "min-h-screen overflow-x-clip"
      }`}
    >
        <EntryTransition
          transition={entryTransition}
          enabled={enterScreenEnabled}
          text={enterScreenText}
          font={enterScreenFont}
          fontSize={enterScreenFontSize}
          fontWeight={enterScreenFontWeight}
          letterSpacing={enterScreenLetterSpacing}
          color={enterScreenColor}
          opacity={enterScreenOpacity}
          blur={enterScreenBlur}
          blurColor={enterScreenBlurColor}
          fontClassMap={FONT_CLASS_MAP}
          onEnter={handleEntered}
        />

        <div className="sticky top-0 h-screen w-full shrink-0 -mb-[100vh] overflow-hidden">
        {bannerBackgroundUrl && (
          animatedBackgroundId(bannerBackgroundUrl) ? (
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                filter: profileBackgroundBlur > 0 ? `blur(${profileBackgroundBlur}px)` : undefined,
              }}
            >
              <AnimatedBackground
                frozen={isScreenshot}
                id={animatedBackgroundId(bannerBackgroundUrl)!}
                aurora={{ colors: [auroraColor1, auroraColor2, auroraColor3], speed: auroraSpeed, blend: auroraBlend }}
                darkveil={{ speed: darkveilSpeed, hueShift: darkveilHueShift, noiseIntensity: darkveilNoise, scanlineFrequency: darkveilScanFreq, scanlineIntensity: darkveilScan, warpAmount: darkveilWarp }}
                pixelblast={{ variant: pixelblastVariant, pixelSize: pixelblastPixelSize, color: pixelblastColor, patternScale: pixelblastPatternScale, patternDensity: pixelblastPatternDensity, pixelJitter: pixelblastPixelJitter, speed: pixelblastSpeed, edgeFade: pixelblastEdgeFade, ripples: pixelblastRipples, liquid: pixelblastLiquid }}
                colorbends={{ color: colorbendsColor, rotation: colorbendsRotation, autoRotate: colorbendsAutoRotate, speed: colorbendsSpeed, scale: colorbendsScale, frequency: colorbendsFrequency, warpStrength: colorbendsWarp, mouseInfluence: colorbendsMouse, parallax: colorbendsParallax, noise: colorbendsNoise, iterations: colorbendsIterations, intensity: colorbendsIntensity, bandWidth: colorbendsBandWidth }}
                liquidchrome={{ color: liquidchromeColor, speed: liquidchromeSpeed, amplitude: liquidchromeAmplitude, interactive: liquidchromeInteractive }}
                crtwarp={{ color: crtwarpColor, background: crtwarpBackground, speed: crtwarpSpeed, curvature: crtwarpCurvature, waveAmount: crtwarpWaveAmount, waveDensity: crtwarpWaveDensity, scanStrength: crtwarpScanStrength, scanDensity: crtwarpScanDensity, bloom: crtwarpBloom, bloomRadius: crtwarpBloomRadius, noise: crtwarpNoise, vignette: crtwarpVignette, brightness: crtwarpBrightness, rgbShift: crtwarpRgbShift, pixelSize: crtwarpPixelSize, renderQuality: crtwarpRenderQuality, frameRate: crtwarpFrameRate, pointerWarp: crtwarpPointerWarp, pointerStrength: crtwarpPointerStrength, paused: crtwarpPaused }}
              />
            </div>
          ) : isVideoUrl(bannerBackgroundUrl) ? (
            <video
              key={`front-${bannerBackgroundUrl}`}
              src={bannerBackgroundUrl}
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              style={{
                filter: profileBackgroundBlur > 0 ? `blur(${profileBackgroundBlur}px)` : undefined,
              }}
              autoPlay={entered}
              muted={!bgSoundOn}
              ref={bgVideoRef}
              loop={!advanceOnEnded}
              playsInline
              onEnded={advanceOnEnded && nextVideoIdx !== null ? () => setBgIdx(nextVideoIdx) : undefined}
            />
          ) : (
          <div className="absolute inset-0 z-0 pointer-events-none">
              <Image
                src={bannerBackgroundUrl}
                alt="Background"
                fill
                className="object-cover"
                style={{
                  filter: profileBackgroundBlur > 0 ? `blur(${profileBackgroundBlur}px)` : undefined,
                }}
                unoptimized
                priority
              />
            </div>
          )
        )}

        {!backgroundEffectAboveContainer && (
        <BackgroundEffect
          effect={backgroundEffect ?? "none"}
          intensity={backgroundEffectIntensity}
          color={backgroundEffectColor}
          aboveContainer={false}
        />
        )}
        </div>

        {backgroundEffectAboveContainer && (
        <div className="sticky top-0 h-screen w-full shrink-0 -mb-[100vh] overflow-hidden pointer-events-none z-[90]">
        <BackgroundEffect
          effect={backgroundEffect ?? "none"}
          intensity={backgroundEffectIntensity}
          color={backgroundEffectColor}
          aboveContainer
        />
        </div>
        )}

        <CursorTrail trail={cursorTrail} color={cursorTrailColor} />
        <ClickEffects effect={clickEffect} sound={clickSound} scopeRef={clickScopeRef} />

        {paged && (
          <div className="sticky top-0 h-screen w-full shrink-0 -mb-[100vh] pointer-events-none z-[60]">
            <div className="absolute right-1.5 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 pointer-events-auto">
              {Array.from({ length: screenCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToScreen(i)}
                  aria-label={`Go to section ${i + 1}`}
                  aria-current={activeScreen === i}
                  className={`rounded-full transition-all cursor-pointer ${
                    activeScreen === i ? "w-2.5 h-2.5" : "w-1.5 h-1.5 bg-white/25 hover:bg-white/40"
                  }`}
                  style={activeScreen === i ? { backgroundColor: otherColor } : undefined}
                />
              ))}
            </div>
          </div>
        )}

        <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-[var(--card-w)] max-w-full flex flex-col items-center z-10" style={{ "--card-w": cardWidth } as React.CSSProperties}>
        <CardEffect effect={cardEffect} className="w-[var(--card-w)] max-w-full">
        <CardTransition transition={cardTransition} className="w-[var(--card-w)] max-w-full">
        <div className="w-[var(--card-w)] max-w-full relative flex flex-col items-center overflow-visible z-10">
          <BorderEffect
            effect={borderEffect}
            color={borderEffectColor}
            borderRadius={profileBorderRadius}
            borderWidth={profileBorderWidth}
            zIndex={30}
          />

          {wrapInCard && (
            <>
              <div
                className="absolute inset-0 z-0"
                style={{
                  backdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : undefined,
                  WebkitBackdropFilter: cardBlur > 0 ? `blur(${cardBlur}px)` : undefined,
                  borderRadius: `${profileBorderRadius}px`,
                  border: profileBorderWidth > 0 ? `${profileBorderWidth}px solid ${hexToRgba(profileBorderColor, profileBorderOpacity)}` : '1px solid rgba(255,255,255,0.08)',
                  background: hexToRgba(profileBgColor, profileBgOpacity),
                  boxShadow: profileShadowOpacity > 0 ? `0 0 24px ${hexToRgba(profileShadowColor, profileShadowOpacity)}` : undefined,
                  opacity: profileOpacity / 100,
                }}
              />

              <div
                className="absolute h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent z-10"
                style={{
                  opacity: profileOpacity / 100,
                  top: `${profileBorderWidth}px`,
                  left: `${profileBorderWidth}px`,
                  right: `${profileBorderWidth}px`
                }}
              />
            </>
          )}

          {selectedEffect && selectedEffect.effects && selectedEffect.effects.length > 0 && (
            <ProfileEffectRenderer
              effects={selectedEffect.effects}
              hue={effectHue}
              borderRadius={profileBorderRadius}
            />
          )}

          <div
            className="relative z-20 flex flex-col items-center w-full"
            style={{ padding: `${profileBorderWidth}px` }}
          >
            {hasBanner && (
              <div
                className="w-full h-[160px] overflow-hidden relative shrink-0"
                style={{
                  borderTopLeftRadius: `${Math.max(0, profileBorderRadius - profileBorderWidth)}px`,
                  borderTopRightRadius: `${Math.max(0, profileBorderRadius - profileBorderWidth)}px`,
                  maskImage: bannerBlend ? "linear-gradient(to bottom, black 0%, black 45%, rgba(0,0,0,0.6) 75%, transparent 100%)" : undefined,
                  WebkitMaskImage: bannerBlend ? "linear-gradient(to bottom, black 0%, black 45%, rgba(0,0,0,0.6) 75%, transparent 100%)" : undefined,
                }}
              >
                {isVideoUrl(bannerImageUrl!) ? (
                  <video
                    key={bannerImageUrl}
                    src={bannerImageUrl!}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    ref={(el) => { if (el) el.defaultMuted = true; }}
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={bannerImageUrl!}
                    alt="Banner"
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                )}
                <div className={`absolute inset-x-0 bottom-0 pointer-events-none ${bannerBlend ? "h-full bg-gradient-to-t from-[#000000]/80 via-transparent to-transparent" : "h-8 bg-gradient-to-t from-black/60 to-transparent"}`} />
              </div>
            )}

            {detailSlot(
              "top",
              `justify-end ${
                hasBanner
                  ? "absolute top-3 left-0 right-0 z-30 px-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                  : "w-full pt-5 px-4"
              }`
            )}

            <div
              className={
                avatarBeside
                  ? `w-full flex items-start gap-5 px-6 ${
                      avatarPos === "right" ? "flex-row-reverse" : ""
                    }`
                  : "contents"
              }
              style={avatarBeside ? { marginTop: hasBanner ? "10px" : "24px" } : undefined}
            >
              <div
                className={
                  avatarBeside
                    ? "shrink-0"
                    : `relative w-full flex ${isLeft ? "justify-start px-6" : isRight ? "justify-end px-6" : "justify-center"}`
                }
                style={
                  avatarBeside
                    ? undefined
                    : {
                        marginTop:
                          avatarPos === "floating"
                            ? hasBanner
                              ? "-44px"
                              : "24px"
                            : hasBanner
                              ? "16px"
                              : "24px",
                      }
                }
              >
                {hasAvatar && (
                <AvatarInner
                  avatarUrl={avatarUrl}
                  shapeClass={shapeClass}
                  selectedDecoration={selectedDecoration}
                  decorationHue={decorationHue}
                  altText={display}
                />
                )}
              </div>

            <div
              className={`flex flex-col ${alignClass} ${
                avatarBeside ? "flex-1 min-w-0" : "w-full px-6 pt-3"
              }`}
              style={avatarBeside && hasBanner ? { marginTop: "-6px" } : undefined}
            >
              {display && (
                <div className={`relative flex ${justifyClass}`} style={{ overflow: "visible" }}>
                  <span className="relative group/uid flex" style={{ overflow: "visible" }}>
                  <UsernameEffect effect={usernameEffect} glow={usernameGlowEnabled} glowColor={usernameColor ?? "#FFFFFF"}>
                    <h1 className={usernameGlowEnabled ? `profile-name-glow tracking-tight mb-2 max-w-[280px] sm:whitespace-nowrap ${textAlignClass}` : `tracking-tight mb-2 max-w-full sm:max-w-[200px] truncate ${textAlignClass}`} style={{ fontFamily: fontClassMap[usernameFont] || "var(--font-inter)", fontSize: `${usernameFontSize}px`, fontWeight: usernameFontWeight, letterSpacing: `${usernameLetterSpacing}px`, color: usernameColor ?? "#FFFFFF", textShadow: textGlowShadow(usernameColor ?? "#FFFFFF", usernameGlowEnabled) }}>
                      {display}
                    </h1>
                  </UsernameEffect>
                  {showUidTooltip && (
                    <div className="absolute bottom-full mb-2 opacity-0 pointer-events-none group-hover/uid:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover/uid:translate-y-0">
                      <div className="bg-[#0f0f12]/75 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-white shadow-lg whitespace-nowrap" style={tooltipTextStyle}>
                        UID: #{profileId && profileId > 0 ? profileId : 1}
                      </div>
                    </div>
                  )}
                  </span>
                  <ProfileBadges badgeIds={equippedBadges} customBadges={customBadges} showTooltip={showBadgesTooltip} glowEnabled={badgeGlowEnabled} glowStrength={badgeGlowStrength} badgeSize={badgeSize} monoEnabled={badgeMonochromeEnabled} monoColor={badgeMonochromeColor} containerStyle={badgeContainerStyle} badgeSpacing={badgeSpacing} scrollStyle={badgeScrollStyle} scrollSpeed={badgeScrollSpeed} visibleCount={badgeVisibleCount} shimmerEnabled={badgeShimmerEnabled} />
                </div>
              )}
              {detailSlot("beside", `mt-1 ${textAlignClass} ${justifyClass}`)}
              {!sectioned && aboutSectionEnabled && bio?.trim() && <div className="mt-1.5 w-full">{textBlock(bio.trim(), alignment)}</div>}

            </div>
            </div>

            {smallLinksSection}
            {insideWidgets("w-full px-6 pb-4 sm:pb-16")}
          </div>

          {detailSlot("bottom-profile", `${badgeClass} max-sm:static max-sm:w-full max-sm:mt-4 max-sm:px-6 max-sm:pb-4`, { except: ["feedback"] })}
          {detailSlot("bottom-profile", `${BADGE_CLASSES.cardRight} max-sm:static max-sm:w-full max-sm:mt-2 max-sm:px-6 max-sm:pb-4 max-sm:justify-end`, { only: ["feedback"] })}

        </div>

        </CardTransition>
        </CardEffect>

        {}
        {!sectioned && linksAboveAbout && linksSectionEnabled && bigLinksSection}
        {!sectioned && outsideWidgets}
        {!sectioned && aboutSectionEnabled && musicPlayer}
        {!sectioned && !linksAboveAbout && linksSectionEnabled && bigLinksSection}

        {detailSlot("bottom-page", `${BADGE_CLASSES.page} max-sm:static max-sm:w-full max-sm:mt-3 max-sm:px-6`, { except: ["feedback"] })}
        {detailSlot("bottom-page", `${BADGE_CLASSES.pageRight} max-sm:static max-sm:w-full max-sm:mt-1.5 max-sm:px-6 max-sm:justify-end`, { only: ["feedback"] })}
        </div>
        </div>

        {linksScreenVisible && linksAboveAbout && (
          <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 py-16">
            <div
              className="w-[var(--card-w)] max-w-full shrink-0 flex flex-col z-10"
              style={{ "--card-w": cardWidth } as React.CSSProperties}
            >
              <div className="mb-3 text-left">
                <h2
                  style={{
                    fontFamily: fontClassMap[sectionTitleFont] || "var(--font-inter)",
                    fontSize: `${sectionTitleFontSize}px`,
                    fontWeight: sectionTitleFontWeight,
                    letterSpacing: `${sectionTitleLetterSpacing}px`,
                    color: sectionTitleColor,
                  }}
                >
                  {linksScreenTitle}
                </h2>
                {linksScreenSubtitle && (
                  <p
                    className="mt-0.5 opacity-50"
                    style={{
                      fontFamily: fontClassMap[sectionDescFont] || "var(--font-inter)",
                      fontSize: `${sectionDescFontSize}px`,
                      fontWeight: sectionDescFontWeight,
                      letterSpacing: `${sectionDescLetterSpacing}px`,
                      color: sectionDescColor,
                    }}
                  >
                    {renderFormattedText(linksScreenSubtitle)}
                  </p>
                )}
              </div>
              {bigLinksSection}
            </div>
          </div>
        )}

        {paged && (
          <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 py-16">
            <div
              className="w-[var(--card-w)] max-w-full shrink-0 flex flex-col z-10"
              style={{ "--card-w": cardWidth } as React.CSSProperties}
            >
              {aboutVisible && (
                <>
                  <div className="mb-3 text-left">
                    <h2
                      style={{
                        fontFamily: fontClassMap[sectionTitleFont] || "var(--font-inter)",
                        fontSize: `${sectionTitleFontSize}px`,
                        fontWeight: sectionTitleFontWeight,
                        letterSpacing: `${sectionTitleLetterSpacing}px`,
                        color: sectionTitleColor ?? "#FFFFFF",
                      }}
                    >
                      {aboutSectionTitle?.trim() || "About"}
                    </h2>
                    {aboutSubtitle && (
                      <p
                        className="mt-0.5 opacity-50"
                        style={{
                          fontFamily: fontClassMap[sectionDescFont] || "var(--font-inter)",
                          fontSize: `${sectionDescFontSize}px`,
                          fontWeight: sectionDescFontWeight,
                          letterSpacing: `${sectionDescLetterSpacing}px`,
                          color: sectionDescColor,
                        }}
                      >
                        {renderFormattedText(aboutSubtitle)}
                      </p>
                    )}
                  </div>

                  {aboutText && (
                    <div className="relative w-full p-6" style={sectionSurface}>
                      {textBlock(aboutText, "left")}
                    </div>
                  )}
                  {aboutHasWidgets && outsideWidgets}
                  {musicPlayer}
                </>
              )}
            </div>
          </div>
        )}

        {linksScreenVisible && !linksAboveAbout && (
          <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 py-16">
            <div
              className="w-[var(--card-w)] max-w-full shrink-0 flex flex-col z-10"
              style={{ "--card-w": cardWidth } as React.CSSProperties}
            >
              <div className="mb-3 text-left">
                <h2
                  style={{
                    fontFamily: fontClassMap[sectionTitleFont] || "var(--font-inter)",
                    fontSize: `${sectionTitleFontSize}px`,
                    fontWeight: sectionTitleFontWeight,
                    letterSpacing: `${sectionTitleLetterSpacing}px`,
                    color: sectionTitleColor,
                  }}
                >
                  {linksScreenTitle}
                </h2>
                {linksScreenSubtitle && (
                  <p
                    className="mt-0.5 opacity-50"
                    style={{
                      fontFamily: fontClassMap[sectionDescFont] || "var(--font-inter)",
                      fontSize: `${sectionDescFontSize}px`,
                      fontWeight: sectionDescFontWeight,
                      letterSpacing: `${sectionDescLetterSpacing}px`,
                      color: sectionDescColor,
                    }}
                  >
                    {renderFormattedText(linksScreenSubtitle)}
                  </p>
                )}
              </div>
              {bigLinksSection}
            </div>
          </div>
        )}

        {commentsEnabled && (
          <div
            className="absolute top-6 right-6 z-50 animate-in fade-in zoom-in duration-300"
            style={{ '--comment-icon': otherColor } as React.CSSProperties}
          >
            <button
              onClick={() => setIsCommentsModalOpen(true)}
              className="w-12 h-12 rounded-2xl bg-transparent backdrop-blur-md border border-white/10 flex items-center justify-center hover:border-white/25 hover:scale-105 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.1)] group focus:outline-none"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#comment-icon-glow)" className="text-[var(--comment-icon)] group-active:scale-95 transition-transform opacity-80 group-hover:opacity-100">
                <defs>
                  <filter id="comment-icon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="currentColor" floodOpacity="0.9" />
                  </filter>
                </defs>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
        )}

        {}
        {commentsEverOpened && <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          profileId={profileId}
          viewerId={viewerId}
          showCommentsPublicly={showCommentsPublicly}
          allowNewComments={allowNewComments}
        />}
      </div>
    );
};

export default Layout1;

