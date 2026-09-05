
const PROXY_PATH = "/api/widgets/discord/image";

const DIRECT_IMAGE_HOSTS = new Set([
  "cdn.discordapp.com",
  "media.discordapp.net",
  "i.scdn.co",
]);

export function discordActivityImageUrl(
  url?: string | null,
  sign?: (target: string) => string
): string | null {
  if (!url) return null;

  if (url.startsWith(`${PROXY_PATH}?`)) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;

  if (DIRECT_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) return url;

  if (!sign) return null;

  return `${PROXY_PATH}?url=${encodeURIComponent(url)}&sig=${sign(url)}`;
}
