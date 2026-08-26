/**
 * Shared types and helpers for the Telegram user widget.
 *
 * Telegram has no public read API for user profiles — the Bot API only reaches
 * chats the bot is a member of — so the widget reads the public `t.me/<username>`
 * preview page instead. Everything the card renders comes from that page's
 * OpenGraph tags, which is all Telegram exposes without an account.
 */

export interface TelegramUserData {
  /** Handle as it should be linked, without the leading `@`. */
  username: string;
  /** Profile display name from `og:title`. */
  displayName: string;
  /** Bio / description from `og:description`, empty when the profile has none. */
  bio: string;
  /** Absolute avatar URL on Telegram's CDN, or null when the profile has none. */
  avatarUrl: string | null;
}

/**
 * Telegram handles: 5-32 chars, letters/digits/underscore, must start with a
 * letter. Enforced identically on the client, the data route and the validate
 * route so a handle that passes one cannot be rejected by another.
 */
export const TELEGRAM_USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

/**
 * Reduces anything a user might paste to a bare handle.
 *
 * Accepts a plain handle, a `@handle`, or any `t.me` / `telegram.me` link form,
 * including one carrying a query string or trailing slash.
 */
export function cleanTelegramUsername(input: string | null | undefined): string {
  return (input || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(t|telegram)\.me\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim();
}

/** True when `username` is a syntactically valid Telegram handle. */
export function isValidTelegramUsername(username: string): boolean {
  return TELEGRAM_USERNAME_PATTERN.test(username);
}
