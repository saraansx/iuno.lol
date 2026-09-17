"use client";

import React from "react";
import {
  Globe,
  Link2,
  Mail,
  Music,
  Play,
  MessageCircle,
  Send,
  AtSign,
  Star,
  Heart,
  Zap,
} from "lucide-react";
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  SpotifyLogoIcon,
  TwitchLogoIcon,
  YouTubeLogoIcon,
  TikTokLogoIcon,
  TelegramLogoIcon,
  SteamLogoIcon,
  PinterestLogoIcon,
} from "@/components/profile/widgets/WidgetIcons";
import { ICONIFY_API, LINK_ICON_KEYS, iconifyNameFromUrl, iconifyProxyUrl } from "@/lib/links";

interface LinkIconProps {
  icon: string;
  size?: number;
  className?: string;
  /** User-picked tint. Applies to Iconify glyphs (via proxy) and
   *  currentColor preset glyphs. Uploaded raster images keep own colors. */
  color?: string | null;
}

function XLogoIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className ?? ""}`}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramLogoIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className ?? ""}`}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LucideWrap({
  children,
  size = 16,
  className,
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className ?? ""}`} style={{ width: size, height: size }}>
      {children}
    </span>
  );
}

const REGISTRY: Record<string, (size: number) => React.ReactNode> = {
  discord: (s) => <DiscordLogoIcon size={s} className="" />,
  x: (s) => <XLogoIcon size={s} />,
  instagram: (s) => <InstagramLogoIcon size={s} />,
  youtube: (s) => <YouTubeLogoIcon size={s} className="" />,
  twitch: (s) => <TwitchLogoIcon size={s} className="" />,
  tiktok: (s) => <TikTokLogoIcon size={s} className="" />,
  github: (s) => <GitHubLogoIcon size={s} className="" />,
  spotify: (s) => <SpotifyLogoIcon size={s} className="" />,
  steam: (s) => <SteamLogoIcon size={s} className="" />,
  telegram: (s) => <TelegramLogoIcon size={s} className="" />,
  pinterest: (s) => <PinterestLogoIcon size={s} className="" />,
  globe: (s) => <LucideWrap size={s}><Globe size={s} /></LucideWrap>,
  link: (s) => <LucideWrap size={s}><Link2 size={s} /></LucideWrap>,
  mail: (s) => <LucideWrap size={s}><Mail size={s} /></LucideWrap>,
  music: (s) => <LucideWrap size={s}><Music size={s} /></LucideWrap>,
  play: (s) => <LucideWrap size={s}><Play size={s} /></LucideWrap>,
  message: (s) => <LucideWrap size={s}><MessageCircle size={s} /></LucideWrap>,
  send: (s) => <LucideWrap size={s}><Send size={s} /></LucideWrap>,
  at: (s) => <LucideWrap size={s}><AtSign size={s} /></LucideWrap>,
  star: (s) => <LucideWrap size={s}><Star size={s} /></LucideWrap>,
  heart: (s) => <LucideWrap size={s}><Heart size={s} /></LucideWrap>,
  zap: (s) => <LucideWrap size={s}><Zap size={s} /></LucideWrap>,
};

const ICON_LABELS: Record<string, string> = {
  discord: "Discord",
  x: "X",
  instagram: "Instagram",
  youtube: "YouTube",
  twitch: "Twitch",
  tiktok: "TikTok",
  github: "GitHub",
  spotify: "Spotify",
  steam: "Steam",
  telegram: "Telegram",
  pinterest: "Pinterest",
  globe: "Website",
  link: "Link",
  mail: "Email",
  music: "Music",
  play: "Video",
  message: "Chat",
  send: "Send",
  at: "Mention",
  star: "Star",
  heart: "Heart",
  zap: "Zap",
};

export const LINK_ICON_OPTIONS = LINK_ICON_KEYS.map((key) => ({
  key,
  label: ICON_LABELS[key] ?? key,
}));

export default function LinkIcon({ icon, size = 16, className, color }: LinkIconProps) {
  if (icon.startsWith(`${ICONIFY_API}/`)) {
    const name = iconifyNameFromUrl(icon);
    const src = name ? iconifyProxyUrl(name, color) : icon;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} draggable={false} className={`shrink-0 ${className ?? ""}`} style={{ width: size, height: size }} />;
  }
  if (icon.startsWith("https://") || icon.startsWith("blob:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" width={size} height={size} draggable={false} className={`shrink-0 rounded-md object-cover ${className ?? ""}`} style={{ width: size, height: size }} />;
  }
  const render = REGISTRY[icon] ?? REGISTRY.link;
  return <span className={`inline-flex shrink-0 items-center justify-center ${className ?? ""}`} style={color ? { color } : undefined}>{render(size)}</span>;
}
