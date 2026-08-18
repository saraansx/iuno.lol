import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export interface PinterestUserData {
  username: string;
  name: string | null;
  avatar_url: string | null;
  pin_count: number | null;
  board_count: number | null;
  follower_count: number | null;
  first_pin_image: string | null;
  url: string;
}

export async function fetchPinterestUserData(cleanUsername: string): Promise<PinterestUserData | null> {
  const cacheKey = `pinterest:user:${cleanUsername}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached && cached.trim().startsWith("{")) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("[Redis Cache Error]", e);
  }

  let name: string | null = null;
  let avatarUrl: string | null = null;
  let pinCount: number | null = null;
  let boardCount: number | null = null;
  let followerCount: number | null = null;
  let firstPinImage: string | null = null;
  let fetched = false;

  // 1. Try Pinterest Public JSON Resource endpoint with app state headers
  const resourceUrl = `https://www.pinterest.com/resource/UserResource/get/?data=${encodeURIComponent(
    JSON.stringify({ options: { username: cleanUsername } })
  )}`;

  try {
    const res = await fetch(resourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*, q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "X-Pinterest-AppState": "active",
        "X-Pinterest-PWS-Handler": "www/[username].js",
      },
      next: { revalidate: 900 },
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith("{")) {
        try {
          const json = JSON.parse(text);
          const userData = json?.resource_response?.data;
          if (userData && userData.type === "user") {
            name = userData.full_name || userData.username || cleanUsername;
            avatarUrl =
              userData.image_xlarge_url ||
              userData.image_large_url ||
              userData.image_medium_url ||
              userData.image_small_url ||
              null;
            pinCount = typeof userData.pin_count === "number" ? userData.pin_count : null;
            boardCount = typeof userData.board_count === "number" ? userData.board_count : null;
            followerCount = typeof userData.follower_count === "number" ? userData.follower_count : null;
            fetched = true;
          }
        } catch {
          // ignore parse error
        }
      }
    }
  } catch (e) {
    console.warn("[Pinterest Resource Endpoint Fallback]", e);
  }

  // 2. Fetch User RSS feed for latest pin image
  try {
    const rssRes = await fetch(`https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/feed.rss`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 900 },
    });

    if (rssRes.ok) {
      const rssText = await rssRes.text();
      const imgMatch = rssText.match(/<description>[\s\S]*?src=["'](https:\/\/[^"'>]+pinimg\.com\/[^"'>]+)["']/i);
      if (imgMatch && imgMatch[1]) {
        firstPinImage = imgMatch[1];
      }

      if (!fetched) {
        const titleMatch = rssText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || rssText.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          name = titleMatch[1].replace(/on Pinterest$/i, "").trim();
          fetched = true;
        }
      }
    }
  } catch (e) {
    console.warn("[Pinterest RSS Parse]", e);
  }

  // 3. Fallback: Parse public HTML page
  if (!fetched) {
    try {
      const htmlRes = await fetch(`https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 900 },
      });

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          const rawTitle = titleMatch[1].replace(/- Profile \| Pinterest/i, "").trim();
          const namePart = rawTitle.split("(")[0]?.trim();
          if (namePart) {
            name = namePart;
            fetched = true;
          }
        }
      }
    } catch (e) {
      console.warn("[Pinterest HTML Parse]", e);
    }
  }

  if (!fetched && !name) {
    return null;
  }

  const result: PinterestUserData = {
    username: cleanUsername,
    name: name || cleanUsername,
    avatar_url: avatarUrl,
    pin_count: pinCount !== null ? pinCount : 0,
    board_count: boardCount,
    follower_count: followerCount,
    first_pin_image: firstPinImage || avatarUrl,
    url: `https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/`,
  };

  try {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 900);
  } catch (e) {
    console.warn("[Redis Set Error]", e);
  }

  return result;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cleanUsername = (username || "").trim().toLowerCase();

    if (!cleanUsername || !/^[a-zA-Z0-9_]{1,30}$/.test(cleanUsername)) {
      return NextResponse.json({ error: "Invalid Pinterest username" }, { status: 400 });
    }

    const result = await fetchPinterestUserData(cleanUsername);
    if (!result) {
      return NextResponse.json({ error: "Pinterest user not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Pinterest User API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
