import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { parseSpotifyIdentifier, type SpotifyItemType } from "@/lib/spotify";
import { fetchSpotifyItem } from "../item/[type]/[id]/route";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { type: expectedType, id: inputId } = await req.json();
    const cleanInput = (inputId || "").trim();

    const parsed = parseSpotifyIdentifier(cleanInput);
    const targetType = (parsed.type || expectedType || "").toLowerCase();
    const targetId = parsed.id || cleanInput;

    if (!["track", "album", "playlist", "artist", "user"].includes(targetType)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid Spotify type selected",
      });
    }

    if (!targetId) {
      return NextResponse.json({
        ok: false,
        error: "Please enter a Spotify link, URI, or ID",
      });
    }

    const data = await fetchSpotifyItem(targetType as SpotifyItemType, targetId);
    if (!data) {
      return NextResponse.json({
        ok: false,
        error: `Could not find Spotify ${targetType}. Please check the ID/link.`,
      });
    }

    return NextResponse.json({
      ok: true,
      data,
      resolvedType: targetType,
      resolvedId: targetId,
    });
  } catch (err) {
    console.error("[Spotify Validation Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
