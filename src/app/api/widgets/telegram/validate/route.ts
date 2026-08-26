import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { cleanTelegramUsername, isValidTelegramUsername } from "@/lib/telegram";
import { fetchTelegramUserData } from "../user/[username]/route";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();
    const cleanUsername = cleanTelegramUsername(username);

    if (!isValidTelegramUsername(cleanUsername)) {
      return NextResponse.json({
        ok: false,
        error:
          "Invalid Telegram username format (5-32 characters, letters/numbers/underscore, must start with a letter)",
      });
    }

    const data = await fetchTelegramUserData(cleanUsername);
    if (!data) {
      return NextResponse.json({
        ok: false,
        error: `Telegram profile "${cleanUsername}" does not exist.`,
      });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[Telegram Validation Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
