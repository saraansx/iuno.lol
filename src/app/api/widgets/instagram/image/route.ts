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
    const igProxyHost = process.env.INSTAGRAM_PROXY_URL
      ? new URL(process.env.INSTAGRAM_PROXY_URL).hostname.toLowerCase()
      : null;
    const isAllowedHost =
      hostname === "instagram.com" ||
      hostname.endsWith(".instagram.com") ||
      hostname === "cdninstagram.com" ||
      hostname.endsWith(".cdninstagram.com") ||
      hostname === "fbcdn.net" ||
      hostname.endsWith(".fbcdn.net") ||
      (igProxyHost !== null && hostname === igProxyHost);

    if (!isAllowedHost) {
      return new NextResponse(null, { status: 403 });
    }

    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[Instagram Image Proxy Error]", err);
    return new NextResponse(null, { status: 500 });
  }
}
