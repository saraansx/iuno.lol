import { NextRequest, NextResponse } from "next/server";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "X-IG-App-ID": "936619743392459",
  "X-Requested-With": "XMLHttpRequest",
};

export async function fetchInstagramUserData(
  rawUsername: string
): Promise<InstagramUserData | null> {
  const username = cleanInstagramUsername(rawUsername).toLowerCase();
  if (!username || !/^[a-zA-Z0-9_.-]{1,30}$/.test(username)) {
    return null;
  }

  try {
    const instagramProxyUrl = (process.env.INSTAGRAM_PROXY_URL || "https://www.instagram.com").replace(/\/$/, "");
    const targetUrl = `${instagramProxyUrl}/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

    const res = await fetch(targetUrl, {
      headers: {
        ...BROWSER_HEADERS,
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
    console.error("[Instagram Worker Proxy fetch failed]", err);
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
