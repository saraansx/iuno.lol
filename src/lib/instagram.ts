export interface InstagramUserData {
  username: string;
  fullName: string;
  biography: string;
  profilePicUrl: string;
  profilePicUrlHd?: string;
  isVerified: boolean;
  isPrivate: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  externalUrl?: string | null;
}

export function cleanInstagramUsername(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .replace(/[?#].*$/, "")
    .slice(0, 30);
}

export function formatInstagramNumber(num: number): string {
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
