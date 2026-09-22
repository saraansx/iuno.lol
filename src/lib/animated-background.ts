export const ANIMATED_BACKGROUND_PREFIX = "animated:";

export const ANIMATED_BACKGROUNDS = [
  { id: "aurora", name: "Aurora" },
  { id: "ember", name: "Ember Rise" },
  { id: "beams", name: "Neon Beams" },
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
  return VALID_IDS.has(id) ? (id as AnimatedBackgroundId) : null;
}

export function isAnimatedBackgroundUrl(url: string | null | undefined): boolean {
  return animatedBackgroundId(url) !== null;
}

/** Full stored value for a preset, e.g. `animated:aurora`. */
export function animatedBackgroundUrl(id: AnimatedBackgroundId): string {
  return `${ANIMATED_BACKGROUND_PREFIX}${id}`;
}
