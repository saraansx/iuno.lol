
const DIRECT_IMAGE_HOSTS = new Set([
  "cdn.discordapp.com",
  "media.discordapp.net",
  "i.scdn.co",
]);

export function discordActivityImageUrl(url?: string | null): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;

  if (DIRECT_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) return url;

  return `/api/widgets/discord/image?url=${encodeURIComponent(url)}`;
}
