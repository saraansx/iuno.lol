import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import { readBoundedText } from "@/lib/bounded-html";

const PINTEREST_BUDGET_MS = 20_000;

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
  let boardName = cleanBoard;
  let ownerName: string | null = null;
  let ownerUsername: string | null = cleanUsername;
  let ownerImage: string | null = null;
  let pinCount: number | null = null;
  let coverImage: string | null = null;
  let firstPinImage: string | null = null;
  let fetched = false;

  const resourceUrl = `https://www.pinterest.com/resource/BoardResource/get/?data=${encodeURIComponent(
    JSON.stringify({ options: { username: cleanUsername, slug: cleanBoard } })
  )}`;

  const startedAt = Date.now();
  const overBudget = () => Date.now() - startedAt > PINTEREST_BUDGET_MS;

  const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  const [resourceBoard, rssInfo] = await Promise.all([
    (async () => {
      try {
        const res = await fetch(resourceUrl, {
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          headers: {
            "User-Agent": UA,
            "Accept": "application/json, text/javascript, */*, q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "X-Pinterest-AppState": "active",
            "X-Pinterest-PWS-Handler": "www/[username]/[slug].js",
          },
          cache: "no-store",
        });
        if (!res.ok) return null;
        const text = await readBoundedText(res);
        if (!text || !text.trim().startsWith("{")) return null;
        const json = JSON.parse(text);
        const boardData = json?.resource_response?.data;
        return boardData && boardData.type === "board" ? boardData : null;
      } catch (e) {
        console.warn("[Pinterest Board Resource Fallback]", e);
        return null;
      }
    })(),
    (async () => {
      try {
        const rssRes = await fetch(
          `https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(cleanBoard)}.rss`,
          {
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            headers: { "User-Agent": UA },
            cache: "no-store",
          }
        );
        if (!rssRes.ok) return null;
        const rssText = await readBoundedText(rssRes);
        if (!rssText) return null;
        const imgMatch = rssText.match(/<description>[\s\S]*?src=["'](https:\/\/[^"'>]+pinimg\.com\/[^"'>]+)["']/i);
        const titleMatch =
          rssText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) ||
          rssText.match(/<title>(.*?)<\/title>/i);
        return {
          image: imgMatch?.[1] || null,
          title: titleMatch?.[1] || null,
        };
      } catch (e) {
        console.warn("[Pinterest Board RSS Parse]", e);
        return null;
      }
    })(),
  ]);

  if (resourceBoard) {
    boardName = resourceBoard.name || cleanBoard;
    ownerName =
      resourceBoard.owner?.full_name ||
      resourceBoard.owner?.explicit_user?.full_name ||
      resourceBoard.owner?.name ||
      null;
    ownerUsername = resourceBoard.owner?.username || cleanUsername;
    ownerImage =
      resourceBoard.owner?.image_medium_url ||
      resourceBoard.owner?.image_small_url ||
      resourceBoard.owner?.image_xlarge_url ||
      null;
    pinCount = typeof resourceBoard.pin_count === "number" ? resourceBoard.pin_count : null;
    coverImage =
      resourceBoard.image_cover_url ||
      resourceBoard.image_thumbnail_url ||
      resourceBoard.images?.["170x"]?.url ||
      resourceBoard.images?.["600x"]?.url ||
      resourceBoard.owner?.image_xlarge_url ||
      null;
    fetched = true;
  }

  if (rssInfo?.image) {
    firstPinImage = rssInfo.image;
    if (!coverImage) coverImage = rssInfo.image;
  }
  if (!fetched && rssInfo?.title) {
    boardName = rssInfo.title.replace(/on Pinterest$/i, "").trim();
    fetched = true;
  }

  const needHtml = !fetched;
  const needOwner = !ownerName || !ownerImage;
  if ((needHtml || needOwner) && !overBudget()) {
    const [htmlTitle, ownerData] = await Promise.all([
      needHtml
        ? (async () => {
            try {
              const htmlRes = await fetch(
                `https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(cleanBoard)}/`,
                {
                  signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
                  headers: { "User-Agent": UA },
                  cache: "no-store",
                }
              );
              if (!htmlRes.ok) return null;
              const html = await readBoundedText(htmlRes);
              if (!html) return null;
              return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || null;
            } catch (e) {
              console.warn("[Pinterest Board HTML Parse]", e);
              return null;
            }
          })()
        : Promise.resolve(null),
      needOwner
        ? (async () => {
            try {
              const userRes = await fetch(
                `https://www.pinterest.com/resource/UserResource/get/?data=${encodeURIComponent(
                  JSON.stringify({ options: { username: cleanUsername } })
                )}`,
                {
                  signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
                  headers: {
                    "User-Agent": UA,
                    "Accept": "application/json, text/javascript, */*, q=0.01",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-Pinterest-AppState": "active",
                    "X-Pinterest-PWS-Handler": "www/[username].js",
                  },
                  cache: "no-store",
                }
              );
              if (!userRes.ok) return null;
              const uText = await userRes.text();
              if (!uText || !uText.trim().startsWith("{")) return null;
              return JSON.parse(uText)?.resource_response?.data || null;
            } catch (e) {
              console.warn("[Pinterest User Details Fetch Error]", e);
              return null;
            }
          })()
        : Promise.resolve(null),
    ]);

    if (!fetched && htmlTitle) {
      boardName = htmlTitle.replace(/on Pinterest$/i, "").trim();
      fetched = true;
    }
    if (ownerData) {
      if (!ownerName && ownerData.full_name) ownerName = ownerData.full_name;
      if (!ownerImage) {
        ownerImage =
          ownerData.image_medium_url || ownerData.image_small_url || ownerData.image_xlarge_url || null;
      }
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

  return result;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string; board: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "pinterest_board");
    if (limited) return limited;

    const { username, board } = await params;
    const cleanUsername = (username || "").trim().toLowerCase();
    const cleanBoard = (board || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");

    if (!cleanUsername || !cleanBoard) {
      return NextResponse.json({ error: "Invalid username or board" }, { status: 400 });
    }

    const result = await withWidgetCache(
      widgetCacheKey("pinterest", "board", cleanUsername, cleanBoard),
      () => fetchPinterestBoardData(cleanUsername, cleanBoard)
    );
    if (!result) {
      return NextResponse.json({ error: "Pinterest board not found" }, { status: 404 });
    }

    return NextResponse.json(result, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[Pinterest Board API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
