import type { FullUser } from "@/lib/features/users/db";
import {
  PREMIUM_BACKGROUND_EFFECTS,
  PREMIUM_BORDER_EFFECTS,
  PREMIUM_CARD_EFFECTS,
  PREMIUM_CARD_TRANSITIONS,
  PREMIUM_TEXT_EFFECTS,
  PREMIUM_CURSOR_TRAILS,
  PREMIUM_CLICK_EFFECTS,
  PREMIUM_CLICK_SOUNDS,
  PREMIUM_ENTRY_TRANSITIONS,
  isPremiumOption,
} from "@/lib/premium";
import { animatedBackgroundId, isPremiumBackgroundId } from "@/lib/animated-background";

export const TEMPLATE_STYLE_KEYS = [
  "avatarUrl",
  "bannerImageUrl",
  "bannerBlend",
  "bannerBackgroundShuffle",
  "bannerBackgroundAutoplay",
  "bannerBackgroundSound",
  "embedBackgroundUrl",
  "embedIconUrl",
  "faviconUrl",
  "cursorUrl",
  "musicTracks",
  "musicPlayerArtBg",
  "profilePreset",
  "wrapInCard",
  "contentWidth",
  "contentAlignment",
  "avatarPlacement",
  "avatarShape",
  "joinDatePlacement",
  "locationPlacement",
  "occupationPlacement",
  "uidPlacement",
  "viewsPlacement",
  "feedbackPlacement",
  "profileStructure",
  "aboutSectionEnabled",
  "aboutSectionTitle",
  "aboutSectionDescription",
  "widgetsSectionEnabled",
  "linksSectionEnabled",
  "linksSectionTitle",
  "linksSectionDescription",
  "linksSectionPosition",
  "avatarDecorationUrl",
  "avatarDecorationHue",
  "profileEffectUrl",
  "profileEffectHue",
  "pageBgColor",
  "profileBgColor",
  "profileBgOpacity",
  "profileBorderColor",
  "profileBorderOpacity",
  "profileBorderWidth",
  "profileBorderRadius",
  "profileCardBlur",
  "profileBackgroundBlur",
  "profileShadowColor",
  "profileShadowOpacity",
  "profileOpacity",
  "backgroundEffect",
  "backgroundEffectIntensity",
  "backgroundEffectColor",
  "backgroundEffectAboveContainer",
  "effectConfig",
  "borderEffect",
  "borderEffectColor",
  "cardEffect",
  "cardTransition",
  "usernameEffect",
  "usernameGlowEnabled",
  "descriptionEffect",
  "descriptionGlowEnabled",
  "cursorTrail",
  "cursorTrailColor",
  "clickEffect",
  "clickSound",
  "entryTransition",
  "enterScreenEnabled",
  "enterScreenFont",
  "enterScreenFontSize",
  "enterScreenFontWeight",
  "enterScreenLetterSpacing",
  "enterScreenColor",
  "enterScreenOpacity",
  "enterScreenBlur",
  "enterScreenBlurColor",
  "badgeGlowEnabled",
  "badgeGlowStrength",
  "badgeSize",
  "badgeMonochromeEnabled",
  "badgeMonochromeColor",
  "badgeContainerStyle",
  "badgeSpacing",
  "badgeScrollStyle",
  "badgeScrollSpeed",
  "badgeVisibleCount",
  "badgeShimmerEnabled",
  "usernameFont",
  "usernameFontSize",
  "usernameFontWeight",
  "usernameLetterSpacing",
  "usernameColor",
  "usernameMarginBottom",
  "bioFont",
  "bioFontSize",
  "bioFontWeight",
  "bioLetterSpacing",
  "bioColor",
  "otherFont",
  "otherFontSize",
  "otherFontWeight",
  "otherLetterSpacing",
  "otherColor",
  "highlightFont",
  "highlightFontSize",
  "highlightFontWeight",
  "highlightLetterSpacing",
  "sectionTitleFont",
  "sectionTitleFontSize",
  "sectionTitleFontWeight",
  "sectionTitleLetterSpacing",
  "sectionDescFont",
  "sectionDescFontSize",
  "sectionDescFontWeight",
  "sectionDescLetterSpacing",
  "sectionTitleColor",
  "sectionDescColor",
  "musicPrimaryFont",
  "musicPrimaryFontSize",
  "musicPrimaryFontWeight",
  "musicPrimaryLetterSpacing",
  "musicSecondaryFont",
  "musicSecondaryFontSize",
  "musicSecondaryFontWeight",
  "musicSecondaryLetterSpacing",
  "musicLyricsFont",
  "musicLyricsFontSize",
  "musicLyricsFontWeight",
  "musicLyricsLetterSpacing",
  "musicPrimaryColor",
  "musicSecondaryColor",
  "musicLyricsColor",
  "widgetPrimaryTextColor",
  "widgetSecondaryTextColor",
  "widgetBorderColor",
  "widgetBorderOpacity",
  "widgetBorderWidth",
  "widgetBorderRadius",
  "widgetFont",
  "widgetFontSize",
  "widgetFontWeight",
  "widgetLetterSpacing",
  "widgetSecondaryFont",
  "widgetSecondaryFontSize",
  "widgetSecondaryFontWeight",
  "widgetSecondaryLetterSpacing",
  "linksFont",
  "linksFontSize",
  "linksFontWeight",
  "linksLetterSpacing",
  "linksAlignment",
  "linksSocialBackground",
  "linksBorderRadius",
  "linksIconSize",
  "linksIconGap",
  "linksIconColor",
  "linksTextColor",
  "musicPlayerStyle",
  "musicPlayerArtBg",
  "musicPlayerVolume",
  "musicPlayerDefaultVolume",
  "musicPlayerShuffle",
  "musicCardColor",
  "musicCardOpacity",
  "joinDateEnabled",
  "joinDateFormat",
  "viewsEnabled",
  "viewsAnimationEnabled",
  "viewsAnimationDuration",
  "viewsAnimationStyle",
  "showUidTooltip",
  "showLocationTooltip",
  "showOccupationTooltip",
  "showLikesTooltip",
  "showDislikesTooltip",
  "showJoinDateTooltip",
  "showViewsTooltip",
  "showLinksTooltip",
  "showBadgesTooltip",
  "iconsGlowEnabled",
  "joinDateIconGlow",
  "locationIconGlow",
  "occupationIconGlow",
  "uidIconGlow",
  "viewsIconGlow",
  "feedbackIconGlow",
] as const;

