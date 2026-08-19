import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export interface PinterestBoardData {
  username: string;
  board_slug: string;
  name: string;
  owner_name?: string | null;
  owner_username?: string | null;
  owner_image?: string | null;
  pin_count: number | null;
  cover_image: string | null;
  first_pin_image: string | null;
  url: string;
}

export async function fetchPinterestBoardData(cleanUsername: string, cleanBoard: string): Promise<PinterestBoardData | null> {
  const cacheKey = `pinterest:board:v2:${cleanUsername}:${cleanBoard}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached && cached.trim().startsWith("{")) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("[Redis Cache Error]", e);
  }

  let boardName = cleanBoard;
  let ownerName: string | null = null;
  let ownerUsername: string | null = cleanUsername;
  let ownerImage: string | null = null;
  let pinCount: number | null = null;
  let coverImage: string | null = null;
  let firstPinImage: string | null = null;
  let fetched = false;

  // 1. Try Pinterest Board JSON Resource with app state headers
  const resourceUrl = `https://www.pinterest.com/resource/BoardResource/get/?data=${encodeURIComponent(
    JSON.stringify({ options: { username: cleanUsername, slug: cleanBoard } })
  )}`;

  try {
    const res = await fetch(resourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*, q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "X-Pinterest-AppState": "active",
        "X-Pinterest-PWS-Handler": "www/[username]/[slug].js",
      },
      next: { revalidate: 900 },
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith("{")) {
        try {
          const json = JSON.parse(text);
          const boardData = json?.resource_response?.data;
          if (boardData && boardData.type === "board") {
            boardName = boardData.name || cleanBoard;
            ownerName =
              boardData.owner?.full_name ||
              boardData.owner?.explicit_user?.full_name ||
              boardData.owner?.name ||
              null;
            ownerUsername = boardData.owner?.username || cleanUsername;
            ownerImage = boardData.owner?.image_medium_url || boardData.owner?.image_small_url || boardData.owner?.image_xlarge_url || null;
            pinCount = typeof boardData.pin_count === "number" ? boardData.pin_count : null;
            coverImage =
              boardData.image_cover_url ||
              boardData.image_thumbnail_url ||
              boardData.images?.["170x"]?.url ||
              boardData.images?.["600x"]?.url ||
              boardData.owner?.image_xlarge_url ||
              null;
            fetched = true;
          }
        } catch {
          // ignore parse error
        }
      }
    }
  } catch (e) {
    console.warn("[Pinterest Board Resource Fallback]", e);
  }

  // 2. Fetch Board RSS feed for pin images
  try {
    const rssRes = await fetch(`https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(cleanBoard)}.rss`, {
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
        if (!coverImage) coverImage = imgMatch[1];
      }

      if (!fetched) {
        const titleMatch = rssText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || rssText.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          boardName = titleMatch[1].replace(/on Pinterest$/i, "").trim();
          fetched = true;
        }
      }
    }
  } catch (e) {
    console.warn("[Pinterest Board RSS Parse]", e);
  }

  // 3. Fallback: Public HTML scraping
  if (!fetched) {
    try {
      const htmlRes = await fetch(`https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(cleanBoard)}/`, {
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
          boardName = titleMatch[1].replace(/on Pinterest$/i, "").trim();
          fetched = true;
        }
      }
    } catch (e) {
      console.warn("[Pinterest Board HTML Parse]", e);
    }
  }

  if (!ownerName || !ownerImage) {
    try {
      const userRes = await fetch(
        `https://www.pinterest.com/resource/UserResource/get/?data=${encodeURIComponent(
          JSON.stringify({ options: { username: cleanUsername } })
        )}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*, q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "X-Pinterest-AppState": "active",
            "X-Pinterest-PWS-Handler": "www/[username].js",
          },
          next: { revalidate: 900 },
        }
      );

      if (userRes.ok) {
        const uText = await userRes.text();
        if (uText && uText.trim().startsWith("{")) {
          const uJson = JSON.parse(uText);
          const uData = uJson?.resource_response?.data;
          if (uData) {
            if (!ownerName && uData.full_name) ownerName = uData.full_name;
            if (!ownerImage) {
              ownerImage =
                uData.image_medium_url ||
                uData.image_small_url ||
                uData.image_xlarge_url ||
                null;
            }
          }
        }
      }
    } catch (e) {
      console.warn("[Pinterest User Details Fetch Error]", e);
    }
  }

  if (!fetched && !boardName) {
    return null;
  }

  const result: PinterestBoardData = {
    username: cleanUsername,
    board_slug: cleanBoard,
    name: boardName,
    owner_name: ownerName,
    owner_username: ownerUsername,
    owner_image: ownerImage,
    pin_count: pinCount !== null ? pinCount : 0,
    cover_image: coverImage || firstPinImage,
    first_pin_image: firstPinImage || coverImage,
    url: `https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(cleanBoard)}/`,
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
  { params }: { params: Promise<{ username: string; board: string }> }
) {
  try {
    const { username, board } = await params;
    const cleanUsername = (username || "").trim().toLowerCase();
    const cleanBoard = (board || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");

    if (!cleanUsername || !cleanBoard) {
      return NextResponse.json({ error: "Invalid username or board" }, { status: 400 });
    }

    const result = await fetchPinterestBoardData(cleanUsername, cleanBoard);
    if (!result) {
      return NextResponse.json({ error: "Pinterest board not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Pinterest Board API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
