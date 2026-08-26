/**
 * Shared types and helpers for the Roblox player widget.
 *
 * Roblox splits what this widget shows across three public endpoints — the user
 * record, the follower count and the friend count — so the data route fans out
 * and merges them. Everything here is the part both the client and the server
 * need to agree on: the shape of the merged result, and how a pasted profile
 * link, numeric ID or username is reduced to something lookup-able.
 */

export interface RobloxUserData {
  /** Numeric Roblox user ID, as a string so it survives JSON round-trips intact. */
  id: string;
  /** Login name (`builderman`), used for nothing but display fallback. */
  name: string;
  /** Chosen display name, which may differ from `name`. */
  displayName: string;
  /** True when the account carries Roblox's verified checkmark. */
  hasVerifiedBadge: boolean;
  /** Absolute avatar headshot URL on Roblox's CDN, or null when unavailable. */
  avatarUrl: string | null;
  /** Follower count, or null when the count could not be read. */
  followersCount: number | null;
  /** Friend count, or null when the count could not be read. */
  friendsCount: number | null;
}

/**
 * Roblox usernames: 3-20 characters of letters, digits and underscores.
 *
 * Roblox additionally rejects names that start or end with an underscore, or
 * carry more than one, but those are signup-time rules — existing legacy
 * accounts violate them. Matching only the character set keeps a real account
 * from being refused by our own input validation.
 */
export const ROBLOX_USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

/** Roblox user IDs are positive integers; the cap keeps absurd input out. */
export const ROBLOX_ID_PATTERN = /^[1-9][0-9]{0,18}$/;

/**
 * Reduces anything a user might paste to either a numeric ID or a username.
 *
 * Accepts a bare username, a bare ID, or any `roblox.com` profile link —
 * `/users/156/profile`, `/users/156`, or the older `/User.aspx?ID=156` form.
 */
export function cleanRobloxInput(input: string | null | undefined): string {
  const raw = (input || "").trim();
  if (!raw) return "";

  // Legacy profile link carries the ID in a query parameter.
  const legacyId = /[?&]id=([0-9]+)/i.exec(raw);
  if (legacyId) return legacyId[1];

  const stripped = raw
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.|web\.|m\.)?roblox\.com\//i, "");

  // Modern profile link: users/<id>/profile
  const userPath = /^users\/([0-9]+)/i.exec(stripped);
  if (userPath) return userPath[1];

  return stripped.replace(/^@/, "").split(/[/?#]/)[0].trim();
}

/** True when `input` is a Roblox user ID rather than a username. */
export function isRobloxId(input: string): boolean {
  return ROBLOX_ID_PATTERN.test(input);
}

/** True when `input` can be looked up — either a valid ID or a valid username. */
export function isValidRobloxInput(input: string): boolean {
  return isRobloxId(input) || ROBLOX_USERNAME_PATTERN.test(input);
}

/**
 * Compacts large counts for the widget's single line of stats.
 *
 * Roblox follower counts reach eight digits, which would blow the card's width
 * out on its own, so anything over a thousand is abbreviated.
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}
