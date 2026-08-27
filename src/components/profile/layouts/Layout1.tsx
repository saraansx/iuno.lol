"use client";

import React, {  useEffect, useState  } from "react";
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
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";

const FONT_CLASS_MAP: Record<string, string> = {
  "Inter": "var(--font-inter)",
  "Roboto": "var(--font-roboto)",
  "Outfit": "var(--font-outfit)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "Playfair Display": "var(--font-playfair)",
  "Poppins": "var(--font-poppins)",
  "Montserrat": "var(--font-montserrat)",
  "DM Sans": "var(--font-dm-sans)",
  "Syne": "var(--font-syne)",
  "Oxanium": "var(--font-oxanium)",
  "Pacifico": "var(--font-pacifico)",
  "Caveat": "var(--font-caveat)",
  "Paper Notes": "var(--font-paper-notes)",
  "Chillax": "var(--font-chillax)",
  "Dancing Script": "var(--font-dancing-script)",
  "Comfortaa": "var(--font-comfortaa)",
  "Elegant Bloom": "var(--font-elegant-bloom)",
  "Caviar Dreams": "var(--font-caviar-dreams)",
  "Pixelify": "var(--font-pixelify)",
};

const SHAPE_CLASSES: Record<string, string> = {
  square: "rounded-lg",
  soft: "rounded-[14px]",
  rounded: "rounded-[24px]",
  circle: "rounded-full",
};

const renderFormattedText = (text: string) => {
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
        <span key={idx} className="flex items-center gap-2 justify-center">
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
  bioAlign?: "left" | "center" | "right";
  otherFont?: string;
  otherFontSize?: number;
  otherFontWeight?: number;
  otherLetterSpacing?: number;
  otherColor?: string;
  highlightColor?: string;
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
}

