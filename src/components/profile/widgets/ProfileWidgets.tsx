"use client";

import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import dynamic from "next/dynamic";

const DiscordPresenceWidget = dynamic(() => import("./DiscordPresenceWidget"));
const DiscordServerWidget = dynamic(() => import("./DiscordServerWidget"));
const GitHubUserWidget = dynamic(() => import("./GitHubUserWidget"));
const GitHubRepoWidget = dynamic(() => import("./GitHubRepoWidget"));
const PinterestProfileWidget = dynamic(() => import("./PinterestProfileWidget"));
const PinterestBoardWidget = dynamic(() => import("./PinterestBoardWidget"));
const ValorantWidget = dynamic(() => import("./ValorantWidget"));
const SteamWidget = dynamic(() => import("./SteamWidget"));
const GenshinWidget = dynamic(() => import("./GenshinWidget"));
const TwitchWidget = dynamic(() => import("./TwitchWidget"));
const SpotifyWidget = dynamic(() => import("./SpotifyWidget"));
const AppleMusicWidget = dynamic(() => import("./AppleMusicWidget"));
const TikTokWidget = dynamic(() => import("./TikTokWidget"));
const InstagramWidget = dynamic(() => import("./InstagramWidget"));
const SoundcloudWidget = dynamic(() => import("./SoundcloudWidget"));
const SoundcloudTrackWidget = dynamic(() => import("./SoundcloudTrackWidget"));
const YouTubeWidget = dynamic(() => import("./YouTubeWidget"));
const TelegramWidget = dynamic(() => import("./TelegramWidget"));
const RobloxWidget = dynamic(() => import("./RobloxWidget"));
const WeatherWidget = dynamic(() => import("./WeatherWidget"));
import { FONT_FAMILY_VARS } from "@/lib/fonts";

function renderWidget(w: WidgetItem) {
  if (w.type === "presence") {
    return <DiscordPresenceWidget widget={w} />;
  }
  if (w.type === "server") {
    return <DiscordServerWidget widget={w} />;
  }
  if (w.type === "github-user" || w.type === "user") {
    return <GitHubUserWidget widget={w} />;
  }
  if (w.type === "github-repo" || w.type === "repo") {
    return <GitHubRepoWidget widget={w} />;
  }
  if (w.type === "pinterest-profile") {
    return <PinterestProfileWidget widget={w} />;
  }
  if (w.type === "pinterest-board") {
    return <PinterestBoardWidget widget={w} />;
  }
  if (w.type === "valorant-profile" || w.platform === "valorant") {
    return <ValorantWidget widget={w} />;
  }
  if (w.type === "steam-profile" || w.platform === "steam") {
    return <SteamWidget widget={w} />;
  }
  if (w.type === "genshin-profile" || w.platform === "genshin") {
    return <GenshinWidget widget={w} />;
  }
  if (w.type === "twitch-channel" || w.platform === "twitch") {
    return <TwitchWidget widget={w} />;
  }
  if (w.platform === "spotify" || w.type?.startsWith("spotify-")) {
    return <SpotifyWidget widget={w} />;
  }
  if (w.platform === "apple-music" || w.type?.startsWith("apple-music-")) {
    return <AppleMusicWidget widget={w} />;
  }
  if (w.type === "tiktok-profile" || w.platform === "tiktok") {
    return <TikTokWidget widget={w} />;
  }
  if (w.type === "instagram-profile" || w.platform === "instagram") {
    return <InstagramWidget widget={w} />;
  }
  if (w.type === "soundcloud-track") {
    return <SoundcloudTrackWidget widget={w} />;
  }
  if (w.type === "soundcloud-profile" || w.platform === "soundcloud") {
    return <SoundcloudWidget widget={w} />;
  }
  if (w.type === "youtube-profile" || w.platform === "youtube") {
    return <YouTubeWidget widget={w} />;
  }
  if (w.type === "telegram-profile" || w.platform === "telegram") {
    return <TelegramWidget widget={w} />;
  }
  if (w.type === "roblox-profile" || w.platform === "roblox") {
    return <RobloxWidget widget={w} />;
  }
  if (w.type === "weather-current" || w.platform === "weather") {
    return <WeatherWidget widget={w} />;
  }
  return null;
}

