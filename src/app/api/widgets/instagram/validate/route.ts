import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";
import { cleanInstagramUsername, isValidInstagramUsername } from "@/lib/instagram";
import { fetchInstagramUserData } from "../profile/[username]/route";

export async function POST(req: NextRequest) {
  try {
    const limited = await widgetRateLimit(req, "instagram_validate", 20);
    if (limited) return limited;

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ valid: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawUsername = body?.username;

    if (!rawUsername || typeof rawUsername !== "string") {
      return NextResponse.json({ valid: false, error: "Username is required" }, { status: 400 });
    }

    const cleanUsername = cleanInstagramUsername(rawUsername);
    if (!cleanUsername || !isValidInstagramUsername(cleanUsername)) {
      return NextResponse.json(
        { valid: false, error: "Invalid Instagram username format" },
        { status: 400 }
      );
    }

    const data = await fetchInstagramUserData(cleanUsername);
    if (!data) {
      return NextResponse.json(
        { valid: false, error: "Instagram account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ valid: true, username: data.username, data });
  } catch (err) {
    console.error("[Instagram Validate Error]", err);
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
