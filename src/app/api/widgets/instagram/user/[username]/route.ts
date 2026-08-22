import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";

const CACHE_TTL_SECONDS = 900;
const FETCH_BUDGET_MS = 22000;
const UA_WEB =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const UA_MOBILE =
  "Instagram 278.0.0.19.115 (iPhone14,2; iOS 16_4_1; en_US; en-US; scale=3.00; 1170x2532; 465427189)";
const IG_APP_ID = "936619743392459";

interface TopsearchUserObj {
  pk?: string;
  id?: string;
  pk_id?: string;
  username?: string;
  full_name?: string;
  profile_pic_url?: string;
  is_verified?: boolean;
  is_private?: boolean;
}

interface TopsearchItem {
  user?: TopsearchUserObj;
}

interface WebProfileInfoUser {
  username?: string;
  full_name?: string;
  biography?: string;
  profile_pic_url?: string;
  profile_pic_url_hd?: string;
  is_verified?: boolean;
  is_private?: boolean;
  external_url?: string | null;
  edge_followed_by?: { count?: number };
  edge_follow?: { count?: number };
  edge_owner_to_timeline_media?: { count?: number };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCsrfToken(cookie: string): string {
  const match = cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
  retryDelays: number[],
  deadline: number
): Promise<Response | null> {
  for (let attempt = 0; ; attempt++) {
    if (Date.now() >= deadline) return null;
    try {
      const res = await fetch(url, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
      const retryable = res.status === 429 || res.status >= 500;
      if (
        retryable &&
        attempt < retryDelays.length &&
        Date.now() + retryDelays[attempt] < deadline
      ) {
        await sleep(retryDelays[attempt] + Math.floor(Math.random() * 400));
        continue;
      }
      return res;
    } catch (err) {
      console.error(
        "[Instagram Fetch Error]",
        url,
        err instanceof Error ? err.message : String(err)
      );
      if (
        attempt < retryDelays.length &&
        Date.now() + retryDelays[attempt] < deadline
      ) {
        await sleep(retryDelays[attempt] + Math.floor(Math.random() * 400));
        continue;
      }
      return null;
    }
  }
}

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

async function fetchViaWebProfileInfo(
  username: string,
  cookie: string,
  deadline: number
): Promise<InstagramUserData | null> {
  const res = await fetchWithRetry(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    {
      "User-Agent": UA_WEB,
      "X-IG-App-ID": IG_APP_ID,
      "X-CSRFToken": getCsrfToken(cookie),
      Cookie: cookie,
      Accept: "*/*",
      Referer: `https://www.instagram.com/${encodeURIComponent(username)}/`,
    },
    8000,
    [1500, 3000],
    deadline
  );

  if (!res || !res.ok) return null;

  try {
    const json = (await res.json()) as { data?: { user?: WebProfileInfoUser } };
    const user = json?.data?.user;
    if (!user?.username) return null;
    return {
      username: user.username,
      fullName: user.full_name || user.username,
      biography: user.biography ?? "",
      profilePicUrl: user.profile_pic_url || "",
      profilePicUrlHd: user.profile_pic_url_hd || user.profile_pic_url || "",
      isVerified: Boolean(user.is_verified),
      isPrivate: Boolean(user.is_private),
      postsCount: user.edge_owner_to_timeline_media?.count ?? 0,
      followersCount: user.edge_followed_by?.count ?? 0,
      followingCount: user.edge_follow?.count ?? 0,
      externalUrl: user.external_url || null,
    };
  } catch (err) {
    console.error("[Instagram Web Profile Info Parse Error]", err);
    return null;
  }
}

async function fetchViaTopsearchAndInfo(
  username: string,
  cookie: string,
  deadline: number
): Promise<InstagramUserData | null> {
  let topsearchUser: TopsearchUserObj | null = null;
  let pkId: string | null = null;

  const res = await fetchWithRetry(
    `https://www.instagram.com/web/search/topsearch/?context=user&count=5&query=${encodeURIComponent(username)}`,
    {
      "User-Agent": UA_WEB,
      Cookie: cookie,
      "X-IG-App-ID": IG_APP_ID,
      "X-CSRFToken": getCsrfToken(cookie),
      Referer: `https://www.instagram.com/${encodeURIComponent(username)}/`,
    },
    7000,
    [1500],
    deadline
  );

  if (res && res.ok) {
    try {
      const data = (await res.json()) as { users?: TopsearchItem[] };
      const exact = (data.users || []).find(
        (u) => u.user?.username?.toLowerCase() === username
      );
      topsearchUser = exact?.user || null;
      if (topsearchUser) {
        pkId = topsearchUser.pk || topsearchUser.id || topsearchUser.pk_id || null;
      }
    } catch (err) {
      console.error("[Instagram Topsearch Parse Error]", err);
    }
  }

  if (!pkId) return null;

  let user: TopsearchUserObj = topsearchUser!;
  let followersCount = 0;
  let followingCount = 0;
  let postsCount = 0;
  let biography = "";
  let statsVerified = false;

  const infoRes = await fetchWithRetry(
    `https://www.instagram.com/api/v1/users/${pkId}/info/`,
    {
      "User-Agent": UA_MOBILE,
      "X-IG-App-ID": IG_APP_ID,
      "X-CSRFToken": getCsrfToken(cookie),
      Cookie: cookie,
    },
    10000,
    [2500],
    deadline
  );

  if (infoRes && infoRes.ok) {
    try {
      const infoData = await infoRes.json();
      if (infoData?.user) {
        followersCount = infoData.user.follower_count ?? 0;
        followingCount = infoData.user.following_count ?? 0;
        postsCount = infoData.user.media_count ?? 0;
        biography = infoData.user.biography ?? "";
        user = { ...user, ...infoData.user };
        statsVerified = true;
      }
    } catch (err) {
      console.error("[Instagram User Info Parse Error]", err);
    }
  }

  if (!statsVerified) {
    return null;
  }

  return {
    username: user.username || username,
    fullName: user.full_name || username,
    biography,
    profilePicUrl: user.profile_pic_url || "",
    profilePicUrlHd: user.profile_pic_url || "",
    isVerified: Boolean(user.is_verified),
    isPrivate: Boolean(user.is_private),
    postsCount,
    followersCount,
    followingCount,
    externalUrl: null,
  };
}

async function fetchViaWorkerProxy(
  username: string
): Promise<InstagramUserData | null> {
  const proxyBase = (process.env.INSTAGRAM_PROXY_URL || "").replace(/\/$/, "");
  if (!proxyBase) return null;

  try {
    const res = await fetch(`${proxyBase}/${encodeURIComponent(username)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.ok && json.data) {
      return json.data as InstagramUserData;
    }
  } catch (err) {
    console.error("[Instagram Worker Fetch Error]", err);
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

  const deadline = Date.now() + FETCH_BUDGET_MS;
  const cookie = process.env.INSTAGRAM_COOKIE;

  let data: InstagramUserData | null = null;
  if (cookie) {
    data = await fetchViaWebProfileInfo(username, cookie, deadline);
    if (!data) {
      await sleep(1000 + Math.floor(Math.random() * 500));
      data = await fetchViaTopsearchAndInfo(username, cookie, deadline);
    }
  }
  if (!data) {
    data = await fetchViaWorkerProxy(username);
  }

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
