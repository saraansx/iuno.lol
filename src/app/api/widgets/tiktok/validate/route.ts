import { NextRequest, NextResponse } from "next/server";
import { cleanTikTokUsername } from "@/lib/tiktok";
import { fetchTikTokUserData } from "../user/[username]/route";

export async function POST(req: NextRequest) {
  try {
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
