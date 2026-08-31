import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";
import { fetchPinterestUserData } from "../user/[username]/route";
import { fetchPinterestBoardData } from "../board/[username]/[board]/route";

export async function POST(req: NextRequest) {
  try {
    const limited = await widgetRateLimit(req, "pinterest_validate", 20);
    if (limited) return limited;

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const { type, id } = body;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ ok: false, error: "Identifier is required" });
    }

    if (type === "pinterest-board" || type === "board") {
      const cleanInput = id.trim().replace(/^https?:\/\/(www\.)?pinterest\.[a-z.]+\//i, "").replace(/\/$/, "");
      const parts = cleanInput.split("/").filter(Boolean);
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        return NextResponse.json({ ok: false, error: "Invalid board format. Use 'username/board'" });
      }

      const [user, board] = parts;
      const data = await fetchPinterestBoardData(user.toLowerCase(), board.toLowerCase());
      if (data) {
        return NextResponse.json({ ok: true, data });
      }
      return NextResponse.json({ ok: false, error: "Pinterest board not found or private" });
    }

    const cleanUsername = id
      .trim()
      .replace(/^https?:\/\/(www\.)?pinterest\.[a-z.]+\//i, "")
      .replace(/\/$/, "")
      .replace(/^@/, "")
      .toLowerCase();

    if (!/^[a-zA-Z0-9_]{1,30}$/.test(cleanUsername)) {
      return NextResponse.json({ ok: false, error: "Invalid Pinterest username" });
    }

    const data = await fetchPinterestUserData(cleanUsername);
    if (data) {
      return NextResponse.json({ ok: true, data });
    }

    return NextResponse.json({ ok: false, error: "Pinterest user not found or private" });
  } catch (err) {
    console.error("[Pinterest Validate API Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
