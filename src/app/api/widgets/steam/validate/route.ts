import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { fetchSteamUserData } from "../user/[id]/route";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;
    const cleanId = (id || "")
      .trim()
      .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "")
      .replace(/\/$/, "");

    if (!cleanId) {
      return NextResponse.json({ ok: false, error: "Steam ID or vanity name required" }, { status: 400 });
    }

    const data = await fetchSteamUserData(cleanId);
    if (!data) {
      return NextResponse.json({ ok: false, error: "Steam profile not found or private" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[Steam Validate Error]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
