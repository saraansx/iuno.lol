import { NextRequest, NextResponse } from "next/server";
import { readImageWithLimit, FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cleanUsername = (username || "").trim().toLowerCase();

    if (!cleanUsername || !/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/.test(cleanUsername)) {
      return new NextResponse(null, { status: 400 });
    }

    const res = await fetch(`https://github.com/${encodeURIComponent(cleanUsername)}.png?size=200`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; iuno-avatar-proxy/1.0)",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const buffer = await readImageWithLimit(res);
    if (!buffer) {
      return new NextResponse(null, { status: 413 });
    }
    const contentType = res.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=43500, s-maxage=43500, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[GitHub Avatar Proxy Error]", err);
    return new NextResponse(null, { status: 500 });
  }
}
