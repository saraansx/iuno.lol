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