export type TemplateStyleKey = (typeof TEMPLATE_STYLE_KEYS)[number];
export type TemplateConfig = Partial<Record<TemplateStyleKey, unknown>> & {
  backgrounds?: string[];
};

export const TEMPLATE_BACKGROUNDS_KEY = "backgrounds";

const KEY_SET = new Set<string>([...TEMPLATE_STYLE_KEYS, TEMPLATE_BACKGROUNDS_KEY]);

export function pickTemplateConfig(user: FullUser): TemplateConfig {
  const out: TemplateConfig = {};
  for (const k of TEMPLATE_STYLE_KEYS) {
    const v = (user as unknown as Record<string, unknown>)[k];
    if (v !== undefined) out[k] = v;
  }
  if ((user as unknown as Record<string, unknown>).effectConfig !== undefined) {
    out.effectConfig = (user as unknown as Record<string, unknown>).effectConfig;
  }
  return out;
}

export function sanitizeTemplateConfig(input: Record<string, unknown>): TemplateConfig {
  const out: TemplateConfig = {};
  for (const [k, v] of Object.entries(input)) {
    if (!KEY_SET.has(k)) continue;
    if (k === TEMPLATE_BACKGROUNDS_KEY) {
      if (Array.isArray(v)) {
        const urls = v.filter((u): u is string => typeof u === "string" && u.length > 0).slice(0, 20);
        if (urls.length > 0) out.backgrounds = urls;
      }
      continue;
    }
    (out as Record<string, unknown>)[k] = v;
  }
  try {
    if (JSON.stringify(out).length > 120 * 1024) return {};
  } catch {
    return {};
  }
  return out;
}

export function isTemplateConfigEmpty(c: TemplateConfig): boolean {
  return Object.keys(c).length === 0;
}

const PREMIUM_VIEWS_ANIMATIONS = new Set(["digitalroll", "slotroll", "speeding"]);

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

export function templateRequiresPremium(c: Record<string, unknown>): boolean {
  const opt = (key: string, set: ReadonlySet<string>) => {
    const v = c[key];
    return typeof v === "string" && isPremiumOption(set, v.trim());
  };

  if (opt("backgroundEffect", PREMIUM_BACKGROUND_EFFECTS)) return true;
  if (opt("borderEffect", PREMIUM_BORDER_EFFECTS)) return true;
  if (opt("cardEffect", PREMIUM_CARD_EFFECTS)) return true;
  if (opt("cardTransition", PREMIUM_CARD_TRANSITIONS)) return true;
  if (opt("usernameEffect", PREMIUM_TEXT_EFFECTS)) return true;
  if (opt("descriptionEffect", PREMIUM_TEXT_EFFECTS)) return true;
  if (opt("cursorTrail", PREMIUM_CURSOR_TRAILS)) return true;
  if (opt("clickEffect", PREMIUM_CLICK_EFFECTS)) return true;
  if (opt("clickSound", PREMIUM_CLICK_SOUNDS)) return true;
  if (opt("entryTransition", PREMIUM_ENTRY_TRANSITIONS)) return true;

  const viewsAnim = c["viewsAnimationStyle"];
  if (typeof viewsAnim === "string" && PREMIUM_VIEWS_ANIMATIONS.has(viewsAnim.trim())) return true;

  if (isNonEmptyString(c["faviconUrl"])) return true;
  if (isNonEmptyString(c["cursorUrl"])) return true;
  if (isNonEmptyString(c["tabTitle"])) return true;
  if (c["tabTitleAnimated"] === true) return true;

  const backgrounds = c["backgrounds"];
  if (Array.isArray(backgrounds)) {
    if (backgrounds.length > 1) return true;
    for (const url of backgrounds) {
      if (typeof url !== "string") continue;
      const pid = animatedBackgroundId(url);
      if (pid && isPremiumBackgroundId(pid)) return true;
    }
  }

  const widgets = c["widgets"];
  if (Array.isArray(widgets) && widgets.length > 3) return true;

  const tracks = c["musicTracks"];
  if (Array.isArray(tracks) && tracks.length > 1) return true;

  return false;
}
