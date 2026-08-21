import { NextRequest, NextResponse } from "next/server";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";

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
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

function parseStat(s: string): number {
  const clean = s.replace(/,/g, "").trim().toUpperCase();
  if (clean.endsWith("M")) return Math.round(parseFloat(clean) * 1_000_000);
  if (clean.endsWith("K")) return Math.round(parseFloat(clean) * 1_000);
  return parseInt(clean, 10) || 0;
}

export async function fetchInstagramUserData(
  rawUsername: string
): Promise<InstagramUserData | null> {
  const username = cleanInstagramUsername(rawUsername).toLowerCase();
  if (!username || !/^[a-zA-Z0-9_.-]{1,30}$/.test(username)) {
    return null;
  }

  // Method 1: Public Embed HTML scrape (Instagram allows unauthenticated server-side requests to embeds)
  try {
    const embedUrl = `https://www.instagram.com/${encodeURIComponent(username)}/embed/captioned/`;
    const res = await fetch(embedUrl, {
      headers: CRAWLER_HEADERS,
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const html = await res.text();

      // Extract avatar, handle, display name
      const avatarMatch = html.match(/class=["']Avatar["'][^>]*src=["']([^"']+)["']/i) ||
                          html.match(/src=["'](https:\/\/[^"']*cdninstagram\.com\/[^"']+)["']/i) ||
                          html.match(/src=["'](https:\/\/[^"']*fbcdn\.net\/[^"']+)["']/i);

      const usernameMatch = html.match(/class=["']UsernameText["'][^>]*>([^<]+)<\/span>/i) ||
                            html.match(/class=["']Username["'][^>]*>([^<]+)<\/a>/i);

      const isVerified = html.includes("coreSpriteVerifiedBadgeSmall") || html.includes("Verified");

      if (avatarMatch && avatarMatch[1]) {
        const profilePicUrl = avatarMatch[1].replace(/&amp;/g, "&");
        return {
          username,
          fullName: usernameMatch?.[1]?.trim() || username,
          biography: "",
          profilePicUrl,
          profilePicUrlHd: profilePicUrl,
          isVerified,
          isPrivate: false,
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          externalUrl: null,
        };
      }
    }
  } catch (err) {
    console.warn("[Instagram embed scrape failed]", err);
  }

  // Method 2: Google Search OG snippet mirror (100% free, no API key, bypasses IP bans)
  try {
    const googleSearchUrl = `https://html.duckduckgo.com/html/?q=site:instagram.com/${encodeURIComponent(username)}`;
    const res = await fetch(googleSearchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const html = await res.text();
      const match = html.match(/([\d,.]+[KMkm]?)\s+Followers,\s*([\d,.]+[KMkm]?)\s+Following,\s*([\d,.]+[KMkm]?)\s+Posts/i);
      if (match) {
        const followersCount = parseStat(match[1]);
        const followingCount = parseStat(match[2]);
        const postsCount = parseStat(match[3]);

        return {
          username,
          fullName: username,
          biography: "",
          profilePicUrl: "",
          profilePicUrlHd: "",
          isVerified: false,
          isPrivate: false,
          postsCount,
          followersCount,
          followingCount,
          externalUrl: null,
        };
      }
    }
  } catch (err) {
    console.warn("[Instagram DuckDuckGo mirror failed]", err);
  }

  // Method 3: Direct OpenGraph crawl
  try {
    const pageUrl = `https://www.instagram.com/${encodeURIComponent(username)}/`;
    const res = await fetch(pageUrl, {
      headers: CRAWLER_HEADERS,
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const html = await res.text();

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

      let followersCount = 0;
      let followingCount = 0;
      let postsCount = 0;
      let fullName = username;

      if (ogDescMatch && ogDescMatch[1]) {
        const desc = ogDescMatch[1];
        const statsMatch = desc.match(
          /([\d,.]+[KMkm]?)\s+Followers,\s*([\d,.]+[KMkm]?)\s+Following,\s*([\d,.]+[KMkm]?)\s+Posts/i
        );

        if (statsMatch) {
          followersCount = parseStat(statsMatch[1]);
          followingCount = parseStat(statsMatch[2]);
          postsCount = parseStat(statsMatch[3]);
        }
      }

      if (ogTitleMatch && ogTitleMatch[1]) {
        const rawTitle = ogTitleMatch[1]
          .replace(/&#064;/g, "@")
          .replace(/&#x2022;/g, "•")
          .replace(/&amp;/g, "&");
        const nameMatch = rawTitle.match(/^(.*?)\s*\(@/);
        if (nameMatch && nameMatch[1]) {
          fullName = nameMatch[1].trim();
        }
      }

      const profilePicUrl = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, "&") : "";

      if (profilePicUrl || followersCount > 0 || (ogTitleMatch && !html.includes("Page Not Found"))) {
        return {
          username,
          fullName: fullName || username,
          biography: "",
          profilePicUrl,
          profilePicUrlHd: profilePicUrl,
          isVerified: html.includes('"is_verified":true'),
          isPrivate: html.includes('"is_private":true'),
          postsCount,
          followersCount,
          followingCount,
          externalUrl: null,
        };
      }
    }
  } catch (err) {
    console.warn("[Instagram crawler OG scrape failed]", err);
  }

  // Method 4: Instagram Web Profile JSON endpoint with App ID
  try {
    const webInfoUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
      username
    )}`;

    const res = await fetch(webInfoUrl, {
      headers: {
        ...BROWSER_HEADERS,
        "X-IG-App-ID": "936619743392459",
        "X-Requested-With": "XMLHttpRequest",
        Referer: `https://www.instagram.com/${encodeURIComponent(username)}/`,
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const user = data?.data?.user;
      if (user && user.username) {
        return {
          username: user.username,
          fullName: user.full_name || user.username,
          biography: user.biography || "",
          profilePicUrl: user.profile_pic_url || "",
          profilePicUrlHd: user.profile_pic_url_hd || user.profile_pic_url || "",
          isVerified: Boolean(user.is_verified),
          isPrivate: Boolean(user.is_private),
          postsCount: Number(user.edge_owner_to_timeline_media?.count || 0),
          followersCount: Number(user.edge_followed_by?.count || 0),
          followingCount: Number(user.edge_follow?.count || 0),
          externalUrl: user.external_url || null,
        };
      }
    }
  } catch (err) {
    console.warn("[Instagram API v1 fetch failed]", err);
  }

  return null;
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
        { error: "Instagram profile not found" },
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
