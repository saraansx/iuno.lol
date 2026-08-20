import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseSpotifyIdentifier, type SpotifyItemType } from "@/lib/spotify";
import { fetchSpotifyItem } from "../item/[type]/[id]/route";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req.headers);
    const rateKey = ip ? `spotify_lookup:ip:${ip}` : `spotify_lookup:user:${sessionUserId}`;
    const rate = await checkRateLimit(rateKey, 20, 60, 60);
    if (!rate.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please wait 60 seconds." },
        { status: 429 }
      );
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
