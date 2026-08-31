import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";
import { fetchGenshinPlayerData } from "../player/[uid]/route";

export async function POST(req: NextRequest) {
  try {
    const limited = await widgetRateLimit(req, "genshin_validate", 20);
    if (limited) return limited;

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = await req.json();
    const cleanUid = (uid || "").trim();

    if (!cleanUid || !/^[1-9][0-9]{8,9}$/.test(cleanUid)) {
      return NextResponse.json({ ok: false, error: "Invalid Genshin Impact UID format (must be 9-10 digits)" });
    }

    const data = await fetchGenshinPlayerData(cleanUid);
    if (!data) {
      return NextResponse.json({ ok: false, error: "Genshin player not found on Enka.Network. Check UID." });
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (err) {
    console.error("[Genshin Validation Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
