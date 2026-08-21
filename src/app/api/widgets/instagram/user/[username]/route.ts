import { NextRequest, NextResponse } from "next/server";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";

function parseStat(s: string): number {
  const clean = s.replace(/,/g, "").trim().toUpperCase();
  if (clean.endsWith("M")) return Math.round(parseFloat(clean) * 1_000_000);
  if (clean.endsWith("K")) return Math.round(parseFloat(clean) * 1_000);
  return parseInt(clean, 10) || 0;
}

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

export async function fetchInstagramUserData(
  rawUsername: string
): Promise<InstagramUserData | null> {
  const username = cleanInstagramUsername(rawUsername).toLowerCase();
  if (!username || !/^[a-zA-Z0-9_.-]{1,30}$/.test(username)) {
    return null;
  }

  const cookie = process.env.INSTAGRAM_COOKIE;

  // 1. Instagram Authenticated Search + User Info API
  let topsearchUser: TopsearchUserObj | null = null;
  let pkId: string | null = null;

  if (cookie) {
    try {
      const res = await fetch(
        `https://www.instagram.com/web/search/topsearch/?context=user&count=1&query=${encodeURIComponent(username)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Cookie": cookie,
            "X-IG-App-ID": "936619743392459",
            "Referer": `https://www.instagram.com/${encodeURIComponent(username)}/`,
          },
          next: { revalidate: 1800 },
          signal: AbortSignal.timeout(6000),
        }
      );

      if (res.ok) {
        const data = (await res.json()) as { users?: TopsearchItem[] };
        const userList = data.users || [];
        topsearchUser =
          userList.find((u) => u.user?.username?.toLowerCase() === username)?.user ||
          userList[0]?.user ||
          null;
        if (topsearchUser) {
          pkId = topsearchUser.pk || topsearchUser.id || topsearchUser.pk_id || null;
        }
      }
    } catch (err) {
      console.error("[Instagram Topsearch API Error]", err);
    }
  }

  let followersCount = 0;
  let followingCount = 0;
  let postsCount = 0;
  let biography = "";

  // 2. Fetch exact live stats from Instagram User Info API
  if (cookie && pkId) {
    try {
      const infoRes = await fetch(`https://www.instagram.com/api/v1/users/${pkId}/info/`, {
        headers: {
          "User-Agent":
            "Instagram 278.0.0.19.115 (iPhone14,2; iOS 16_4_1; en_US; en-US; scale=3.00; 1170x2532; 465427189)",
          "X-IG-App-ID": "936619743392459",
          "Cookie": cookie,
        },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(6000),
      });

      if (infoRes.ok) {
        const infoData = await infoRes.json();
        if (infoData?.user) {
          followersCount = infoData.user.follower_count ?? 0;
          followingCount = infoData.user.following_count ?? 0;
          postsCount = infoData.user.media_count ?? 0;
          biography = infoData.user.biography ?? "";
        }
      }
    } catch (err) {
      console.error("[Instagram User Info API Error]", err);
    }
  }

  // 3. Fallback stats scraper if User Info API didn't populate stats
  if (followersCount === 0 && postsCount === 0) {
    try {
      const viewerRes = await fetch(
        `https://insta-stories-viewer.com/${encodeURIComponent(username)}/`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          },
          next: { revalidate: 1800 },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (viewerRes.ok) {
        const html = await viewerRes.text();
        const postsMatch = html.match(/profile__stats-posts">([^<]+)<\/span>/i);
        const followersMatch = html.match(/profile__stats-followers">([^<]+)<\/span>/i);
        const followsMatch = html.match(/profile__stats-follows">([^<]+)<\/span>/i);

        if (postsMatch) postsCount = parseStat(postsMatch[1]);
        if (followersMatch) followersCount = parseStat(followersMatch[1]);
        if (followsMatch) followingCount = parseStat(followsMatch[1]);
      }
    } catch (err) {
      console.error("[Instagram Fallback Scraper Error]", err);
    }
  }

  if (topsearchUser) {
    return {
      username: topsearchUser.username || username,
      fullName: topsearchUser.full_name || username,
      biography,
      profilePicUrl: topsearchUser.profile_pic_url || "",
      profilePicUrlHd: topsearchUser.profile_pic_url || "",
      isVerified: Boolean(topsearchUser.is_verified),
      isPrivate: Boolean(topsearchUser.is_private),
      postsCount,
      followersCount,
      followingCount,
      externalUrl: null,
    };
  }

  // 4. Cloudflare Worker fallback
  const proxyBase = (process.env.INSTAGRAM_PROXY_URL || "").replace(/\/$/, "");
  if (proxyBase) {
    try {
      const res = await fetch(`${proxyBase}/${encodeURIComponent(username)}`, {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          return json.data as InstagramUserData;
        }
      }
    } catch (err) {
      console.error("[Instagram Worker Fetch Error]", err);
    }
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

    const data = (await fetchInstagramUserData(cleanUsername)) || {
      username: cleanUsername,
      fullName: cleanUsername,
      biography: "",
      profilePicUrl: "",
      profilePicUrlHd: "",
      isVerified: false,
      isPrivate: false,
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      externalUrl: null,
    };

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
