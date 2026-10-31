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
  darkveilSpeed: { min: 0, max: 2 },
  darkveilHueShift: { min: 0, max: 360 },
  darkveilNoise: { min: 0, max: 1 },
  darkveilScanFreq: { min: 0, max: 100 },
  darkveilScan: { min: 0, max: 1 },
  darkveilWarp: { min: 0, max: 10 },
  pixelblastPixelSize: { min: 1, max: 20 },
  pixelblastPatternScale: { min: 0.5, max: 10 },
  pixelblastPatternDensity: { min: 0, max: 3 },
  pixelblastPixelJitter: { min: 0, max: 2 },
  pixelblastSpeed: { min: 0, max: 2 },
  pixelblastEdgeFade: { min: 0, max: 1 },
  colorbendsRotation: { min: 0, max: 360 },
  colorbendsAutoRotate: { min: 0, max: 360 },
  colorbendsSpeed: { min: 0, max: 2 },
  colorbendsScale: { min: 0.1, max: 5 },
  colorbendsFrequency: { min: 0, max: 5 },
  colorbendsWarp: { min: 0, max: 5 },
  colorbendsMouse: { min: 0, max: 3 },
  colorbendsParallax: { min: 0, max: 2 },
  colorbendsNoise: { min: 0, max: 1 },
  colorbendsIterations: { min: 1, max: 5, int: true },
  colorbendsIntensity: { min: 0, max: 3 },
  colorbendsBandWidth: { min: 0, max: 20 },
  liquidchromeSpeed: { min: 0, max: 2 },
  liquidchromeAmplitude: { min: 0, max: 2 },
  crtwarpSpeed: { min: 0, max: 2 },
  crtwarpCurvature: { min: 0, max: 1 },
  crtwarpWaveAmount: { min: 0, max: 1 },
  crtwarpWaveDensity: { min: 0, max: 5 },
  crtwarpScanStrength: { min: 0, max: 1 },
  crtwarpScanDensity: { min: 0, max: 400 },
  crtwarpBloom: { min: 0, max: 3 },
  crtwarpBloomRadius: { min: 0, max: 3 },
  crtwarpNoise: { min: 0, max: 1 },
  crtwarpVignette: { min: 0, max: 1 },
  crtwarpBrightness: { min: 0, max: 2.5 },
  crtwarpRgbShift: { min: 0, max: 0.1 },
  crtwarpPixelSize: { min: 1, max: 4 },
  crtwarpRenderQuality: { min: 0.5, max: 2 },
  crtwarpFrameRate: { min: 1, max: 60 },
  crtwarpPointerStrength: { min: 0, max: 2 },
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
  musicPlayerDefaultVolume: { min: 0, max: 100, int: true },
  musicCardOpacity: { min: 0, max: 100, int: true },

  widgetBorderWidth: { min: 0, max: 20 },
  widgetBorderRadius: { min: 0, max: 100 },
  widgetBorderOpacity: { min: 0, max: 100, int: true },
  widgetCardOpacity: { min: 0, max: 100, int: true },
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
  "pixelblastColor",
  "colorbendsColor",
  "liquidchromeColor",
  "crtwarpColor",
  "crtwarpBackground",
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
  "musicCardColor",
  "widgetCardColor",
  "linksIconColor",
  "linksTextColor",
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
      const parts = value.split(",").map((part) => part.trim().toLowerCase());
      const maxParts = key === "borderEffectColor" ? 2 : 1;
      if (parts.length > maxParts || parts.some((part) => !HEX_COLOR.test(part))) {
        delete setData[key];
        continue;
      }
      setData[key] = parts.join(",");
    }
  }

  return setData;
}
