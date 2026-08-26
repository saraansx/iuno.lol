import { NextRequest, NextResponse } from "next/server";
import { readImageWithLimit, FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

/**
 * Avatar proxy for the Roblox player widget.
 *
 * Roblox serves avatar thumbnails from `*.rbxcdn.com`, which is not on the CSP
 * `img-src` allow-list and hands a visitor's IP to Roblox if loaded directly.
 * Routing them through here keeps both problems away: the response is
 * same-origin, and the `Cache-Control` header below lets the Cloudflare edge and
 * the visitor's browser hold the bytes so this route is only hit on a cold miss.
 */
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

    if (parsedUrl.protocol !== "https:") {
      return new NextResponse(null, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowedHost =
      hostname === "rbxcdn.com" ||
      hostname.endsWith(".rbxcdn.com") ||
      hostname === "roblox.com" ||
      hostname.endsWith(".roblox.com");

    if (!isAllowedHost) {
      return new NextResponse(null, { status: 403 });
    }

    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Referer: "https://www.roblox.com/",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = await readImageWithLimit(res);
    if (!buffer) {
      return new NextResponse(null, { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[Roblox Image Proxy Error]", err);
    return new NextResponse(null, { status: 500 });
  }
}
