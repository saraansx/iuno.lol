"use client";

import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import DiscordPresenceWidget from "./DiscordPresenceWidget";
import DiscordServerWidget from "./DiscordServerWidget";
import GitHubUserWidget from "./GitHubUserWidget";
import GitHubRepoWidget from "./GitHubRepoWidget";
import PinterestProfileWidget from "./PinterestProfileWidget";
import PinterestBoardWidget from "./PinterestBoardWidget";
import ValorantWidget from "./ValorantWidget";
import SteamWidget from "./SteamWidget";
import GenshinWidget from "./GenshinWidget";
import TwitchWidget from "./TwitchWidget";
import SpotifyWidget from "./SpotifyWidget";
import InstagramWidget from "./InstagramWidget";
import TikTokWidget from "./TikTokWidget";
import YouTubeWidget from "./YouTubeWidget";
import TelegramWidget from "./TelegramWidget";
import RobloxWidget from "./RobloxWidget";
import WeatherWidget from "./WeatherWidget";

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
  if (w.type === "instagram-profile" || w.platform === "instagram") {
    return <InstagramWidget widget={w} />;
  }
  if (w.type === "tiktok-profile" || w.platform === "tiktok") {
    return <TikTokWidget widget={w} />;
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

/**
 * Converts `#rrggbb` (or `#rgb`) to the "r g b" triplet the CSS variables want.
 *
 * The theming rules in `tailwind.css` use `rgb(var(--widget-primary) / 0.85)`, so
 * the variable has to hold channels rather than a colour — that is what lets one
 * colour serve every opacity step a widget uses. Returns null for anything
 * unparseable, and the caller then leaves the variable unset so the stylesheet's
 * own white fallback applies.
 */
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

export interface WidgetStyleProps {
  /** Widget title colour. */
  widgetPrimaryTextColor?: string | null;
  /** Widget stats and label colour. */
  widgetSecondaryTextColor?: string | null;
  /** Card outline colour. */
  widgetBorderColor?: string | null;
  /** Card outline opacity, 0-100. */
  widgetBorderOpacity?: number | null;
  /** Card outline width in px. */
  widgetBorderWidth?: number | null;
  /** Card corner radius in px. */
  widgetBorderRadius?: number | null;
  /** Widget text font family name, as listed in FONT_OPTIONS. */
  widgetFont?: string | null;
  /** Base widget text size in px; every card size scales against 12.5. */
  widgetFontSize?: number | null;
  /** Widget text weight, 100-900. */
  widgetFontWeight?: number | null;
  /** Extra letter spacing in px. */
  widgetLetterSpacing?: number | null;
}

// Same list the profile card uses. Kept local so ProfileWidgets stays a leaf and
// does not import from the dashboard tree.
const WIDGET_FONT_VARS: Record<string, string> = {
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

// The size the widget cards were built at; the scale is relative to it.
const WIDGET_BASE_FONT_SIZE = 12.5;

/**
 * Builds the custom properties the widget theming rules read.
 *
 * Only the properties that resolved are emitted, so an unset or malformed colour
 * falls through to the stylesheet default rather than rendering as black.
 */
function widgetThemeStyle(style: WidgetStyleProps): React.CSSProperties {
  const vars: Record<string, string> = {};

  const primary = hexToRgbChannels(style.widgetPrimaryTextColor);
  if (primary) vars["--widget-primary"] = primary;

  const secondary = hexToRgbChannels(style.widgetSecondaryTextColor);
  if (secondary) vars["--widget-secondary"] = secondary;

  const border = hexToRgbChannels(style.widgetBorderColor);
  if (border) vars["--widget-border"] = border;

  if (typeof style.widgetBorderOpacity === "number") {
    // Clamp rather than trust the stored value — a hand-edited row should not be
    // able to produce an invalid alpha.
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

  const font = style.widgetFont ? WIDGET_FONT_VARS[style.widgetFont] : undefined;
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


  return vars as React.CSSProperties;
}

export default function ProfileWidgets({
  widgets = [],
  placement = "inside",
  ...style
}: {
  widgets?: WidgetItem[];
  placement?: "inside" | "outside";
} & WidgetStyleProps) {
  const activeWidgets = (widgets || []).filter(
    (w) => w.enabled && (w.placement || "inside") === placement
  );

  if (activeWidgets.length === 0) return null;

  const themeStyle = widgetThemeStyle(style);

  if (activeWidgets.length === 1) {
    const w = activeWidgets[0];
    return (
      <div
        className={`iuno-widgets w-full mt-4 flex justify-center items-center ${
          placement === "outside" ? "z-10" : ""
        }`}
        style={themeStyle}
      >
        <div className="w-full max-w-[340px]">
          {renderWidget(w)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`iuno-widgets w-full mt-4 grid grid-cols-1 min-[640px]:grid-cols-2 gap-3 ${
        placement === "outside" ? "z-10" : ""
      }`}
      style={themeStyle}
    >
      {activeWidgets.map((w) => (
        <div key={w.id} className="w-full min-w-0">
          {renderWidget(w)}
        </div>
      ))}
    </div>
  );
}
