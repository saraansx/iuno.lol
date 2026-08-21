import { NextRequest, NextResponse } from "next/server";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";

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

  const cookie = process.env.INSTAGRAM_COOKIE;

  // 1. Instagram Topsearch API with Session Cookie
  let topsearchUser: any = null;
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
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(6000),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const userList = (data.users || []) as Array<{ user: any }>;
        topsearchUser =
          userList.find((u) => u.user?.username?.toLowerCase() === username)?.user ||
          userList[0]?.user;
      }
    } catch (err) {
      console.error("[Instagram Topsearch API Error]", err);
    }
  }

  // 2. Fetch live stats (followers, following, posts)
  let followersCount = 0;
  let followingCount = 0;
  let postsCount = 0;

  try {
    const jinaRes = await fetch(
      `https://r.jina.ai/https://www.instagram.com/${encodeURIComponent(username)}/`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (jinaRes.ok) {
      const text = await jinaRes.text();
      const followersMatch = text.match(/\[([\d,.]+[KMkm]?)\s+followers\]/i);
      const followingMatch = text.match(/\[([\d,.]+[KMkm]?)\s+following\]/i);
      const postsMatch = text.match(/\[([\d,.]+[KMkm]?)\s+posts?\]/i);

      if (followersMatch) followersCount = parseStat(followersMatch[1]);
      if (followingMatch) followingCount = parseStat(followingMatch[1]);
      if (postsMatch) postsCount = parseStat(postsMatch[1]);
    }
  } catch (err) {
    console.error("[Instagram Stats Scraper Error]", err);
  }

  if (topsearchUser) {
    return {
      username: topsearchUser.username || username,
      fullName: topsearchUser.full_name || username,
      biography: "",
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

  // 3. Cloudflare Worker fallback
  const proxyBase = (process.env.INSTAGRAM_PROXY_URL || "").replace(/\/$/, "");
  if (proxyBase) {
    try {
      const res = await fetch(`${proxyBase}/${encodeURIComponent(username)}`, {
        next: { revalidate: 3600 },
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