function hexToRgbChannels(hex: string | undefined | null): string | null {
  if (!hex) return null;

  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;

  const int = parseInt(value, 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

interface WidgetStyleProps {
  widgetPrimaryTextColor?: string | null;
  widgetSecondaryTextColor?: string | null;
  widgetBorderColor?: string | null;
  widgetBorderOpacity?: number | null;
  widgetBorderWidth?: number | null;
  widgetBorderRadius?: number | null;
  widgetCardColor?: string | null;
  widgetCardOpacity?: number | null;
  widgetFont?: string | null;
  widgetFontSize?: number | null;
  widgetFontWeight?: number | null;
  widgetLetterSpacing?: number | null;
  widgetSecondaryFont?: string | null;
  widgetSecondaryFontSize?: number | null;
  widgetSecondaryFontWeight?: number | null;
  widgetSecondaryLetterSpacing?: number | null;
}

const WIDGET_BASE_FONT_SIZE = 12.5;

function widgetThemeStyle(style: WidgetStyleProps): React.CSSProperties {
  const vars: Record<string, string> = {};

  const primary = hexToRgbChannels(style.widgetPrimaryTextColor);
  if (primary) vars["--widget-primary"] = primary;

  const secondary = hexToRgbChannels(style.widgetSecondaryTextColor);
  if (secondary) vars["--widget-secondary"] = secondary;

  const border = hexToRgbChannels(style.widgetBorderColor);
  if (border) vars["--widget-border"] = border;

  if (typeof style.widgetBorderOpacity === "number") {
    const clamped = Math.min(100, Math.max(0, style.widgetBorderOpacity));
    vars["--widget-border-alpha"] = String(clamped / 100);
  }

  if (typeof style.widgetBorderWidth === "number") {
    const clamped = Math.min(20, Math.max(0, style.widgetBorderWidth));
    vars["--widget-border-width"] = `${clamped}px`;
  }

  if (typeof style.widgetBorderRadius === "number") {
    const clamped = Math.min(100, Math.max(0, style.widgetBorderRadius));
    vars["--widget-border-radius"] = `${clamped}px`;
  }

  const card = hexToRgbChannels(style.widgetCardColor);
  if (card) vars["--widget-card"] = card;

  if (typeof style.widgetCardOpacity === "number") {
    const clamped = Math.min(100, Math.max(0, style.widgetCardOpacity));
    vars["--widget-card-alpha"] = String(clamped / 100);
  }

  const font = style.widgetFont ? FONT_FAMILY_VARS[style.widgetFont] : undefined;
  if (font) vars["--widget-font"] = font;

  if (typeof style.widgetFontSize === "number" && style.widgetFontSize > 0) {
    const clamped = Math.min(64, Math.max(8, style.widgetFontSize));
    vars["--widget-font-scale"] = String(clamped / WIDGET_BASE_FONT_SIZE);
  }

  if (typeof style.widgetFontWeight === "number" && style.widgetFontWeight > 0) {
    const clamped = Math.min(900, Math.max(100, style.widgetFontWeight));
    vars["--widget-font-weight"] = String(clamped);
  }

  if (typeof style.widgetLetterSpacing === "number") {
    const clamped = Math.min(50, Math.max(-10, style.widgetLetterSpacing));
    vars["--widget-letter-spacing"] = `${clamped}px`;
  }

  const secondaryFont = style.widgetSecondaryFont ? FONT_FAMILY_VARS[style.widgetSecondaryFont] : undefined;
  if (secondaryFont) vars["--widget-secondary-font"] = secondaryFont;

  if (typeof style.widgetSecondaryFontSize === "number" && style.widgetSecondaryFontSize > 0) {
    const clamped = Math.min(64, Math.max(8, style.widgetSecondaryFontSize));
    vars["--widget-secondary-font-scale"] = String(clamped / WIDGET_BASE_FONT_SIZE);
  }

  if (typeof style.widgetSecondaryFontWeight === "number" && style.widgetSecondaryFontWeight > 0) {
    const clamped = Math.min(900, Math.max(100, style.widgetSecondaryFontWeight));
    vars["--widget-secondary-font-weight"] = String(clamped);
  }

  if (typeof style.widgetSecondaryLetterSpacing === "number") {
    const clamped = Math.min(50, Math.max(-10, style.widgetSecondaryLetterSpacing));
    vars["--widget-secondary-letter-spacing"] = `${clamped}px`;
  }

  return vars as React.CSSProperties;
}

const TWO_COLUMN_MIN_CARD_WIDTH = 650;

export default function ProfileWidgets({
  widgets = [],
  placement = "inside",
  cardWidth,
  ...style
}: {
  widgets?: WidgetItem[];
  placement?: "inside" | "outside";
 cardWidth?: number;
} & WidgetStyleProps) {
  const activeWidgets = (widgets || []).filter(
    (w) => w.enabled && (w.placement || "inside") === placement
  );

  if (activeWidgets.length === 0) return null;

  const themeStyle = widgetThemeStyle(style);

  const twoColumns = cardWidth === undefined || cardWidth >= TWO_COLUMN_MIN_CARD_WIDTH;

 const lastSpansFullRow = twoColumns && activeWidgets.length % 2 === 1;

  return (
    <div
      className={`iuno-widgets w-full mt-4 grid grid-cols-1 gap-3 ${
        twoColumns ? "min-[640px]:grid-cols-2" : ""
      } ${placement === "outside" ? "z-10" : ""}`}
      style={themeStyle}
    >
      {activeWidgets.map((w, i) => {
        const isLastAlone = lastSpansFullRow && i === activeWidgets.length - 1;
        return (
          <div
            key={w.id}
            className={`w-full min-w-0 ${isLastAlone ? "min-[640px]:col-span-2" : ""}`}
          >
            {renderWidget(w)}
          </div>
        );
      })}
    </div>
  );
}
