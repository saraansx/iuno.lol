
export interface TelegramUserData {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}

export const TELEGRAM_USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

export function cleanTelegramUsername(input: string | null | undefined): string {
  return (input || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(t|telegram)\.me\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim();
}

export function isValidTelegramUsername(username: string): boolean {
  return TELEGRAM_USERNAME_PATTERN.test(username);
}
