import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";
import { cleanTikTokUsername } from "@/lib/tiktok";
import { fetchTikTokUserData } from "../user/[username]/route";

export async function POST(req: NextRequest) {
  try {
    const limited = await widgetRateLimit(req, "tiktok_validate", 20);
    if (limited) return limited;

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ valid: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawUsername = body?.username;

    if (!rawUsername || typeof rawUsername !== "string") {
      return NextResponse.json(
        { valid: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const cleanUsername = cleanTikTokUsername(rawUsername);
    if (!cleanUsername || !/^[a-zA-Z0-9_.-]{1,24}$/.test(cleanUsername)) {
      return NextResponse.json(
        { valid: false, error: "Invalid TikTok username format" },
        { status: 400 }
      );
    }

    const data = await fetchTikTokUserData(cleanUsername);
    if (!data) {
      return NextResponse.json(
        { valid: false, error: "TikTok account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      username: data.username,
      data,
    });
  } catch (err) {
    console.error("[TikTok Validate Error]", err);
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}
