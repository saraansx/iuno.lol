/**
 * Premium base module (client-safe, no DB imports).
 * Gating rule lives here so every feature checks one place.
 */

export interface PremiumStatus {
  isPremium?: boolean | null;
  premiumExpiresAt?: Date | string | null;
}

/** True when the user's premium is active (honours expiry). */
export function isPremiumActive(user: PremiumStatus | null | undefined): boolean {
  if (!user?.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  return new Date(user.premiumExpiresAt).getTime() > Date.now();
}

/** Throw for server actions when a feature needs premium. */
export function requirePremium(user: PremiumStatus | null | undefined): void {
  if (!isPremiumActive(user)) {
    throw new Error("This feature needs Premium.");
  }
}

/**
 * Background effects below "dither" in the effects section are premium-only.
 * Single source of truth for both the dashboard dropdown and server actions.
 */
export const PREMIUM_BACKGROUND_EFFECTS: ReadonlySet<string> = new Set([
  "fireflies",
  "lightning",
  "meteors",
  "lightrays",
  "lighttunnel",
  "aurora",
]);

/** True when the given background effect id needs premium. */
export function isPremiumBackgroundEffect(effectId: string | null | undefined): boolean {
  if (!effectId || effectId === "none") return false;
  return PREMIUM_BACKGROUND_EFFECTS.has(effectId);
}

/** Electric Border only; Shine Border stays free. */
export const PREMIUM_BORDER_EFFECTS: ReadonlySet<string> = new Set(["electric-border"]);

/** Card Effect: skew + magnet free, rest premium. */
export const PREMIUM_CARD_EFFECTS: ReadonlySet<string> = new Set(["zoom", "elastic", "dive"]);

/** Card Transition: up to slide-down free, rest premium. */
export const PREMIUM_CARD_TRANSITIONS: ReadonlySet<string> = new Set(["zoom-in", "flip", "bounce", "blur"]);

/** Username + Description effects: up to typewriter free, everything below premium. */
export const PREMIUM_TEXT_EFFECTS: ReadonlySet<string> = new Set([
  "sakura",
  "blur",
  "flicker",
  "flames",
  "shimmer",
  "glitch",
  "distort",
]);

/** Click Effect: up to confetti free, rest premium. */
export const PREMIUM_CLICK_EFFECTS: ReadonlySet<string> = new Set([
  "bubbles",
  "snow",
  "ember",
  "petals",
  "rings",
  "fireworks",
]);

/** Click Sound: up to sparkle chime free, rest premium. */
export const PREMIUM_CLICK_SOUNDS: ReadonlySet<string> = new Set([
  "snap",
  "ding",
  "magic",
  "coin",
  "laser",
  "thock",
]);

/** Cursor Trail: up to oneko free, rest premium. */
export const PREMIUM_CURSOR_TRAILS: ReadonlySet<string> = new Set(["glow", "stardust", "snowflake", "bubbles"]);

/** Entry Transition: up to fade blackout free, rest premium. */
export const PREMIUM_ENTRY_TRANSITIONS: ReadonlySet<string> = new Set(["fade", "curtain", "iris", "blur-dissolve"]);

/** Generic check: true when a non-"none" id is in a premium set. */
export function isPremiumOption(set: ReadonlySet<string>, id: string | null | undefined): boolean {
  if (!id || id === "none") return false;
  return set.has(id);
}
