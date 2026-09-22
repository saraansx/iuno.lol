export const ANIMATED_BACKGROUND_PREFIX = "animated:";

export const ANIMATED_BACKGROUNDS = [
  { id: "aurora", name: "Aurora" },
  { id: "darkveil", name: "Dark Veil" },
  { id: "pixelblast", name: "Pixel Blast" },
  { id: "mist", name: "Mist Flow" },
  { id: "waves", name: "Wave Motion" },
  { id: "pulsegrid", name: "Pulse Grid" },
] as const;

export type AnimatedBackgroundId = (typeof ANIMATED_BACKGROUNDS)[number]["id"];

const VALID_IDS = new Set<string>(ANIMATED_BACKGROUNDS.map((b) => b.id));

/** `animated:aurora` -> `aurora`, or null when not a known animated background. */
export function animatedBackgroundId(url: string | null | undefined): AnimatedBackgroundId | null {
  if (!url || !url.startsWith(ANIMATED_BACKGROUND_PREFIX)) return null;
  const id = url.slice(ANIMATED_BACKGROUND_PREFIX.length).trim().toLowerCase();
  // Legacy aliases: Ember Rise -> Dark Veil, Neon Beams -> Pixel Blast.
  if (id === "ember") return "darkveil";
  if (id === "beams") return "pixelblast";
  return VALID_IDS.has(id) ? (id as AnimatedBackgroundId) : null;
}

export function isAnimatedBackgroundUrl(url: string | null | undefined): boolean {
  return animatedBackgroundId(url) !== null;
}

/** Full stored value for a preset, e.g. `animated:aurora`. */
export function animatedBackgroundUrl(id: AnimatedBackgroundId): string {
  return `${ANIMATED_BACKGROUND_PREFIX}${id}`;
}

/** Default Aurora (animated preset) settings. */
export const AURORA_DEFAULTS = {
  color1: "#7cff67",
  color2: "#b497cf",
  color3: "#5227ff",
  speed: 1,
  blend: 0.5,
} as const;

/** Default Dark Veil (animated preset) settings. */
export const DARKVEIL_DEFAULTS = {
  speed: 0.5,
  hueShift: 0,
  noiseIntensity: 0,
  scanlineFrequency: 0,
  scanlineIntensity: 0,
  warpAmount: 0,
} as const;

/** Default Pixel Blast (animated preset) settings. */
export const PIXELBLAST_DEFAULTS = {
  color: "#b497cf",
  variant: "square",
  pixelSize: 4,
  patternScale: 2,
  patternDensity: 1,
  pixelJitter: 0,
  speed: 0.5,
  edgeFade: 0.25,
  ripples: true,
  liquid: false,
} as const;
