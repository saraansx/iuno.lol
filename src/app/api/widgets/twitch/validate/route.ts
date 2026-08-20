import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchTwitchChannelData } from "../channel/[login]/route";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req.headers);
    const rateKey = ip ? `twitch_lookup:ip:${ip}` : `twitch_lookup:user:${sessionUserId}`;
    const rate = await checkRateLimit(rateKey, 15, 60, 60);
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please wait 60 seconds." },
        { status: 429 }
      );
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
