export const PLATFORM_WIDGET_TYPES: Record<string, string[]> = {
  discord: ["presence", "server"],
  tiktok: ["tiktok-profile"],
  youtube: ["youtube-profile"],
  spotify: [
    "spotify-track",
    "spotify-album",
    "spotify-playlist",
    "spotify-artist",
    "spotify-user",
  ],
  twitch: ["twitch-channel"],
  github: ["github-user", "github-repo"],
  pinterest: ["pinterest-profile", "pinterest-board"],
  valorant: ["valorant-profile"],
  steam: ["steam-profile"],
  genshin: ["genshin-profile"],
  telegram: ["telegram-profile"],
  roblox: ["roblox-profile"],
  weather: ["weather-current"],
};

export function getCanonicalWidgetType(widget: {
  platform: string;
  type: string;
}): string {
  const { platform, type } = widget;
  const types = PLATFORM_WIDGET_TYPES[platform];

  if (types?.includes(type)) return type;

  if (types?.length === 1) return types[0];

  if (platform === "github") return type === "repo" ? "github-repo" : "github-user";
  if (platform === "pinterest") {
    return type === "board" ? "pinterest-board" : "pinterest-profile";
  }
  if (platform === "discord") return type === "server" ? "server" : "presence";

  return type;
}


