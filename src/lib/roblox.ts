
export interface RobloxUserData {
  id: string;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
  avatarUrl: string | null;
  followersCount: number | null;
  friendsCount: number | null;
}

const ROBLOX_USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const ROBLOX_ID_PATTERN = /^[1-9][0-9]{0,18}$/;

export function cleanRobloxInput(input: string | null | undefined): string {
  const raw = (input || "").trim();
  if (!raw) return "";

  const legacyId = /[?&]id=([0-9]+)/i.exec(raw);
  if (legacyId) return legacyId[1];

  const stripped = raw
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.|web\.|m\.)?roblox\.com\//i, "");

  const userPath = /^users\/([0-9]+)/i.exec(stripped);
  if (userPath) return userPath[1];

  return stripped.replace(/^@/, "").split(/[/?#]/)[0].trim();
}

export function isRobloxId(input: string): boolean {
  return ROBLOX_ID_PATTERN.test(input);
}

export function isValidRobloxInput(input: string): boolean {
  return isRobloxId(input) || ROBLOX_USERNAME_PATTERN.test(input);
}

export { formatNumber } from "@/lib/utils";
