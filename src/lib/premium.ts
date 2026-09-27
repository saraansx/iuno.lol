
export interface PremiumStatus {
  isPremium?: boolean | null;
  premiumExpiresAt?: Date | string | null;
}

export function isPremiumActive(user: PremiumStatus | null | undefined): boolean {
  if (!user?.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  return new Date(user.premiumExpiresAt).getTime() > Date.now();
}

export function requirePremium(user: PremiumStatus | null | undefined): void {
  if (!isPremiumActive(user)) {
    throw new Error("This feature needs Premium.");
  }
}

export const PREMIUM_BACKGROUND_EFFECTS: ReadonlySet<string> = new Set([
  "fireflies",
  "lightning",
  "meteors",
  "lightrays",
  "lighttunnel",
  "aurora",
]);

export function isPremiumBackgroundEffect(effectId: string | null | undefined): boolean {
  if (!effectId || effectId === "none") return false;
  return PREMIUM_BACKGROUND_EFFECTS.has(effectId);
}

export const PREMIUM_BORDER_EFFECTS: ReadonlySet<string> = new Set(["electric-border"]);

export const PREMIUM_CARD_EFFECTS: ReadonlySet<string> = new Set(["zoom", "elastic", "dive"]);

export const PREMIUM_CARD_TRANSITIONS: ReadonlySet<string> = new Set(["zoom-in", "flip", "bounce", "blur"]);

export const PREMIUM_TEXT_EFFECTS: ReadonlySet<string> = new Set([
  "sakura",
  "blur",
  "flicker",
  "flames",
  "shimmer",
  "glitch",
  "distort",
]);

export const PREMIUM_CLICK_EFFECTS: ReadonlySet<string> = new Set([
  "bubbles",
  "snow",
  "ember",
  "petals",
  "rings",
  "fireworks",
]);

export const PREMIUM_CLICK_SOUNDS: ReadonlySet<string> = new Set([
  "snap",
  "ding",
  "magic",
  "coin",
  "laser",
  "thock",
]);

export const PREMIUM_CURSOR_TRAILS: ReadonlySet<string> = new Set(["glow", "stardust", "snowflake", "bubbles"]);

export const PREMIUM_ENTRY_TRANSITIONS: ReadonlySet<string> = new Set(["fade", "curtain", "iris", "blur-dissolve"]);

export function isPremiumOption(set: ReadonlySet<string>, id: string | null | undefined): boolean {
  if (!id || id === "none") return false;
  return set.has(id);
}
