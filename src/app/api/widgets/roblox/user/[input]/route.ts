import { NextRequest, NextResponse } from "next/server";
import { withWidgetCache, widgetCacheKey } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import {
  type RobloxUserData,
  cleanRobloxInput,
  isRobloxId,
  isValidRobloxInput,
} from "@/lib/roblox";

/**
 * Public Roblox player lookup.
 *
 * Roblox has no single endpoint carrying everything the card shows, so this
 * merges four public ones:
 *
 *   - `users.roblox.com/v1/usernames/users` resolves a username to an ID
 *     (skipped when the widget already stores an ID)
 *   - `users.roblox.com/v1/users/<id>` gives name, display name, verified badge
 *   - `friends.roblox.com/v1/users/<id>/followers/count`
 *   - `friends.roblox.com/v1/users/<id>/friends/count`
 *   - `thumbnails.roblox.com/v1/users/avatar-headshot` gives the avatar
 *
 * The user record is required; the counts and avatar are not. Roblox rate-limits
 * the friends and thumbnails hosts independently of the users host, so a widget
 * that could not read a count still renders with the rest of the profile rather
 * than failing whole. The merged result is cached in Redis under the shared
 * widget window, so this fan-out runs once per player per window no matter how
 * many profiles show that player.
 */

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

/** Reads `{ count: n }` from a Roblox counter endpoint, or null on any failure. */
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
    // A missing count is not fatal — the card omits that stat.
    return null;
  }
}

/** Resolves a username to a numeric Roblox ID, or null when no account matches. */
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

/** Reads the avatar headshot URL for `userId`, or null when unavailable. */
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
    // Roblox renders thumbnails lazily; a pending one has no usable URL yet.
    if (entry?.state !== "Completed" || !entry.imageUrl) return null;
    return entry.imageUrl;
  } catch {
    return null;
  }
}

/**
 * Fetches and merges one public Roblox player profile.
 *
 * `input` is either a numeric ID or a username. Returns null when no account
 * matches, or when the core user record could not be read.
 */
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

    // The remaining three are independent and all optional, so they run together
    // and each falls back to null on its own rather than failing the lookup.
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
  _req: NextRequest,
  { params }: { params: Promise<{ input: string }> }
) {
  try {
    const { input } = await params;
    const cleanInput = cleanRobloxInput(input);

    if (!isValidRobloxInput(cleanInput)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Roblox user ID or username" },
        { status: 400 }
      );
    }

    // Usernames are case-insensitive on Roblox, so the cache key is lowercased
    // via `widgetCacheKey` — otherwise "Builderman" and "builderman" would each
    // hold their own entry for the same account.
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

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[Roblox Profile API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
