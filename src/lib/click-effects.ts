export const CLICK_EFFECTS = [
  { id: "none", name: "None" },
  { id: "spark", name: "Spark" },
  { id: "hearts", name: "Hearts" },
  { id: "sparkles", name: "Sparkles" },
  { id: "confetti", name: "Confetti" },
  { id: "bubbles", name: "Bubbles" },
  { id: "snow", name: "Snow" },
  { id: "ember", name: "Ember" },
  { id: "petals", name: "Petals" },
  { id: "rings", name: "Rings" },
  { id: "fireworks", name: "Fireworks" },
] as const;

export type ClickEffectId = (typeof CLICK_EFFECTS)[number]["id"];

export const CLICK_SOUNDS = [
  { id: "none", name: "None", url: null },
  { id: "click", name: "Click", url: "/sounds/click/click.wav" },
  { id: "pop", name: "Pop", url: "/sounds/click/pop.wav" },
  { id: "bubble", name: "Bubble", url: "/sounds/click/bubble.wav" },
  { id: "sparkle", name: "Sparkle chime", url: "/sounds/click/sparkle.wav" },
  { id: "snap", name: "Snap", url: "/sounds/click/snap.wav" },
  { id: "ding", name: "Ding", url: "/sounds/click/ding.wav" },
  { id: "magic", name: "Magic", url: "/sounds/click/magic.wav" },
  { id: "coin", name: "Coin", url: "/sounds/click/coin.wav" },
  { id: "laser", name: "Laser", url: "/sounds/click/laser.wav" },
  { id: "thock", name: "Thock", url: "/sounds/click/thock.wav" },
] as const;

export type ClickSoundId = (typeof CLICK_SOUNDS)[number]["id"];

const EFFECT_IDS = new Set<string>(CLICK_EFFECTS.map((e) => e.id));
const SOUND_URLS = new Map<string, string>(
  CLICK_SOUNDS.filter((s) => s.url).map((s) => [s.id, s.url as string])
);

export function isClickEffect(value: unknown): value is ClickEffectId {
  return typeof value === "string" && EFFECT_IDS.has(value);
}

export function clickSoundUrl(id: unknown): string | null {
  if (typeof id !== "string") return null;
  return SOUND_URLS.get(id) ?? null;
}
