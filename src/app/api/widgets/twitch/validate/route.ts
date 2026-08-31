import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";
import { fetchTwitchChannelData } from "../channel/[login]/route";

export async function POST(req: NextRequest) {
  try {
    const limited = await widgetRateLimit(req, "twitch_validate", 20);
    if (limited) return limited;

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();
    const cleanUsername = (username || "").trim().toLowerCase();

    if (!cleanUsername || !/^[a-zA-Z0-9_]{3,25}$/.test(cleanUsername)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid Twitch username format (3-25 alphanumeric/underscore)",
      });
    }

    const data = await fetchTwitchChannelData(cleanUsername);
    if (!data) {
      return NextResponse.json({
        ok: false,
        error: `Twitch channel "${cleanUsername}" does not exist.`,
      });
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (err) {
    console.error("[Twitch Validation Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
