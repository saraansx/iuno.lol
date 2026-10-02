import { createHash } from "crypto";
import { SITE_CONFIG } from "@/lib/config";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const DEFAULT_EMBED_COLOR = "#5b6cf5";

export function normalizeEmbedColor(color: string | null | undefined): string {
  const val = color?.trim().toLowerCase();
  return val && /^#[0-9a-f]{6}$/.test(val) ? val : DEFAULT_EMBED_COLOR;
}

export function formatTabTitle(
  tabTitle: string | null | undefined,
  username: string,
): string {
  const custom = tabTitle?.trim().replace(/^@+/, "").trim();
  return custom ? `@${custom}` : `@${username} | ${SITE_CONFIG.name}`;
}

const ALLOWED_IMAGE_PREFIXES = [
  "https://cdn.iuno.lol/",
  "https://cdn.discordapp.com/",
];

export function isAllowedOgImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return ALLOWED_IMAGE_PREFIXES.some((p) => url.startsWith(p));
}

type OgInputs = {
  embedBackgroundUrl?: string | null;
  embedIconUrl?: string | null;
  displayName?: string | null;
};

export function ogImageVersion(inputs: OgInputs): string {
  return createHash("sha256")
    .update(
      [inputs.embedBackgroundUrl ?? "", inputs.embedIconUrl ?? "", inputs.displayName ?? ""].join("|"),
    )
    .digest("hex")
    .slice(0, 12);
}

export function buildOgImagePath(username: string, inputs: OgInputs): string {
  return `/api/og/${encodeURIComponent(username)}?v=${ogImageVersion(inputs)}`;
}

export function buildOgImageUrl(username: string, inputs: OgInputs): string {
  return `${SITE_CONFIG.url}${buildOgImagePath(username, inputs)}`;
}
