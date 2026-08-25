import { NextRequest, NextResponse } from "next/server";
import { readImageWithLimit, FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

/**
 * Steam serves avatars, frames and profile backgrounds from a handful of CDN
 * hosts, and the animated variants are .webm/.mp4 rather than images — hence the
 * Range passthrough below, which lets the browser seek instead of buffering the
 * whole clip.
 */
const ALLOWED_HOSTS = [
  "steamstatic.com",
  "steamcommunity.com",
  "steampowered.com",
  "akamaihd.net",
];

/**
 * Base for the CDN-relative item paths the Steam user route caches (frames,
 * animated avatars, profile backgrounds). Resolution happens *before* the host
 * whitelist below, so a crafted `//evil.com/x` still resolves to a foreign host
 * and is rejected there rather than fetched.
 */
const ITEM_CDN = "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse(null, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl, ITEM_CDN);
    } catch {
      return new NextResponse(null, { status: 400 });
    }

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return new NextResponse(null, { status: 400 });
    }

    // Suffix match on a dot boundary — a bare `includes` would also accept
    // hosts like `steamstatic.com.example.net`.
    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowedHost = ALLOWED_HOSTS.some(
      (h) => hostname === h || hostname.endsWith(`.${h}`)
    );

    if (!isAllowedHost) {
      return new NextResponse(null, { status: 403 });
    }

    const rangeHeader = req.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://steamcommunity.com/",
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const res = await fetch(parsedUrl.href, {
      headers: fetchHeaders,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok && res.status !== 206) {
      return new NextResponse(null, { status: res.status });
    }

    const buffer = await readImageWithLimit(res);
    if (!buffer) {
      return new NextResponse(null, { status: 413 });
    }

    let contentType = res.headers.get("content-type") || "image/png";
    if (parsedUrl.pathname.endsWith(".webm")) contentType = "video/webm";
    if (parsedUrl.pathname.endsWith(".mp4")) contentType = "video/mp4";

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "Accept-Ranges": "bytes",
      "Access-Control-Allow-Origin": "*",
    };

    const contentRange = res.headers.get("content-range");
    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }

    return new NextResponse(buffer, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[Steam Image/Video Proxy Error]", err);
    return new NextResponse(null, { status: 500 });
  }
}
