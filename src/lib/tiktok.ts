export interface TikTokUserData {
  username: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  heartCount: number;
  videoCount: number;
}

export function cleanTikTokUsername(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .replace(/[?#].*$/, "")
    .slice(0, 24);
}

export function formatTikTokNumber(num: number): string {
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
  return num.toLocaleString();
}
