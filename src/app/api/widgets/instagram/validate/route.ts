import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { cleanInstagramUsername } from "@/lib/instagram";
import { fetchInstagramUserData } from "../user/[username]/route";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();
    const cleanUsername = cleanInstagramUsername(username);

    if (!cleanUsername || !/^[a-zA-Z0-9_.-]{1,30}$/.test(cleanUsername)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid Instagram username format (1-30 alphanumeric, dots, underscores, dashes)",
      });
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
    console.error("[Instagram Validation Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
