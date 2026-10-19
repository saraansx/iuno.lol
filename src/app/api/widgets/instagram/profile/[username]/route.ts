import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { nerveGet } from "@/lib/nerve";
import {
  type InstagramUserData,
  cleanInstagramUsername,
  isValidInstagramUsername,
} from "@/lib/instagram";

interface NerveInstagramProfile {
  username?: unknown;
  full_name?: unknown;
  avatar_url?: unknown;
  followers?: unknown;
  following?: unknown;
  post_count?: unknown;
  is_verified?: unknown;
  is_private?: unknown;
}

function toCount(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
}

function toAvatarUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.startsWith("https://") && trimmed.length <= 4096 ? trimmed : "";
}

async function fetchFromNerve(username: string): Promise<InstagramUserData | null> {
  const profile = await nerveGet<NerveInstagramProfile>("/v1/instagram/profile", {
    username,
  });
  if (!profile) return null;

  const resolvedUsername = cleanInstagramUsername(
    typeof profile.username === "string" ? profile.username : username
  );

  return {
    username: resolvedUsername || username,
    fullName:
      typeof profile.full_name === "string" ? profile.full_name.slice(0, 120).trim() : "",
    avatarUrl: toAvatarUrl(profile.avatar_url),
    isVerified: Boolean(profile.is_verified),
    followerCount: toCount(profile.followers),
    followingCount: toCount(profile.following),
    postCount: toCount(profile.post_count),
    isPrivate: Boolean(profile.is_private),
  };
}

export async function fetchInstagramUserData(
  rawUsername: string
): Promise<InstagramUserData | null> {
  const username = cleanInstagramUsername(rawUsername);
  if (!username || !isValidInstagramUsername(username)) return null;

  return withWidgetCache<InstagramUserData>(
    widgetCacheKey("instagram", "profile", username),
    () => fetchFromNerve(username)
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "instagram_profile");
    if (limited) return limited;

    const { username } = await params;
    const cleanUsername = cleanInstagramUsername(username);

    if (!cleanUsername || !isValidInstagramUsername(cleanUsername)) {
      return NextResponse.json({ error: "Invalid Instagram username" }, { status: 400 });
    }

    const data = await fetchInstagramUserData(cleanUsername);
    if (!data) {
      return NextResponse.json({ error: "Instagram profile not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data }, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[Instagram Profile API Error]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
