import { NextRequest, NextResponse } from "next/server";
import { type TikTokUserData, cleanTikTokUsername } from "@/lib/tiktok";
import { withWidgetCache, widgetCacheKey } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

const CRAWLER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

/** Parses a compact stat like "1.2M", "159M", "12.3B"/"12.3G", or a plain integer. */
function parseCompactStat(s: string): number {
  const clean = s.replace(/,/g, "").trim().toUpperCase();
  if (clean.endsWith("B") || clean.endsWith("G")) return Math.round(parseFloat(clean) * 1_000_000_000);
  if (clean.endsWith("M")) return Math.round(parseFloat(clean) * 1_000_000);
  if (clean.endsWith("K")) return Math.round(parseFloat(clean) * 1_000);
  return parseInt(clean, 10) || 0;
}

/** Pulls the "… Likes" value out of the page's OpenGraph/meta description. */
function extractLikesFromHtml(html: string): number {
  const ogDescMatch =
    html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ||
    html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  if (!ogDescMatch || !ogDescMatch[1]) return 0;
  const likesMatch = ogDescMatch[1].match(/([\d,.]+[KMkmBbgG]?)\s+Likes/i);
  return likesMatch ? parseCompactStat(likesMatch[1]) : 0;
}

/**
 * Fetches the profile page with a crawler User-Agent, which is the only variant
 * where TikTok puts the "… Followers, … Following, … Likes" summary into the
 * OpenGraph description. Used to recover an untruncated likes count.
 */
