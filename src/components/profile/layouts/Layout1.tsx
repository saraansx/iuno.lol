"use client";

import React, {  useEffect, useRef, useState  } from "react";
import Image from "next/image";
import type { Decoration } from "@/components/dashboard/DecorationPicker";
import { isVideoUrl } from "@/lib/utils/media";
import { CommentsModal } from "../comments/CommentsModal";
import FeedbackButtons from "../feedback/FeedbackButtons";
import { BackgroundEffect } from "./BackgroundEffect";
import { BorderEffect } from "./BorderEffect";
import { CardEffect } from "./CardEffect";
import { CardTransition } from "./CardTransition";
import { UsernameEffect } from "./UsernameEffect";
import { DescriptionEffect } from "./DescriptionEffect";
import { CursorTrail } from "./CursorTrail";
import { EntryTransition } from "./EntryTransition";
import { parseInlineFormatting } from "./entry-transitions/parseInlineFormatting";
import ProfileWidgets from "../widgets/ProfileWidgets";
import CompactMusicPlayer from "../music/CompactMusicPlayer";
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
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { FONT_FAMILY_VARS } from "@/lib/fonts";
import { hexToRgba as toRgba } from "@/lib/utils/color";

const FONT_CLASS_MAP = FONT_FAMILY_VARS;

const SHAPE_CLASSES: Record<string, string> = {
  square: "rounded-lg",
  soft: "rounded-[14px]",
  rounded: "rounded-[24px]",
  circle: "rounded-full",
};

