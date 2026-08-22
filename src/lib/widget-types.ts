/**
 * Single source of truth for which widget types each platform offers.
 *
 * Every type listed here is limited to one widget per profile. A platform is
 * considered "full" (and is disabled in the Add Widget modal) once every one of
 * its types is already in use.
 */
export const PLATFORM_WIDGET_TYPES: Record<string, string[]> = {
  discord: ["presence", "server"],
  instagram: ["instagram-profile"],
  tiktok: ["tiktok-profile"],
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
};

/**
 * Resolves a stored widget to its canonical type string.
 *
 * Older widgets were saved with short, un-namespaced types ("user", "repo",
 * "profile", "board") or with no meaningful type at all for single-type
 * platforms, so those are normalized here before any limit check runs.
 */
export function getCanonicalWidgetType(widget: {
  platform: string;
  type: string;
}): string {
  const { platform, type } = widget;
  const types = PLATFORM_WIDGET_TYPES[platform];

  if (types?.includes(type)) return type;

  // Single-type platforms: the platform alone determines the type.
  if (types?.length === 1) return types[0];

  if (platform === "github") return type === "repo" ? "github-repo" : "github-user";
  if (platform === "pinterest") {
    return type === "board" ? "pinterest-board" : "pinterest-profile";
  }
  if (platform === "discord") return type === "server" ? "server" : "presence";

  return type;
}

/** True when every type this platform offers is already taken. */
export function isPlatformFull(platform: string, usedTypes: string[]): boolean {
  const types = PLATFORM_WIDGET_TYPES[platform];
  if (!types?.length) return false;
  return types.every((type) => usedTypes.includes(type));
}

/** True when no platform has any type left to add. */
export function areAllPlatformsFull(usedTypes: string[]): boolean {
  return Object.keys(PLATFORM_WIDGET_TYPES).every((platform) =>
    isPlatformFull(platform, usedTypes)
  );
}
