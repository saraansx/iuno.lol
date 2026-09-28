export type LinkVariant = "small" | "big";

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  variant: LinkVariant;
  color: string | null;
}

export const MAX_LINKS = 10;

export const DEFAULT_LINK_COLOR = "#5b6cf5";

export const LINK_ICON_KEYS = [
  "discord",
  "x",
  "instagram",
  "youtube",
  "twitch",
  "tiktok",
  "github",
  "spotify",
  "steam",
  "telegram",
  "pinterest",
  "globe",
  "link",
  "mail",
  "music",
  "play",
  "message",
  "send",
  "at",
  "star",
  "heart",
  "zap",
] as const;

export type LinkIconKey = (typeof LINK_ICON_KEYS)[number];

const LINK_ICON_SET = new Set<string>(LINK_ICON_KEYS);

const CUSTOM_ICON_HOSTS = new Set([
  "cdn.iuno.lol",
  "cdn.discordapp.com",
  "discord-decoration.art",
  "api.iconify.design",
]);

export const ICONIFY_API = "https://api.iconify.design";

export function iconifySvgUrl(name: string): string {
  const clean = name.trim().replace(/\.svg$/i, "");
  const [prefix, ...rest] = clean.split(":");
  if (!prefix || rest.length === 0) return "";
  return `${ICONIFY_API}/${prefix}/${rest.join(":")}.svg`;
}

export const ICON_COLOR_VERSION = 3;

export function normalizeColorParam(color: string | undefined | null): string | null {
  if (!color) return null;
  const clean = color.trim().replace(/^#/, "");
  return /^[0-9a-f]{6}$/i.test(clean) ? clean.toLowerCase() : null;
}

export function iconifyProxyUrl(name: string, color?: string | null): string {
  const tint = normalizeColorParam(color ?? null);
  return `/api/icons/svg?icon=${encodeURIComponent(name)}${tint ? `&color=${tint}` : ""}&v=${ICON_COLOR_VERSION}`;
}

const BRAND_COLORS: Record<string, string> = {
  "simple-icons:discord": "#5865F2",
  "simple-icons:youtube": "#FF0000",
  "simple-icons:twitch": "#9146FF",
  "simple-icons:spotify": "#1ED760",
  "simple-icons:telegram": "#2AABEE",
  "simple-icons:pinterest": "#E60023",
  "simple-icons:github": "#FFFFFF",
  "simple-icons:x": "#FFFFFF",
  "simple-icons:instagram": "#E1306C",
  "simple-icons:tiktok": "#FE2C55",
  "simple-icons:steam": "#66C0F4",
  "simple-icons:reddit": "#FF4500",
  "simple-icons:snapchat": "#FFFC00",
  "simple-icons:whatsapp": "#25D366",
  "simple-icons:facebook": "#0866FF",
  "simple-icons:linkedin": "#0A66C2",
  "simple-icons:gitlab": "#FC6D26",
  "simple-icons:npm": "#CB3837",
  "simple-icons:dribbble": "#EA4C89",
  "simple-icons:behance": "#1769FF",
  "simple-icons:mastodon": "#6364FF",
  "simple-icons:bluesky": "#0285FF",
  "simple-icons:threads": "#FFFFFF",
  "simple-icons:medium": "#FFFFFF",
  "simple-icons:valorant": "#FF4655",
  "simple-icons:kick": "#53FC18",
};

export function brandColorFor(name: string): string {
  return BRAND_COLORS[name.toLowerCase()] ?? "#ffffff";
}

export function iconifyNameFromUrl(url: string): string | null {
  if (!url.startsWith(`${ICONIFY_API}/`)) return null;
  const path = url.slice(ICONIFY_API.length + 1).replace(/\.svg$/i, "");
  const [prefix, ...rest] = path.split("/");
  if (!prefix || rest.length === 0) return null;
  return `${prefix}:${rest.join(":")}`;
}

export const CURATED_ICONIFY_ICONS = [
  "simple-icons:discord",
  "simple-icons:x",
  "simple-icons:instagram",
  "simple-icons:youtube",
  "simple-icons:twitch",
  "simple-icons:tiktok",
  "simple-icons:github",
  "simple-icons:spotify",
  "simple-icons:steam",
  "simple-icons:telegram",
  "simple-icons:pinterest",
  "simple-icons:reddit",
  "lucide:globe",
  "lucide:link",
  "lucide:mail",
  "lucide:music",
  "lucide:play",
  "lucide:message-circle",
  "lucide:send",
  "lucide:at-sign",
  "lucide:star",
  "lucide:heart",
  "lucide:zap",
];

export function isCustomIconUrl(icon: string): boolean {
  if (!icon.startsWith("https://")) return false;
  try {
    return CUSTOM_ICON_HOSTS.has(new URL(icon).hostname);
  } catch {
    return false;
  }
}

export function normalizeLinkUrl(raw: string): string | null {
  const trimmed = raw.trim().slice(0, 2048);
  if (!trimmed) return null;
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeProfileLink(raw: unknown): ProfileLink | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim().slice(0, 64) : "";
  const title = typeof record.title === "string" ? record.title.trim().slice(0, 60) : "";
  const url = typeof record.url === "string" ? normalizeLinkUrl(record.url) : null;
  const rawIcon = typeof record.icon === "string" ? record.icon.trim().slice(0, 2048) : "";
  const icon =
    LINK_ICON_SET.has(rawIcon) || isCustomIconUrl(rawIcon) ? rawIcon : "link";
  const variant: LinkVariant = record.variant === "small" ? "small" : "big";
  const rawColor = typeof record.color === "string" ? record.color.trim() : "";
  const color = /^#[0-9a-f]{6}$/i.test(rawColor) ? rawColor.toLowerCase() : null;
  if (!id || !title || !url) return null;
  return { id, title, url, icon, variant, color };
}
