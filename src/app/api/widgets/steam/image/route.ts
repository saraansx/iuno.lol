import { NextRequest, NextResponse } from "next/server";

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
      hostname.endsWith(".steamstatic.com") ||
      hostname.endsWith(".steamcommunity.com") ||
      hostname.endsWith(".akamai.steamstatic.com") ||
      hostname === "steamstatic.com" ||
      hostname === "steamcommunity.com" ||
      hostname.includes("steamstatic");

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

    const res = await fetch(imageUrl, {
      headers: fetchHeaders,
      next: { revalidate: 86400 },
    });

    if (!res.ok && res.status !== 206) {
      return new NextResponse(null, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    let contentType = res.headers.get("content-type") || "image/png";
    if (imageUrl.endsWith(".webm")) contentType = "video/webm";
    if (imageUrl.endsWith(".mp4")) contentType = "video/mp4";

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
