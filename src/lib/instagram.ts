export interface InstagramUserData {
  username: string;
  fullName: string;
  avatarUrl: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isPrivate: boolean;
}

const INSTAGRAM_HOST_RE = /^https?:\/\/(?:www\.)?instagram\.com\//i;

export function cleanInstagramUsername(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .replace(INSTAGRAM_HOST_RE, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim()
    .slice(0, 30);
}

export function isValidInstagramUsername(input: string): boolean {
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(input)) return false;
  if (input.startsWith(".") || input.endsWith(".")) return false;
  return !input.includes("..");
}

export function formatInstagramNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) return "0";
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}B`;
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}K`;
  }
  return String(Math.round(num));
}
