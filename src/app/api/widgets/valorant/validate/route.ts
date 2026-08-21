import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { fetchValorantPlayerData } from "../player/[name]/[tag]/route";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const { id } = body;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ ok: false, error: "Riot ID is required" });
    }

    const cleanInput = id.trim();
    const parts = cleanInput.split("#");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return NextResponse.json({ ok: false, error: "Invalid format. Use 'name#tag' (e.g. 'tenz#sen')" });
    }

    const [name, tag] = parts;
    if (name.length < 3 || name.length > 16 || tag.length < 3 || tag.length > 5) {
      return NextResponse.json({ ok: false, error: "Invalid Riot ID length" });
    }

    const data = await fetchValorantPlayerData(name, tag);
    if (data) {
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json({ ok: false, error: "Valorant player not found" });
  } catch (err) {
    console.error("[Valorant Validate API Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