const renderFormattedText = (text: string, left = false) => {
  if (!text) return null;

  const lines = text.split("\n");

  const parsedLines = lines.map((line, idx) => {
    let content = line;

    const isSubtext = /^-#\s+(.*)/.exec(content);
    if (isSubtext) {
      content = isSubtext[1];
    }

    const isBullet = /^(?:-|\*|•)\s+(.*)/.exec(content);
    if (isBullet && !isSubtext) {
      content = isBullet[1];
    }

    const formatted = parseInlineFormatting(content);

    if (isSubtext) {
      return (
        <span key={idx} className="text-[11px] opacity-60 leading-tight block">
          {formatted}
        </span>
      );
    }

    if (isBullet) {
      return (
        <span key={idx} className={`flex items-center gap-2 ${left ? "justify-start" : "justify-center"}`}>
          <span className="text-[12px] opacity-70">•</span>
          <span>{formatted}</span>
        </span>
      );
    }

    return (
      <React.Fragment key={idx}>
        <span>{formatted}</span>
        {idx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });

  return <>{parsedLines}</>;
};

interface Layout1Props {
  profileId: number;
  viewerId: number | null;
  username?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  avatarUrl?: string | null;
  avatarShape?: "square" | "soft" | "rounded" | "circle";
  selectedDecoration?: Decoration | null;
  decorationHue?: number;
  bannerImageUrl?: string | null;
  bannerBlend?: boolean;
  bannerBackgroundUrl?: string | null;
  bannerBackgroundSound?: boolean;
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
  enterScreenEnabled?: boolean;
  enterScreenText?: string;
  enterScreenFont?: string;
  enterScreenFontSize?: number;
  enterScreenFontWeight?: number;
  enterScreenLetterSpacing?: number;
  enterScreenColor?: string;
  enterScreenOpacity?: number;
  enterScreenBlur?: number;
  enterScreenBlurColor?: string;
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
  effectHue?: number;
  joinDateEnabled?: boolean;
  joinDateFormat?: string;
  viewsEnabled?: boolean;
  viewsAnimationEnabled?: boolean;
  viewsAnimationDuration?: number;
  commentsEnabled?: boolean;
  showCommentsPublicly?: boolean;
  allowNewComments?: boolean;
  feedbackEnabled?: boolean;
  showFeedbackPublicly?: boolean;
  viewerFeedback?: 'like' | 'dislike' | null;
  showUidTooltip?: boolean;
  showLocationTooltip?: boolean;
  showOccupationTooltip?: boolean;
  showLikesTooltip?: boolean;
  showDislikesTooltip?: boolean;
  showJoinDateTooltip?: boolean;
  showViewsTooltip?: boolean;
  initialLikes?: number;
  initialDislikes?: number;
  createdAt?: string | Date;
  widgets?: WidgetItem[];
  musicTracks?: import("@/lib/music").MusicTrack[];
  musicPlayerStyle?: string | null;
  musicAutoPlay?: boolean;
}

const hexToRgba = (hex: string | undefined, opacity: number) =>
  toRgba(hex, opacity, "5, 5, 5");

const AvatarInner = ({
  avatarUrl,
  shapeClass,
  selectedDecoration,
  decorationHue,
}: {
  avatarUrl?: string | null;
  shapeClass: string;
  selectedDecoration?: Decoration | null;
  decorationHue: number;
}) => (
  <div className="relative w-[88px] h-[88px]">
    <div
      className={`absolute inset-0 bg-[#0a0a0a] border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-xl ${shapeClass}`}
    >
      {avatarUrl ? (
        isVideoUrl(avatarUrl) ? (
          <video
            key={avatarUrl}
            src={avatarUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            ref={(el) => { if (el) el.defaultMuted = true; }}
            loop
            playsInline
          />
        ) : (
          <Image src={avatarUrl} alt="Avatar" fill sizes="88px" className="object-cover" unoptimized priority />
        )
      ) : (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-20"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </div>

    {selectedDecoration && (
      <div className="pointer-events-none absolute -inset-2 z-10">
        <Image
          src={selectedDecoration.url}
          alt={selectedDecoration.name}
          fill
          sizes="104px"
          unoptimized
          priority
          className="object-contain"
          style={{ filter: `hue-rotate(${decorationHue}deg)` }}
        />
      </div>
    )}
  </div>
);

const Layout1 = ({
  username,
  displayName,
  bio,
  location,
  occupation,
  avatarUrl,
  avatarShape = "rounded",
  selectedDecoration,
  decorationHue = 0,
  selectedEffect,
  effectHue = 0,
  bannerImageUrl,
  bannerBlend = false,
  bannerBackgroundUrl,
  bannerBackgroundSound = false,
  backgroundEffect,
  backgroundEffectIntensity = 50,
  backgroundEffectColor = "#ffffff",
  backgroundEffectAboveContainer = false,
  borderEffect,
  borderEffectColor = "#ffffff",
  cardEffect = "none",
  cardTransition = "none",
  usernameEffect = "none",
  descriptionEffect = "none",
  cursorTrail = "none",
  cursorTrailColor = "#ffffff",
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
  profileBgOpacity = 100,
  profileBorderColor = "#ffffff",
  profileBorderOpacity = 100,
  profileBorderWidth = 0,
  profileBorderRadius = 24,
  profileCardBlur = 4,
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
  wrapInCard = DEFAULT_FRAME.wrapInCard,
  contentWidth = DEFAULT_FRAME.contentWidth,
  profilePreset = DEFAULT_PRESET,
  profileStructure,
  aboutSectionEnabled = true,
  aboutSectionTitle,
  aboutSectionDescription,
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
  commentsEnabled = true,
  showCommentsPublicly = true,
  allowNewComments = true,
  feedbackEnabled = false,
  showFeedbackPublicly = true,
  viewerFeedback: viewerFeedbackProp = null,
  showUidTooltip = true,
  showLocationTooltip = true,
  showOccupationTooltip = true,
  showLikesTooltip = true,
  showDislikesTooltip = true,
  showJoinDateTooltip = true,
  showViewsTooltip = true,
  initialLikes = 0,
  initialDislikes = 0,
  createdAt,
  widgets = [],
  musicTracks = [],
  musicPlayerStyle = "compact",
  musicAutoPlay = true,
  profileId,
  viewerId: viewerIdProp,
}: Layout1Props) => {
  const display = displayName || username;
  const hasBanner = Boolean(bannerImageUrl && bannerImageUrl.trim() !== "");
  const [liveViews, setLiveViews] = useState(views);
  const [animatedViews, setAnimatedViews] = useState(viewsAnimationEnabled ? 0 : views);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [dislikesCount, setDislikesCount] = useState(initialDislikes);

  const [bgSoundOn, setBgSoundOn] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  // While the enter screen is showing, nothing behind it runs — video stays
  // paused and sound only starts after tap-to-enter (user gesture).
  const [entered, setEntered] = useState(!enterScreenEnabled);
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
    if (typeof window !== "undefined" && username && viewerId !== -1) {
      const controller = new AbortController();
      fetch(`/api/profile/live?username=${encodeURIComponent(username)}`, {
        signal: controller.signal,
      })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setLiveViews(data.views ?? views);
            setLikesCount(data.likesCount ?? initialLikes);
            setDislikesCount(data.dislikesCount ?? initialDislikes);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Failed to fetch live profile data:", err);
          }
        });

      return () => {
        controller.abort();
      };
    }
  }, [username, views, initialLikes, initialDislikes, viewerId]);

  useEffect(() => {
    if (!viewsAnimationEnabled || liveViews === 0) {
      setAnimatedViews(liveViews);
      return;
    }

    let frameId: number;
    const startTime = Date.now();
    const duration = viewsAnimationDuration || 1000;
    const startValue = 0;
    const endValue = liveViews;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      const easeOut = 1 - (1 - progress) * (1 - progress);
      setAnimatedViews(Math.floor(startValue + (endValue - startValue) * easeOut));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setAnimatedViews(liveViews);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [liveViews, viewsAnimationEnabled, viewsAnimationDuration]);

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

  const cardWidthPx = Math.min(1000, Math.max(480, contentWidth));
  const cardWidth = `${cardWidthPx}px`;

  const badgeClass = BADGE_CLASSES[getPresetLayout(profilePreset).badgePlacement];

  const alignment = normalizeAlignment(contentAlignment);
  const isLeft = alignment === "left";
  const alignClass = isLeft ? "items-start text-left" : "items-center text-center";
  const justifyClass = isLeft ? "justify-start" : "justify-center";

  const avatarPos = normalizeAvatarPlacement(avatarPlacement);
  const avatarBeside = avatarPos === "left" || avatarPos === "right";

  const sectioned = profileStructure === "sectioned";
  const aboutText = bio?.trim() || "";
  const aboutSubtitle = aboutSectionDescription?.trim() || "";
  const hasOutsideWidgets = (widgets ?? []).some(
    (w) => w.enabled && (w.placement || "inside") === "outside"
  );
 const aboutHasWidgets = widgetsSectionEnabled && hasOutsideWidgets;
  const aboutVisible =
    aboutSectionEnabled && (aboutText.length > 0 || aboutSubtitle.length > 0 || aboutHasWidgets);
  const screenCount = sectioned && aboutVisible ? 2 : 1;
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
    color: otherColor,
  };

  const detailValues = {
    location,
    occupation,
    uid: profileId && profileId > 0 ? profileId : undefined,
    joinDate: formattedJoinDate,
    views: (
      <>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0 opacity-80">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
        <span>{viewsAnimationEnabled ? animatedViews : views}</span>
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
    />
  );

  const insideWidgets = (className: string) => (
    <div className={className}>
      <ProfileWidgets
        widgets={widgets}
        placement="inside"
        cardWidth={cardWidthPx}
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
      />
    </div>
  );

  const outsideWidgets = (
    <ProfileWidgets
      widgets={widgets}
      placement="outside"
      cardWidth={cardWidthPx}
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
    />
  );

  const showMusicPlayer =
    !bannerBackgroundSound && musicPlayerStyle === "compact" && musicTracks.length > 0;

  const musicPlayer = showMusicPlayer ? (
    <div className="w-full mt-3">
      <CompactMusicPlayer tracks={musicTracks} autoPlay={musicAutoPlay && (!enterScreenEnabled || entered)} />
    </div>
  ) : null;

const textBlock = (text: string, left: boolean) => (
    <div className={`w-full flex ${left ? "justify-start" : "justify-center"}`}>
      <DescriptionEffect effect={descriptionEffect}>
        <p
          className={`leading-relaxed max-w-[90%] break-words ${
            left ? "text-left" : "text-center"
          }`}
          style={{
            fontFamily: fontClassMap[bioFont] || "var(--font-inter)",
            fontSize: `${bioFontSize}px`,
            fontWeight: bioFontWeight,
            letterSpacing: `${bioLetterSpacing}px`,
            color: bioColor,
          }}
        >
          {renderFormattedText(text, left)}
        </p>
      </DescriptionEffect>
    </div>
  );

const sectionSurface: React.CSSProperties = {
    backdropFilter: profileCardBlur > 0 ? `blur(${profileCardBlur}px)` : undefined,
    WebkitBackdropFilter: profileCardBlur > 0 ? `blur(${profileCardBlur}px)` : undefined,
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
          ? "h-screen overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
          isVideoUrl(bannerBackgroundUrl) ? (
            <video
              key={bannerBackgroundUrl}
              src={bannerBackgroundUrl}
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              style={{
                filter: profileBackgroundBlur > 0 ? `blur(${profileBackgroundBlur}px)` : undefined,
              }}
              autoPlay={entered}
              muted={!bgSoundOn}
              ref={bgVideoRef}
              loop
              playsInline
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
        <div className="sticky top-0 h-screen w-full shrink-0 -mb-[100vh] overflow-hidden pointer-events-none z-40">
        <BackgroundEffect
          effect={backgroundEffect ?? "none"}
          intensity={backgroundEffectIntensity}
          color={backgroundEffectColor}
          aboveContainer
        />
        </div>
        )}

        <CursorTrail trail={cursorTrail} color={cursorTrailColor} />


        {paged && (
          <div className="sticky top-0 h-screen w-full shrink-0 -mb-[100vh] pointer-events-none z-[60]">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 pointer-events-auto">
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

        <div className="w-full min-h-screen flex items-center justify-center px-6">
        <div className="w-[var(--card-w)] max-w-[100vw] flex flex-col items-center z-10" style={{ "--card-w": cardWidth } as React.CSSProperties}>
        <CardEffect effect={cardEffect} className="w-[var(--card-w)] max-w-[100vw]">
        <CardTransition transition={cardTransition} className="w-[var(--card-w)] max-w-[100vw]">
        <div className="w-[var(--card-w)] max-w-[100vw] relative flex flex-col items-center overflow-visible z-10">
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
                  backdropFilter: profileCardBlur > 0 ? `blur(${profileCardBlur}px)` : undefined,
                  WebkitBackdropFilter: profileCardBlur > 0 ? `blur(${profileCardBlur}px)` : undefined,
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
            <div
              className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
              style={{
                borderRadius: `${profileBorderRadius}px`,
                filter: effectHue ? `hue-rotate(${effectHue}deg)` : undefined,
              }}
            >
              {selectedEffect.effects.map((fx, idx) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={idx}
                  src={fx.src}
                  alt="Profile Effect"
                  className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
                  style={{ zIndex: fx.z_index ?? 30 }}
                />
              ))}
            </div>
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
                    : `relative w-full flex ${isLeft ? "justify-start px-6" : "justify-center"}`
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
                <AvatarInner
                  avatarUrl={avatarUrl}
                  shapeClass={shapeClass}
                  selectedDecoration={selectedDecoration}
                  decorationHue={decorationHue}
                />
              </div>

            <div
              className={`flex flex-col ${alignClass} ${
                avatarBeside ? "flex-1 min-w-0" : "w-full px-6 pt-3"
              }`}
              style={avatarBeside && hasBanner ? { marginTop: "-6px" } : undefined}
            >
              {display && (
                <div className="relative group/uid flex justify-center">
                  <UsernameEffect effect={usernameEffect}>
                    <h1 className="tracking-tight text-center mb-2 max-w-[200px] truncate" style={{ fontFamily: fontClassMap[usernameFont] || "var(--font-inter)", fontSize: `${usernameFontSize}px`, fontWeight: usernameFontWeight, letterSpacing: `${usernameLetterSpacing}px`, color: usernameColor }}>
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
                </div>
              )}
              {detailSlot("beside", `mt-1 text-center ${justifyClass}`)}
              {!sectioned && bio?.trim() && <div className="mt-1.5 w-full">{textBlock(bio.trim(), isLeft)}</div>}

            </div>
            </div>

            {insideWidgets("w-full px-6 pb-16")}
          </div>

          {detailSlot("bottom-profile", badgeClass, { except: ["feedback"] })}
          {detailSlot("bottom-profile", BADGE_CLASSES.cardRight, { only: ["feedback"] })}

        </div>

        </CardTransition>
        </CardEffect>

        {!sectioned && outsideWidgets}
        {!sectioned && musicPlayer}

        {detailSlot("bottom-page", BADGE_CLASSES.page, { except: ["feedback"] })}
        {detailSlot("bottom-page", BADGE_CLASSES.pageRight, { only: ["feedback"] })}
        </div>
        </div>

        {paged && (
          <div className="w-full min-h-screen flex items-center justify-center px-6 py-16">
            <div
              className="w-[var(--card-w)] max-w-[100vw] shrink-0 flex flex-col z-10"
              style={{ "--card-w": cardWidth } as React.CSSProperties}
            >
              {aboutVisible && (
                <>
                  <div className="mb-3 text-left">
                    <h2
                      style={{
                        fontFamily: fontClassMap[usernameFont] || "var(--font-inter)",
                        fontSize: "15px",
                        fontWeight: 500,
                        letterSpacing: `${usernameLetterSpacing}px`,
                        color: usernameColor,
                      }}
                    >
                      {aboutSectionTitle?.trim() || "About"}
                    </h2>
                    {aboutSubtitle && (
                      <p
                        className="mt-0.5 opacity-50"
                        style={{
                          fontFamily: fontClassMap[bioFont] || "var(--font-inter)",
                          fontSize: "12.5px",
                          letterSpacing: `${bioLetterSpacing}px`,
                          color: bioColor,
                        }}
                      >
                        {renderFormattedText(aboutSubtitle)}
                      </p>
                    )}
                  </div>

                  {aboutText && (
                    <div className="relative w-full p-6" style={sectionSurface}>
                      {textBlock(aboutText, true)}
                    </div>
                  )}
                  {aboutHasWidgets && outsideWidgets}
                  {musicPlayer}
                </>
              )}
            </div>
          </div>
        )}

        {commentsEnabled && (
          <div
            className="absolute top-6 right-6 z-50 animate-in fade-in zoom-in duration-300"
            style={{
              '--comment-bg': otherColor ? hexToRgba(otherColor, 10) : 'rgba(255, 255, 255, 0.1)',
              '--comment-border': otherColor ? hexToRgba(otherColor, 20) : 'rgba(255, 255, 255, 0.2)',
              '--comment-bg-hover': otherColor ? hexToRgba(otherColor, 20) : 'rgba(255, 255, 255, 0.2)',
              '--comment-border-hover': otherColor ? hexToRgba(otherColor, 40) : 'rgba(255, 255, 255, 0.4)',
              '--comment-icon': otherColor,
            } as React.CSSProperties}
          >
            <button
              onClick={() => setIsCommentsModalOpen(true)}
              className="w-12 h-12 rounded-full bg-[var(--comment-bg)] backdrop-blur-md border border-[var(--comment-border)] flex items-center justify-center hover:bg-[var(--comment-bg-hover)] hover:border-[var(--comment-border-hover)] hover:scale-105 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.1)] group focus:outline-none"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--comment-icon)] group-active:scale-95 transition-transform drop-shadow-md opacity-80 group-hover:opacity-100">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>
          </div>
        )}

        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          profileId={profileId}
          viewerId={viewerId}
          showCommentsPublicly={showCommentsPublicly}
          allowNewComments={allowNewComments}
        />
      </div>
    );
};

export default Layout1;