async function fetchLikesFromCrawler(username: string): Promise<number> {
  try {
    const res = await fetch(`https://www.tiktok.com/@${encodeURIComponent(username)}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: CRAWLER_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return 0;
    return extractLikesFromHtml(await res.text());
  } catch {
    return 0;
  }
}

/**
 * TikTok stores total likes ("heart") in a signed 32-bit int, so accounts with
 * more than ~2.1B likes overflow to a negative number in the JSON state — and
 * we can't tell how many times it wrapped, so adding 2^32 back is unreliable.
 * The OpenGraph description ("… Likes") is a human-formatted, untruncated value,
 * so when the JSON count is non-positive we fall back to it: first on the page
 * we already have, then via a dedicated crawler-UA fetch (the browser-UA page
 * only exposes the bio in its description, not the stats).
 */
async function resolveHeartCount(
  rawJsonValue: unknown,
  html: string,
  username: string
): Promise<number> {
  const jsonValue = Number(rawJsonValue || 0);
  if (jsonValue > 0) return jsonValue;
  const samePage = extractLikesFromHtml(html);
  if (samePage > 0) return samePage;
  return fetchLikesFromCrawler(username);
}

export async function fetchTikTokUserData(
  rawUsername: string
): Promise<TikTokUserData | null> {
  const username = cleanTikTokUsername(rawUsername).toLowerCase();
  if (!username || !/^[a-zA-Z0-9_.-]{1,24}$/.test(username)) {
    return null;
  }

  // Attempt 1: Fetch TikTok HTML & parse __UNIVERSAL_DATA_FOR_REHYDRATION__ or SIGI_STATE JSON script
  try {
    const pageUrl = `https://www.tiktok.com/@${encodeURIComponent(username)}`;
    const res = await fetch(pageUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: BROWSER_HEADERS,
      // Freshness is owned by the Redis cache in GET; caching here too would stack
      // both windows and double the worst-case staleness.
      cache: "no-store",
    });

    if (res.ok) {
      const html = await res.text();

      // Check for JSON state in script tags
      const universalMatch = html.match(
        /<script\s+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"\s+type="application\/json">([\s\S]*?)<\/script>/i
      );

      if (universalMatch && universalMatch[1]) {
        try {
          const json = JSON.parse(universalMatch[1]);
          const defaultScope = json?.["__DEFAULT_SCOPE__"];
          const userDetail = defaultScope?.["webapp.user-detail"];
          const userInfo = userDetail?.userInfo?.user;
          const stats = userDetail?.userInfo?.stats;
          // statsV2 holds the same counts as strings — TikTok added it precisely
          // because `stats` uses signed 32-bit ints that overflow (go negative)
          // for accounts past ~2.1B likes. Prefer it whenever present.
          const statsV2 = userDetail?.userInfo?.statsV2;

          if (userInfo) {
            return {
              username: userInfo.uniqueId || username,
              nickname: userInfo.nickname || userInfo.uniqueId || username,
              avatarUrl: userInfo.avatarLarger || userInfo.avatarMedium || userInfo.avatarThumb || "",
              isVerified: Boolean(userInfo.verified),
              followerCount: Number(statsV2?.followerCount || stats?.followerCount || 0),
              followingCount: Number(statsV2?.followingCount || stats?.followingCount || 0),
              heartCount: await resolveHeartCount(
                statsV2?.heartCount || stats?.heartCount || stats?.heart,
                html,
                username
              ),
              videoCount: Number(statsV2?.videoCount || stats?.videoCount || 0),
            };
          }
        } catch (e) {
          console.warn("[TikTok UNIVERSAL JSON parse failed]", e);
        }
      }

      // Check for SIGI_STATE JSON
      const sigiMatch = html.match(
        /<script\s+id="SIGI_STATE"\s+type="application\/json">([\s\S]*?)<\/script>/i
      );

      if (sigiMatch && sigiMatch[1]) {
        try {
          const json = JSON.parse(sigiMatch[1]);
          const usersMap = (json?.UserModule?.users || {}) as Record<string, Record<string, unknown>>;
          const statsMap = (json?.UserModule?.stats || {}) as Record<string, Record<string, unknown>>;
          const statsV2Map = (json?.UserModule?.statsV2 || {}) as Record<string, Record<string, unknown>>;
          const userModule = usersMap[username] || Object.values(usersMap)[0];
          const statsModule = statsMap[username] || Object.values(statsMap)[0];
          const statsV2Module = statsV2Map[username] || Object.values(statsV2Map)[0];

          if (userModule) {
            return {
              username: String(userModule.uniqueId || username),
              nickname: String(userModule.nickname || userModule.uniqueId || username),
              avatarUrl: String(userModule.avatarLarger || userModule.avatarMedium || userModule.avatarThumb || ""),
              isVerified: Boolean(userModule.verified),
              followerCount: Number(statsV2Module?.followerCount || statsModule?.followerCount || 0),
              followingCount: Number(statsV2Module?.followingCount || statsModule?.followingCount || 0),
              heartCount: await resolveHeartCount(
                statsV2Module?.heartCount || statsModule?.heartCount || statsModule?.heart,
                html,
                username
              ),
              videoCount: Number(statsV2Module?.videoCount || statsModule?.videoCount || 0),
            };
          }
        } catch (e) {
          console.warn("[TikTok SIGI_STATE parse failed]", e);
        }
      }

      // Fallback: OpenGraph tags
      const ogDescMatch =
        html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ||
        html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);

      const ogTitleMatch =
        html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

      const ogImageMatch =
        html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

      if (ogTitleMatch && ogTitleMatch[1]) {
        let nickname = username;
        const titleText = ogTitleMatch[1].replace(/&amp;/g, "&");
        const nameMatch = titleText.match(/^(.*?)\s*\(@/);
        if (nameMatch && nameMatch[1]) {
          nickname = nameMatch[1].trim();
        }

        let followerCount = 0;
        let followingCount = 0;
        let heartCount = 0;

        if (ogDescMatch && ogDescMatch[1]) {
          const desc = ogDescMatch[1];
          const statsMatch = desc.match(
            /([\d,.]+[KMkmBbgG]?)\s+Followers[,\s]+([\d,.]+[KMkmBbgG]?)\s+Following[,\s]+([\d,.]+[KMkmBbgG]?)\s+Likes/i
          );

          if (statsMatch) {
            followerCount = parseCompactStat(statsMatch[1]);
            followingCount = parseCompactStat(statsMatch[2]);
            heartCount = parseCompactStat(statsMatch[3]);
          }
        }

        const avatarUrl = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, "&") : "";

        return {
          username,
          nickname: nickname || username,
          avatarUrl,
          isVerified: html.includes('"verified":true') || html.includes('data-e2e="user-verified"'),
          followerCount,
          followingCount,
          heartCount,
          videoCount: 0,
        };
      }
    }
  } catch (err) {
    console.warn("[TikTok HTML scrape failed]", err);
  }

  // Attempt 2: Crawler scrape
  try {
    const pageUrl = `https://www.tiktok.com/@${encodeURIComponent(username)}`;
    const res = await fetch(pageUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: CRAWLER_HEADERS,
      // Freshness is owned by the Redis cache in GET (see note above).
      cache: "no-store",
    });

    if (res.ok) {
      const html = await res.text();
      const ogTitleMatch =
        html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
      const ogImageMatch =
        html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      const ogDescMatch =
        html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

      if (ogTitleMatch && ogTitleMatch[1]) {
        let nickname = username;
        const nameMatch = ogTitleMatch[1].match(/^(.*?)\s*\(@/);
        if (nameMatch && nameMatch[1]) nickname = nameMatch[1].trim();

        let followerCount = 0;
        let followingCount = 0;
        let heartCount = 0;

        if (ogDescMatch && ogDescMatch[1]) {
          const statsMatch = ogDescMatch[1].match(
            /([\d,.]+[KMkmBbgG]?)\s+Followers[,\s]+([\d,.]+[KMkmBbgG]?)\s+Following[,\s]+([\d,.]+[KMkmBbgG]?)\s+Likes/i
          );
          if (statsMatch) {
            followerCount = parseCompactStat(statsMatch[1]);
            followingCount = parseCompactStat(statsMatch[2]);
            heartCount = parseCompactStat(statsMatch[3]);
          }
        }

        return {
          username,
          nickname: nickname || username,
          avatarUrl: ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, "&") : "",
          isVerified: false,
          followerCount,
          followingCount,
          heartCount,
          videoCount: 0,
        };
      }
    }
  } catch (err) {
    console.warn("[TikTok crawler scrape failed]", err);
  }

  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cleanUsername = cleanTikTokUsername(username);

    if (!cleanUsername || !/^[a-zA-Z0-9_.-]{1,24}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Invalid TikTok username" },
        { status: 400 }
      );
    }

    const data = await withWidgetCache(
      widgetCacheKey("tiktok", "user", cleanUsername),
      () => fetchTikTokUserData(cleanUsername)
    );
    if (!data) {
      return NextResponse.json(
        { error: "TikTok profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (err) {
    console.error("[TikTok Profile API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
