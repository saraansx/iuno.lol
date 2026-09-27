
export type EffectConfig = {
  auroraColor1: string | null;
  auroraColor2: string | null;
  auroraColor3: string | null;
  auroraSpeed: number;
  auroraBlend: number;
  darkveilSpeed: number;
  darkveilHueShift: number;
  darkveilNoise: number;
  darkveilScanFreq: number;
  darkveilScan: number;
  darkveilWarp: number;
  pixelblastColor: string | null;
  pixelblastVariant: string | null;
  pixelblastPixelSize: number;
  pixelblastPatternScale: number;
  pixelblastPatternDensity: number;
  pixelblastPixelJitter: number;
  pixelblastSpeed: number;
  pixelblastEdgeFade: number;
  pixelblastRipples: boolean;
  pixelblastLiquid: boolean;
  colorbendsColor: string | null;
  colorbendsRotation: number;
  colorbendsAutoRotate: number;
  colorbendsSpeed: number;
  colorbendsScale: number;
  colorbendsFrequency: number;
  colorbendsWarp: number;
  colorbendsMouse: number;
  colorbendsParallax: number;
  colorbendsNoise: number;
  colorbendsIterations: number;
  colorbendsIntensity: number;
  colorbendsBandWidth: number;
  liquidchromeColor: string | null;
  liquidchromeSpeed: number;
  liquidchromeAmplitude: number;
  liquidchromeInteractive: boolean;
  crtwarpColor: string | null;
  crtwarpBackground: string | null;
  crtwarpSpeed: number;
  crtwarpCurvature: number;
  crtwarpWaveAmount: number;
  crtwarpWaveDensity: number;
  crtwarpScanStrength: number;
  crtwarpScanDensity: number;
  crtwarpBloom: number;
  crtwarpBloomRadius: number;
  crtwarpNoise: number;
  crtwarpVignette: number;
  crtwarpBrightness: number;
  crtwarpRgbShift: number;
  crtwarpPixelSize: number;
  crtwarpRenderQuality: number;
  crtwarpFrameRate: number;
  crtwarpPointerWarp: boolean;
  crtwarpPointerStrength: number;
  crtwarpPaused: boolean;
};

export const EFFECT_DEFAULTS: EffectConfig = {
  auroraColor1: null,
  auroraColor2: null,
  auroraColor3: null,
  auroraSpeed: 1,
  auroraBlend: 0.5,
  darkveilSpeed: 0.5,
  darkveilHueShift: 0,
  darkveilNoise: 0,
  darkveilScanFreq: 0,
  darkveilScan: 0,
  darkveilWarp: 0,
  pixelblastColor: null,
  pixelblastVariant: null,
  pixelblastPixelSize: 4,
  pixelblastPatternScale: 2,
  pixelblastPatternDensity: 1,
  pixelblastPixelJitter: 0,
  pixelblastSpeed: 0.5,
  pixelblastEdgeFade: 0.25,
  pixelblastRipples: true,
  pixelblastLiquid: false,
  colorbendsColor: null,
  colorbendsRotation: 90,
  colorbendsAutoRotate: 0,
  colorbendsSpeed: 0.2,
  colorbendsScale: 1,
  colorbendsFrequency: 1,
  colorbendsWarp: 1,
  colorbendsMouse: 1,
  colorbendsParallax: 0.5,
  colorbendsNoise: 0.15,
  colorbendsIterations: 1,
  colorbendsIntensity: 1.5,
  colorbendsBandWidth: 6,
  liquidchromeColor: null,
  liquidchromeSpeed: 0.3,
  liquidchromeAmplitude: 0.3,
  liquidchromeInteractive: true,
  crtwarpColor: null,
  crtwarpBackground: null,
  crtwarpSpeed: 0.5,
  crtwarpCurvature: 0.25,
  crtwarpWaveAmount: 0.3,
  crtwarpWaveDensity: 2.5,
  crtwarpScanStrength: 0.25,
  crtwarpScanDensity: 200,
  crtwarpBloom: 1.5,
  crtwarpBloomRadius: 1,
  crtwarpNoise: 0.1,
  crtwarpVignette: 0,
  crtwarpBrightness: 1.25,
  crtwarpRgbShift: 0.015,
  crtwarpPixelSize: 1,
  crtwarpRenderQuality: 1.5,
  crtwarpFrameRate: 30,
  crtwarpPointerWarp: true,
  crtwarpPointerStrength: 0.5,
  crtwarpPaused: false,
};

export const EFFECT_CONFIG_KEYS = Object.keys(EFFECT_DEFAULTS) as (keyof EffectConfig)[];

const BOOLEAN_EFFECT_KEYS = new Set<string>([
  "pixelblastRipples",
  "pixelblastLiquid",
  "liquidchromeInteractive",
  "crtwarpPointerWarp",
  "crtwarpPaused",
]);

export function resolveEffectConfig(
  cfg: EffectConfig | null | undefined,
): EffectConfig {
  const out: EffectConfig = { ...EFFECT_DEFAULTS };
  if (!cfg) return out;
  for (const key of EFFECT_CONFIG_KEYS) {
    const val = (cfg as Record<string, unknown>)[key];
    if (val === undefined || val === null) continue;
    (out as Record<string, unknown>)[key] = BOOLEAN_EFFECT_KEYS.has(key) ? Boolean(val) : val;
  }
  return out;
}

export function pickEffectConfig(
  source: Record<string, unknown> | null | undefined,
): EffectConfig {
  const out: EffectConfig = { ...EFFECT_DEFAULTS };
  if (!source) return out;
  for (const key of EFFECT_CONFIG_KEYS) {
    const val = source[key];
    if (val === undefined || val === null) continue;
    (out as Record<string, unknown>)[key] = BOOLEAN_EFFECT_KEYS.has(key) ? Boolean(val) : val;
  }
  return out;
}

export function packEffectConfig(
  current: EffectConfig,
  changes: Partial<EffectConfig>,
): EffectConfig {
  return { ...current, ...changes };
}
