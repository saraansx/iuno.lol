import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import { readBoundedText } from "@/lib/bounded-html";

const PINTEREST_BUDGET_MS = 20_000;

export interface PinterestUserData {
  username: string;
  name: string | null;
  avatar_url: string | null;
  pin_count: number | null;
  first_pin_image: string | null;
  url: string;
}

export async function fetchPinterestUserData(cleanUsername: string): Promise<PinterestUserData | null> {
  let name: string | null = null;
  let avatarUrl: string | null = null;
  let pinCount: number | null = null;
  let firstPinImage: string | null = null;
  let fetched = false;

  const resourceUrl = `https://www.pinterest.com/resource/UserResource/get/?data=${encodeURIComponent(
    JSON.stringify({ options: { username: cleanUsername } })
  )}`;

  const startedAt = Date.now();
  const overBudget = () => Date.now() - startedAt > PINTEREST_BUDGET_MS;

  const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  const [resourceUser, rssInfo] = await Promise.all([
    (async () => {
      try {
        const res = await fetch(resourceUrl, {
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          headers: {
            "User-Agent": UA,
            "Accept": "application/json, text/javascript, */*, q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "X-Pinterest-AppState": "active",
            "X-Pinterest-PWS-Handler": "www/[username].js",
          },
          cache: "no-store",
        });
        if (!res.ok) return null;
        const text = await readBoundedText(res);
        if (!text || !text.trim().startsWith("{")) return null;
        const json = JSON.parse(text);
        const userData = json?.resource_response?.data;
        return userData && userData.type === "user" ? userData : null;
      } catch (e) {
        console.warn("[Pinterest Resource Endpoint Fallback]", e);
        return null;
      }
    })(),
    (async () => {
      try {
        const rssRes = await fetch(
          `https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/feed.rss`,
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
        return { image: imgMatch?.[1] || null, title: titleMatch?.[1] || null };
      } catch (e) {
        console.warn("[Pinterest RSS Parse]", e);
        return null;
      }
    })(),
  ]);

  if (resourceUser) {
    name = resourceUser.full_name || resourceUser.username || cleanUsername;
    avatarUrl =
      resourceUser.image_xlarge_url ||
      resourceUser.image_large_url ||
      resourceUser.image_medium_url ||
      resourceUser.image_small_url ||
      null;
    pinCount = typeof resourceUser.pin_count === "number" ? resourceUser.pin_count : null;
    fetched = true;
  }

  if (rssInfo?.image) firstPinImage = rssInfo.image;
  if (!fetched && rssInfo?.title) {
    name = rssInfo.title.replace(/on Pinterest$/i, "").trim();
    fetched = true;
  }

  if (!fetched && !overBudget()) {
    try {
      const htmlRes = await fetch(`https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          "User-Agent": UA,
        },
        cache: "no-store",
      });

      if (htmlRes.ok) {
        const html = await readBoundedText(htmlRes);
        if (!html) return null;
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
    first_pin_image: firstPinImage || avatarUrl,
    url: `https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/`,
  };

  return result;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "pinterest_user");
    if (limited) return limited;

    const { username } = await params;
    const cleanUsername = (username || "").trim().toLowerCase();

    if (!cleanUsername || !/^[a-zA-Z0-9_]{1,30}$/.test(cleanUsername)) {
      return NextResponse.json({ error: "Invalid Pinterest username" }, { status: 400 });
    }

    const result = await withWidgetCache(
      widgetCacheKey("pinterest", "user", cleanUsername),
      () => fetchPinterestUserData(cleanUsername)
    );
    if (!result) {
      return NextResponse.json({ error: "Pinterest user not found" }, { status: 404 });
    }

    return NextResponse.json(result, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[Pinterest User API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
