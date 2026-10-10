import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EVI_BASE = "https://evi.wtf";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function GET(req: NextRequest) {
  const limited = await widgetRateLimit(req, "music_artwork", 120);
  if (limited) return limited;

  const id = (req.nextUrl.searchParams.get("id") || "").trim().slice(0, 32);
  const artist = (req.nextUrl.searchParams.get("artist") || "").trim().slice(0, 200);
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing artwork id" }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${EVI_BASE}/api/artwork?id=${encodeURIComponent(id)}&artist=${encodeURIComponent(artist)}`,
      {
        headers: {
          "User-Agent": UA,
          Accept: "image/*",
          ...(process.env.EVI_COOKIE ? { Cookie: process.env.EVI_COOKIE } : {}),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!upstream.ok || !upstream.body) {
      await upstream.body?.cancel();
      return NextResponse.json(
        { ok: false, error: "Artwork upstream failed" },
        { status: 502 },
      );
    }

    const contentType = (upstream.headers.get("content-type") || "").split(";")[0].trim();
    if (!contentType.startsWith("image/")) {
      await upstream.body.cancel();
      return NextResponse.json(
        { ok: false, error: "Artwork upstream failed" },
        { status: 502 },
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[Music Artwork Error]", err);
    return NextResponse.json({ ok: false, error: "Artwork failed" }, { status: 500 });
  }
}
