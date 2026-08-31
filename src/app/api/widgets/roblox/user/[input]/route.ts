import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import {
  type RobloxUserData,
  cleanRobloxInput,
  isRobloxId,
  isValidRobloxInput,
} from "@/lib/roblox";

const USERS_API = "https://users.roblox.com/v1";
const FRIENDS_API = "https://friends.roblox.com/v1";
const THUMBNAILS_API = "https://thumbnails.roblox.com/v1";

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "application/json",
} as const;

interface RobloxUserRecord {
  id?: number;
  name?: string;
  displayName?: string;
  hasVerifiedBadge?: boolean;
  isBanned?: boolean;
}

async function fetchCount(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      headers: REQUEST_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    const json = (await res.json()) as { count?: unknown };
    return typeof json.count === "number" ? json.count : null;
  } catch {
    return null;
  }
}

async function resolveUsernameToId(username: string): Promise<string | null> {
  try {
    const res = await fetch(`${USERS_API}/usernames/users`, {
      method: "POST",
      headers: { ...REQUEST_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    const json = (await res.json()) as { data?: Array<{ id?: number }> };
    const id = json.data?.[0]?.id;
    return typeof id === "number" ? String(id) : null;
  } catch {
    return null;
  }
}

async function fetchAvatarUrl(userId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${THUMBNAILS_API}/users/avatar-headshot?userIds=${encodeURIComponent(
        userId
      )}&size=420x420&format=Png&isCircular=false`,
      {
        headers: REQUEST_HEADERS,
        cache: "no-store",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    const json = (await res.json()) as {
      data?: Array<{ state?: string; imageUrl?: string }>;
    };
    const entry = json.data?.[0];
    if (entry?.state !== "Completed" || !entry.imageUrl) return null;
    return entry.imageUrl;
  } catch {
    return null;
  }
}

export async function fetchRobloxUserData(
  input: string
): Promise<RobloxUserData | null> {
  try {
    const userId = isRobloxId(input)
      ? input
      : await resolveUsernameToId(input);

    if (!userId) return null;

    const userRes = await fetch(`${USERS_API}/users/${encodeURIComponent(userId)}`, {
      headers: REQUEST_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!userRes.ok) {
      await userRes.body?.cancel();
      return null;
    }

    const user = (await userRes.json()) as RobloxUserRecord;
    if (typeof user.id !== "number" || !user.name) return null;

    const [avatarUrl, followersCount, friendsCount] = await Promise.all([
      fetchAvatarUrl(userId),
      fetchCount(`${FRIENDS_API}/users/${encodeURIComponent(userId)}/followers/count`),
      fetchCount(`${FRIENDS_API}/users/${encodeURIComponent(userId)}/friends/count`),
    ]);

    return {
      id: String(user.id),
      name: user.name,
      displayName: user.displayName || user.name,
      hasVerifiedBadge: Boolean(user.hasVerifiedBadge),
      avatarUrl,
      followersCount,
      friendsCount,
    };
  } catch (err) {
    console.error("[Roblox Profile Fetch Error]", err);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ input: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "roblox_user");
    if (limited) return limited;

    const { input } = await params;
    const cleanInput = cleanRobloxInput(input);

    if (!isValidRobloxInput(cleanInput)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Roblox user ID or username" },
        { status: 400 }
      );
    }

    const data = await withWidgetCache<RobloxUserData>(
      widgetCacheKey("roblox", "user", cleanInput),
      () => fetchRobloxUserData(cleanInput)
    );

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Roblox profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data }, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[Roblox Profile API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
