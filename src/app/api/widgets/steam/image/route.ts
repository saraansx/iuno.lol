import { NextRequest, NextResponse } from "next/server";
import { readImageWithLimit, FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

const ALLOWED_HOSTS = [
  "steamstatic.com",
  "steamcommunity.com",
  "steampowered.com",
  "akamaihd.net",
];

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
      "Cache-Control": "public, max-age=43500, s-maxage=43500, stale-while-revalidate=604800",
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