function hexToRgba(hex: string | undefined, opacity: number): string {
  if (!hex) return `rgba(5, 5, 5, ${opacity / 100})`;
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(5, 5, 5, ${opacity / 100})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

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

    {/* Decoration Overlay */}
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
  bioAlign = "center",
  otherFont = "Inter",
  otherFontSize = 14,
  otherFontWeight = 400,
  otherLetterSpacing = 0,
  otherColor = "#FFFFFF",
  highlightColor,
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

  // Viewer-specific state (is this visitor signed in? did they already vote?)
  // is fetched client-side so the page HTML stays identical for every visitor
  // and can be served from the CDN. Starts from the server-provided props
  // (null) so there's no hydration mismatch, then hydrates after mount.
  const [viewerId, setViewerId] = useState<number | null>(viewerIdProp ?? null);
  const [viewerFeedback, setViewerFeedback] = useState<'like' | 'dislike' | null>(viewerFeedbackProp);

  useEffect(() => {
    if (typeof window === "undefined" || !profileId) return;
    // Dashboard preview renders with viewerId={-1} as a sentinel that disables
    // interactions. Keep it — don't run the real lookup or overwrite it.
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
      // Fetch live data (views, likes, dislikes) from the API by username (prevents enumeration)
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

  // Every hover tooltip pill shares these, so the Highlight font group drives
  // them all from one place.
  const tooltipTextStyle: React.CSSProperties = {
    fontFamily: fontClassMap[highlightFont] || "var(--font-inter)",
    fontSize: `${highlightFontSize}px`,
    fontWeight: highlightFontWeight,
    letterSpacing: `${highlightLetterSpacing}px`,
  };
  const shapeClass = SHAPE_CLASSES[avatarShape] || "rounded-[24px]";

  /* ── WITH BANNER ─────────────────────────────────────────────────── */
  if (bannerImageUrl) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-6 relative overflow-hidden">
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
        />

        {bannerBackgroundUrl && (
          isVideoUrl(bannerBackgroundUrl) ? (
            <video
              key={bannerBackgroundUrl}
              src={bannerBackgroundUrl}
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              style={{
                filter: profileBackgroundBlur > 0 ? `blur(${profileBackgroundBlur}px)` : undefined,
              }}
              autoPlay
              muted
              ref={(el) => { if (el) el.defaultMuted = true; }}
              loop
              playsInline
            />
          ) : (
            <Image
              src={bannerBackgroundUrl}
              alt="Background"
              fill
              className="object-cover z-0 pointer-events-none"
              style={{
                filter: profileBackgroundBlur > 0 ? `blur(${profileBackgroundBlur}px)` : undefined,
              }}
              unoptimized
              priority
            />
          )
        )}

        <BackgroundEffect
          effect={backgroundEffect ?? "none"}
          intensity={backgroundEffectIntensity}
          color={backgroundEffectColor}
          aboveContainer={backgroundEffectAboveContainer}
        />

        <CursorTrail trail={cursorTrail} color={cursorTrailColor} />

        {/* Wrapper — content + background are siblings */}
        <div className="w-full max-w-[764px] flex flex-col items-center z-10">
        <CardEffect effect={cardEffect} className="w-full max-w-[764px]">
        <CardTransition transition={cardTransition} className="w-full max-w-[764px]">
        <div className="w-full max-w-[764px] relative flex flex-col items-center overflow-visible z-10">
          {/* Profile Frame Overlay (Back Layers) */}
          {/* Border Effect Overlay */}
          <BorderEffect
            effect={borderEffect}
            color={borderEffectColor}
            borderRadius={profileBorderRadius}
            borderWidth={profileBorderWidth}
            zIndex={30}
          />

          {/* Background card — this entire layer fades with opacity */}
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

          {/* Subtle top highlight — on the background */}
          <div
            className="absolute h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent z-10"
            style={{
              opacity: profileOpacity / 100,
              top: `${profileBorderWidth}px`,
              left: `${profileBorderWidth}px`,
              right: `${profileBorderWidth}px`
            }}
          />

          {/* Profile Effect Animation Layers */}
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

          {/* Profile Frame Overlay (Front Layers) */}

          {/* Content — always full opacity, positioned independently */}
          <div
            className="relative z-20 flex flex-col items-center w-full"
            style={{ padding: `${profileBorderWidth}px` }}
          >
            {/* Banner */}
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
                {/* Bottom gradient shade */}
                <div className={`absolute inset-x-0 bottom-0 pointer-events-none ${bannerBlend ? "h-full bg-gradient-to-t from-[#000000]/80 via-transparent to-transparent" : "h-8 bg-gradient-to-t from-black/60 to-transparent"}`} />
              </div>
            )}

            {/* Avatar overlapping banner bottom or at top of card */}
            <div className="relative w-full flex justify-center" style={{ marginTop: hasBanner ? "-44px" : "24px" }}>
              <AvatarInner
                avatarUrl={avatarUrl}
                shapeClass={shapeClass}
                selectedDecoration={selectedDecoration}
                decorationHue={decorationHue}
              />
            </div>

            {/* Content */}
            <div className="w-full flex flex-col items-center px-6 pb-16 pt-3">
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
              {location && (
                <div
                  className="mt-1 text-center flex items-center justify-center gap-3"
                  style={{
                    fontFamily: fontClassMap[otherFont] || "var(--font-inter)",
                    fontSize: `${otherFontSize}px`,
                    fontWeight: otherFontWeight,
                    letterSpacing: `${otherLetterSpacing}px`,
                    color: otherColor,
                  }}
                >
                  <span className="flex items-center gap-1.5 group relative">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {location}
                    {showLocationTooltip && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
                        <div
                          className="bg-[#0f0f12]/75 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-white shadow-lg whitespace-nowrap"
                          style={tooltipTextStyle}
                        >
                          Location
                        </div>
                      </div>
                    )}
                  </span>
                  {occupation && (
                    <span className="flex items-center gap-1.5 group relative">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      {occupation}
                      {showOccupationTooltip && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
                          <div
                            className="bg-[#0f0f12]/75 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-white shadow-lg whitespace-nowrap"
                            style={tooltipTextStyle}
                          >
                            Occupation
                          </div>
                        </div>
                      )}
                    </span>
                  )}
                </div>
              )}
              {!location && occupation && (
                <p
                  className="mt-1 text-center flex items-center justify-center gap-3"
                  style={{
                    fontFamily: fontClassMap[otherFont] || "var(--font-inter)",
                    fontSize: `${otherFontSize}px`,
                    fontWeight: otherFontWeight,
                    letterSpacing: `${otherLetterSpacing}px`,
                    color: otherColor,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  {occupation}
                </p>
              )}
              {bio?.trim() && (
                <div
                  className={`w-full mt-1.5 flex ${
                    bioAlign === "left"
                      ? "justify-start"
                      : bioAlign === "right"
                      ? "justify-end"
                      : "justify-center"
                  }`}
                >
                  <DescriptionEffect effect={descriptionEffect}>
                    <p
                      className={`leading-relaxed max-w-[90%] break-words ${
                        bioAlign === "left"
                          ? "text-left"
                          : bioAlign === "right"
                          ? "text-right"
                          : "text-center"
                      }`}
                      style={{
                        fontFamily: fontClassMap[bioFont] || "var(--font-inter)",
                        fontSize: `${bioFontSize}px`,
                        fontWeight: bioFontWeight,
                        letterSpacing: `${bioLetterSpacing}px`,
                        color: bioColor,
                      }}
                    >
                      {renderFormattedText(bio.trim())}
                    </p>
                  </DescriptionEffect>
                </div>
              )}

              {/* Inside Card Widgets */}
              <ProfileWidgets widgets={widgets} placement="inside" widgetPrimaryTextColor={widgetPrimaryTextColor} widgetSecondaryTextColor={widgetSecondaryTextColor} widgetBorderColor={widgetBorderColor} widgetBorderOpacity={widgetBorderOpacity} widgetBorderWidth={widgetBorderWidth} widgetBorderRadius={widgetBorderRadius} />
            </div>
          </div>

          {/* Views count badge in bottom left */}
          {(viewsEnabled || (joinDateEnabled && formattedJoinDate)) && (
            <div
              className="absolute bottom-3.5 left-4.5 flex items-center gap-2 z-[70] select-none"
              style={{
                color: highlightColor || 'rgba(255, 255, 255, 0.6)',
                fontFamily: fontClassMap[otherFont] || "var(--font-inter)",
                fontSize: `${otherFontSize}px`,
                fontWeight: otherFontWeight,
                letterSpacing: `${otherLetterSpacing}px`,
              }}
            >
              {viewsEnabled && (
                <div className="relative group/tooltip flex justify-center">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0 opacity-80">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    <span>{viewsAnimationEnabled ? animatedViews : views}</span>
                  </div>
                  {showViewsTooltip && (
                    <div className="absolute bottom-full mb-2 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover/tooltip:translate-y-0">
                      <div className="bg-[#0f0f12]/75 border border-white/10 text-white px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-xl" style={tooltipTextStyle}>
                        Views
                      </div>
                    </div>
                  )}
                </div>
              )}

              {joinDateEnabled && formattedJoinDate && (
                <>
                  {viewsEnabled && <span className="opacity-30">|</span>}
                  <div className="relative group/tooltip flex justify-center">
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      {formattedJoinDate}
                    </span>
                    {showJoinDateTooltip && (
                      <div className="absolute bottom-full mb-2 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover/tooltip:translate-y-0">
                        <div className="bg-[#0f0f12]/75 border border-white/10 text-white px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-xl" style={tooltipTextStyle}>
                          Join date
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}


          {/* Feedback Buttons */}
          {feedbackEnabled && (
            <div className="absolute bottom-3.5 right-4.5 z-[70]">
              <FeedbackButtons
                profileId={profileId}
                viewerId={viewerId}
                initialLikes={likesCount}
                initialDislikes={dislikesCount}
                initialFeedback={viewerFeedback}
                highlightColor={highlightColor}
                tooltipTextStyle={tooltipTextStyle}
                showLikesTooltip={showLikesTooltip}
                showDislikesTooltip={showDislikesTooltip}
                showFeedbackPublicly={showFeedbackPublicly}
              />
            </div>
          )}
        </div>

        </CardTransition>
        </CardEffect>

        {/* Outside Card Widgets */}
        <ProfileWidgets widgets={widgets} placement="outside" widgetPrimaryTextColor={widgetPrimaryTextColor} widgetSecondaryTextColor={widgetSecondaryTextColor} widgetBorderColor={widgetBorderColor} widgetBorderOpacity={widgetBorderOpacity} widgetBorderWidth={widgetBorderWidth} widgetBorderRadius={widgetBorderRadius} />
        </div>

        {/* Floating Comments Button */}
        {commentsEnabled && (
          <div
            className="absolute top-6 right-6 z-50 animate-in fade-in zoom-in duration-300"
            style={{
              '--comment-bg': highlightColor ? hexToRgba(highlightColor, 10) : 'rgba(255, 255, 255, 0.1)',
              '--comment-border': highlightColor ? hexToRgba(highlightColor, 20) : 'rgba(255, 255, 255, 0.2)',
              '--comment-bg-hover': highlightColor ? hexToRgba(highlightColor, 20) : 'rgba(255, 255, 255, 0.2)',
              '--comment-border-hover': highlightColor ? hexToRgba(highlightColor, 40) : 'rgba(255, 255, 255, 0.4)',
              '--comment-icon': highlightColor || '#ffffff',
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
  }

  /* ── NO BANNER — original layout ────────────────────────────────── */
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 relative overflow-hidden">
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
        fontClassMap={FONT_CLASS_MAP}
      />

      {bannerBackgroundUrl && (
        isVideoUrl(bannerBackgroundUrl) ? (
          <video
            key={bannerBackgroundUrl}
            src={bannerBackgroundUrl}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            style={{
              filter: profileBackgroundBlur > 0 ? `blur(${profileBackgroundBlur}px)` : undefined,
            }}
            autoPlay
            muted
            ref={(el) => { if (el) el.defaultMuted = true; }}
            loop
            playsInline
          />
        ) : (
          <Image
            src={bannerBackgroundUrl}
            alt="Background"
            fill
            className="object-cover z-0 pointer-events-none"
            style={{
              filter: profileBackgroundBlur > 0 ? `blur(${profileBackgroundBlur}px)` : undefined,
            }}
            unoptimized
            priority
          />
        )
      )}

      <BackgroundEffect
        effect={backgroundEffect ?? "none"}
        intensity={backgroundEffectIntensity}
        color={backgroundEffectColor}
      />

      <CursorTrail trail={cursorTrail} color={cursorTrailColor} />

      {/* Wrapper — content + background are siblings */}
      <div className="w-full max-w-[764px] flex flex-col items-center z-10">
      <CardEffect effect={cardEffect} className="w-full max-w-[764px]">
        <CardTransition transition={cardTransition} className="w-full max-w-[764px]">
        <div className="w-full max-w-[764px] relative flex flex-col items-center justify-center z-10">
        {/* Profile Frame Overlay (Back Layers) */}
        {/* Profile Effect Animation Layers (Non-banner) */}
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
        {/* Border Effect Overlay */}
        <BorderEffect
          effect={borderEffect}
          color={borderEffectColor}
          borderRadius={profileBorderRadius}
          borderWidth={profileBorderWidth}
          zIndex={10}
        />
        {/* Background card — this entire layer fades with opacity */}
        <div
          className="absolute inset-0"
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

        {/* Subtle top highlight — on the background */}
        <div
          className="absolute h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent z-10"
          style={{
            opacity: profileOpacity / 100,
            top: `${profileBorderWidth}px`,
            left: `${profileBorderWidth}px`,
            right: `${profileBorderWidth}px`
          }}
        />

        {/* Profile Frame Overlay (Front Layers) */}

        {/* Content — always full opacity, positioned independently */}
        <div
          className="relative z-20 flex flex-col items-center justify-center w-full"
          style={{
            paddingTop: `calc(2.5rem + ${profileBorderWidth}px)`,
            paddingBottom: `calc(3.5rem + ${profileBorderWidth}px)`,
            paddingLeft: `calc(1.5rem + ${profileBorderWidth}px)`,
            paddingRight: `calc(1.5rem + ${profileBorderWidth}px)`,
          }}
        >
          {/* Avatar sitting on the top border */}
          <div className="absolute -top-12 w-24 h-24">
            <div
              className={`absolute inset-0 bg-[#0a0a0a] border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-xl ${shapeClass}`}
            >
              {avatarUrl ? (
                isVideoUrl(avatarUrl) ? (
                  <video
                    src={avatarUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized priority />
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

            {/* Decoration Overlay */}
            {selectedDecoration && (
              <div className="pointer-events-none absolute -inset-2 z-10">
                <Image
                  src={selectedDecoration.url}
                  alt={selectedDecoration.name}
                  fill
                  unoptimized
                  priority
                  className="object-contain"
                  style={{ filter: `hue-rotate(${decorationHue}deg)` }}
                />
              </div>
            )}
          </div>

          {display && (
            <UsernameEffect effect={usernameEffect}>
              <h1 className="text-white tracking-tight text-center mt-8" style={{ fontFamily: fontClassMap[usernameFont] || "var(--font-inter)", fontSize: `${usernameFontSize}px`, fontWeight: usernameFontWeight, letterSpacing: `${usernameLetterSpacing}px` }}>
                {display}
              </h1>
            </UsernameEffect>
          )}

          {location && (
            <p className="text-white text-sm mt-1 text-center flex items-center justify-center gap-3">
              <span className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {location}
              </span>
              {occupation && (
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  {occupation}
                </span>
              )}
            </p>
          )}
          {!location && occupation && (
            <p className="text-white/60 text-sm mt-1 text-center flex items-center justify-center gap-3">
              {occupation && (
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  {occupation}
                </span>
              )}
            </p>
          )}

          {bio && (
            <DescriptionEffect effect={descriptionEffect}>
              <p
                className={`mt-1.5 leading-relaxed max-w-[90%] break-words ${
                  bioAlign === "left"
                    ? "text-left self-start"
                    : bioAlign === "right"
                    ? "text-right self-end"
                    : "text-center self-center"
                }`}
                style={{
                  fontFamily: fontClassMap[bioFont] || "var(--font-inter)",
                  fontSize: `${bioFontSize}px`,
                  fontWeight: bioFontWeight,
                  letterSpacing: `${bioLetterSpacing}px`,
                  color: bioColor,
                }}
              >
                {renderFormattedText(bio)}
              </p>
            </DescriptionEffect>
          )}

          {/* Inside Card Widgets */}
          <ProfileWidgets widgets={widgets} placement="inside" widgetPrimaryTextColor={widgetPrimaryTextColor} widgetSecondaryTextColor={widgetSecondaryTextColor} widgetBorderColor={widgetBorderColor} widgetBorderOpacity={widgetBorderOpacity} widgetBorderWidth={widgetBorderWidth} widgetBorderRadius={widgetBorderRadius} />
        </div>

        {/* Views count badge in bottom left */}
        {(viewsEnabled || (joinDateEnabled && formattedJoinDate)) && (
          <div
            className="absolute bottom-3.5 left-4.5 flex items-center gap-2 z-[70] select-none"
            style={{
              color: highlightColor || 'rgba(255, 255, 255, 0.6)',
              fontFamily: fontClassMap[otherFont] || "var(--font-inter)",
              fontSize: `${otherFontSize}px`,
              fontWeight: otherFontWeight,
              letterSpacing: `${otherLetterSpacing}px`,
            }}
          >
            {viewsEnabled && (
              <div className="relative group/tooltip flex justify-center">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0 opacity-80">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  <span>{viewsAnimationEnabled ? animatedViews : views}</span>
                </div>
                {showViewsTooltip && (
                  <div className="absolute bottom-full mb-2 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover/tooltip:translate-y-0">
                    <div className="bg-[#0f0f12]/75 border border-white/10 text-white px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-xl" style={tooltipTextStyle}>
                      Views
                    </div>
                  </div>
                )}
              </div>
            )}

            {joinDateEnabled && formattedJoinDate && (
              <>
                {viewsEnabled && <span className="opacity-30">|</span>}
                <div className="relative group/tooltip flex justify-center">
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    {formattedJoinDate}
                  </span>
                  {showJoinDateTooltip && (
                    <div className="absolute bottom-full mb-2 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover/tooltip:translate-y-0">
                      <div className="bg-[#0f0f12]/75 border border-white/10 text-white px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-xl" style={tooltipTextStyle}>
                        Join date
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Feedback Buttons */}
        {feedbackEnabled && (
          <div className="absolute bottom-3.5 right-4.5 z-[70]">
            <FeedbackButtons
              profileId={profileId}
              viewerId={viewerId}
              initialLikes={likesCount}
              initialDislikes={dislikesCount}
              initialFeedback={viewerFeedback}
              highlightColor={highlightColor}
              tooltipTextStyle={tooltipTextStyle}
              showLikesTooltip={showLikesTooltip}
              showDislikesTooltip={showDislikesTooltip}
              showFeedbackPublicly={showFeedbackPublicly}
            />
          </div>
        )}
      </div>
      </CardTransition>
      </CardEffect>

      {/* Outside Card Widgets */}
      <ProfileWidgets widgets={widgets} placement="outside" widgetPrimaryTextColor={widgetPrimaryTextColor} widgetSecondaryTextColor={widgetSecondaryTextColor} widgetBorderColor={widgetBorderColor} widgetBorderOpacity={widgetBorderOpacity} widgetBorderWidth={widgetBorderWidth} widgetBorderRadius={widgetBorderRadius} />
      </div>

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






