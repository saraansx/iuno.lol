import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import { WIDGET_EDGE_CACHE, widgetCacheKey, withWidgetCache } from "@/lib/widget-cache";

async function fetchViaWorkerProxy(username: string): Promise<InstagramUserData | null> {
  const proxyBase = (process.env.INSTAGRAM_PROXY_URL || "").replace(/\/$/, "");
  if (!proxyBase) {
    console.error("[Instagram] INSTAGRAM_PROXY_URL is not configured");
    return null;
  }

  const res = await fetch(`${proxyBase}/${encodeURIComponent(username)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    console.warn(`[Instagram] proxy answered ${res.status} for "${username}"`);
    return null;
  }

  const json = await res.json();
  if (json.ok && json.data?.username) {
    const d = json.data;
    return {
      username: d.username,
      fullName: d.fullName ?? d.username,
      profilePicUrl: `${proxyBase}/i/${encodeURIComponent(d.username)}`,
      isVerified: Boolean(d.isVerified),
      postsCount: Number(d.postsCount || 0),
      followersCount: Number(d.followersCount || 0),
      followingCount: Number(d.followingCount || 0),
    };
  }

  console.warn(
    `[Instagram] proxy returned no profile for "${username}"`,
    json?.error || ""
  );
  return null;
}

export async function fetchInstagramUserData(
  rawUsername: string
): Promise<InstagramUserData | null> {
  const username = cleanInstagramUsername(rawUsername).toLowerCase();
  if (!username || !/^[a-zA-Z0-9_.-]{1,30}$/.test(username)) {
    return null;
  }

  return withWidgetCache(widgetCacheKey("instagram", username), () =>
    fetchViaWorkerProxy(username)
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "instagram_user");
    if (limited) return limited;

    const { username } = await params;
    const cleanUsername = cleanInstagramUsername(username);

    if (!cleanUsername || !/^[a-zA-Z0-9_.-]{1,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Invalid Instagram username" },
        { status: 400 }
      );
    }

    const data = await fetchInstagramUserData(cleanUsername);

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Profile not found or temporarily unavailable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    }, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[Instagram Profile API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
