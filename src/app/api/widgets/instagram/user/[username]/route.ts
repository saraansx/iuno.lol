import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

const CACHE_TTL_SECONDS = 86400; // 24 hours

async function readCache(username: string): Promise<InstagramUserData | null> {
  try {
    const cached = await redis.get(`ig:profile:${username}`);
    if (cached) return JSON.parse(cached) as InstagramUserData;
  } catch {
    // cache is best-effort only
  }
  return null;
}

async function writeCache(username: string, data: InstagramUserData): Promise<void> {
  try {
    await redis.set(`ig:profile:${username}`, JSON.stringify(data), "EX", CACHE_TTL_SECONDS);
  } catch {
    // cache is best-effort only
  }
}

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
  if (!res.ok) return null;

  const json = await res.json();
  if (json.ok && json.data?.username) {
    // Replace the ~600-char CDN URL with the worker's short redirect URL
    // so the Redis cache entry stays small.
    json.data.profilePicUrl = `${proxyBase}/i/${encodeURIComponent(json.data.username)}`;
    return json.data as InstagramUserData;
  }
  return null;
}

export async function fetchInstagramUserData(
  rawUsername: string
): Promise<InstagramUserData | null> {
  const username = cleanInstagramUsername(rawUsername).toLowerCase();
  if (!username || !/^[a-zA-Z0-9_.-]{1,30}$/.test(username)) {
    return null;
  }

  const cached = await readCache(username);
  if (cached) return cached;

  const data = await fetchViaWorkerProxy(username);

  if (data) {
    await writeCache(username, data);
  }

  return data;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
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
    });
  } catch (err) {
    console.error("[Instagram Profile API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
