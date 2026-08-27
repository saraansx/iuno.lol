import { NextRequest, NextResponse } from "next/server";
import { readImageWithLimit, FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse(null, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return new NextResponse(null, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowedHost =
      hostname === "i.scdn.co" ||
      hostname.endsWith(".scdn.co") ||
      hostname === "mosaic.scdn.co" ||
      hostname === "image-cdn-ak.spotifycdn.com" ||
      hostname === "image-cdn-fa.spotifycdn.com" ||
      hostname.endsWith(".spotifycdn.com") ||
      hostname.endsWith(".spotify.com");

    if (!isAllowedHost) {
      return new NextResponse(null, { status: 403 });
    }

    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await readImageWithLimit(res);
    if (!buffer) {
      return new NextResponse(null, { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=43500, s-maxage=43500, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[Spotify Image Proxy Error]", err);
    return new NextResponse(null, { status: 500 });
  }
}
