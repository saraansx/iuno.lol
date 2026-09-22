type NumericRange = { min: number; max: number; int?: boolean };

const NUMERIC_RANGES: Record<string, NumericRange> = {
  avatarDecorationHue: { min: 0, max: 360, int: true },
  profileEffectHue: { min: 0, max: 360, int: true },

  profileBgOpacity: { min: 0, max: 100 },
  profileBorderOpacity: { min: 0, max: 100 },
  profileBorderWidth: { min: 0, max: 20 },
  profileBorderRadius: { min: 0, max: 100 },
  profileCardBlur: { min: 0, max: 100 },
  profileBackgroundBlur: { min: 0, max: 100 },
  profileShadowOpacity: { min: 0, max: 100 },
  profileOpacity: { min: 10, max: 100 },
  contentWidth: { min: 480, max: 1000, int: true },

  usernameFontSize: { min: 10, max: 64, int: true },
  usernameFontWeight: { min: 100, max: 900, int: true },
  usernameLetterSpacing: { min: -10, max: 50 },
  usernameMarginBottom: { min: 0, max: 200, int: true },
  bioFontSize: { min: 10, max: 64, int: true },
  bioFontWeight: { min: 100, max: 900, int: true },
  bioLetterSpacing: { min: -10, max: 50 },
  otherFontSize: { min: 10, max: 64, int: true },
  otherFontWeight: { min: 100, max: 900, int: true },
  otherLetterSpacing: { min: -10, max: 50 },
  highlightFontSize: { min: 10, max: 64, int: true },
  highlightFontWeight: { min: 100, max: 900, int: true },
  highlightLetterSpacing: { min: -10, max: 50 },
  sectionTitleFontSize: { min: 10, max: 64, int: true },
  sectionTitleFontWeight: { min: 100, max: 900, int: true },
  sectionTitleLetterSpacing: { min: -10, max: 50 },
  sectionDescFontSize: { min: 10, max: 64 },
  sectionDescFontWeight: { min: 100, max: 900, int: true },
  sectionDescLetterSpacing: { min: -10, max: 50 },
  musicPrimaryFontSize: { min: 10, max: 64, int: true },
  musicPrimaryFontWeight: { min: 100, max: 900, int: true },
  musicPrimaryLetterSpacing: { min: -10, max: 50 },
  musicSecondaryFontSize: { min: 10, max: 64 },
  musicSecondaryFontWeight: { min: 100, max: 900, int: true },
  musicSecondaryLetterSpacing: { min: -10, max: 50 },
  musicLyricsFontSize: { min: 10, max: 64, int: true },
  musicLyricsFontWeight: { min: 100, max: 900, int: true },
  musicLyricsLetterSpacing: { min: -10, max: 50 },
  widgetFontSize: { min: 10, max: 64 },
  widgetFontWeight: { min: 100, max: 900, int: true },
  widgetLetterSpacing: { min: -10, max: 50 },

  viewsAnimationDuration: { min: 0, max: 5000, int: true },

  backgroundEffectIntensity: { min: 0, max: 100, int: true },
  auroraSpeed: { min: 0, max: 3 },
  auroraBlend: { min: 0, max: 1 },
  badgeGlowStrength: { min: 0, max: 100, int: true },
  badgeScrollSpeed: { min: 1, max: 100, int: true },
  badgeVisibleCount: { min: 1, max: 20, int: true },
  badgeSize: { min: 12, max: 32, int: true },
  badgeSpacing: { min: 0, max: 24, int: true },
  enterScreenFontSize: { min: 10, max: 48, int: true },
  enterScreenFontWeight: { min: 100, max: 900, int: true },
  enterScreenLetterSpacing: { min: -5, max: 20 },
  enterScreenOpacity: { min: 10, max: 100 },
  enterScreenBlur: { min: 0, max: 40 },

  widgetBorderWidth: { min: 0, max: 20 },
  widgetBorderRadius: { min: 0, max: 100 },
  widgetBorderOpacity: { min: 0, max: 100, int: true },
};

const COLOR_FIELDS = new Set([
  "pageBgColor",
  "profileBgColor",
  "profileBorderColor",
  "profileShadowColor",
  "usernameColor",
  "bioColor",
  "otherColor",
  "widgetPrimaryTextColor",
  "widgetSecondaryTextColor",
  "widgetBorderColor",
  "backgroundEffectColor",
  "auroraColor1",
  "auroraColor2",
  "auroraColor3",
  "borderEffectColor",
  "cursorTrailColor",
  "enterScreenColor",
  "enterScreenBlurColor",
  "sectionTitleColor",
  "sectionDescColor",
  "badgeMonochromeColor",
  "musicPrimaryColor",
  "musicSecondaryColor",
  "musicLyricsColor",
]);

const HEX_COLOR = /^#[0-9a-f]{6}$/;

const STRING_ENUMS: Record<string, string[]> = {
  viewsAnimationStyle: ["none", "countup", "digitalroll", "slotroll", "speeding"],
};

export function sanitizeProfileSettings(setData: Record<string, unknown>) {
  for (const key of Object.keys(setData)) {
    const value = setData[key];
    if (value === null) continue;

    const range = NUMERIC_RANGES[key];
    if (range) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        delete setData[key];
        continue;
      }
      const clamped = Math.min(range.max, Math.max(range.min, value));
      setData[key] = range.int ? Math.round(clamped) : clamped;
      continue;
    }

    const enumValues = STRING_ENUMS[key];
    if (enumValues) {
      if (typeof value !== "string" || !enumValues.includes(value)) {
        delete setData[key];
        continue;
      }
      setData[key] = value;
      continue;
    }

    if (COLOR_FIELDS.has(key)) {
      if (typeof value !== "string") {
        delete setData[key];
        continue;
      }
      const hex = value.trim().toLowerCase();
      if (!HEX_COLOR.test(hex)) {
        delete setData[key];
        continue;
      }
      setData[key] = hex;
    }
  }

  return setData;
}
