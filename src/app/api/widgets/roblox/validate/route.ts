import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";
import { cleanRobloxInput, isValidRobloxInput } from "@/lib/roblox";
import { fetchRobloxUserData } from "../user/[input]/route";

export async function POST(req: NextRequest) {
  try {
    const limited = await widgetRateLimit(req, "roblox_validate", 20);
    if (limited) return limited;

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();
    const cleanInput = cleanRobloxInput(username);

    if (!isValidRobloxInput(cleanInput)) {
      return NextResponse.json({
        ok: false,
        error:
          "Invalid Roblox user ID or username (3-20 letters, numbers and underscores)",
      });
    }

    const data = await fetchRobloxUserData(cleanInput);
    if (!data) {
      return NextResponse.json({
        ok: false,
        error: `Roblox profile "${cleanInput}" does not exist.`,
      });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[Roblox Validation Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
