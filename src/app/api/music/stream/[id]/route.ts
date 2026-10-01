import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EVI_BASE = "https://evi.wtf";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = await widgetRateLimit(req, "music_stream", 120);
  if (limited) return limited;

  if (!(await getSessionUserId())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const songId = (id || "").trim().slice(0, 32);
  if (!songId) {
    return NextResponse.json({ ok: false, error: "Missing song id" }, { status: 400 });
  }

  const quality = req.nextUrl.searchParams.get("quality") === "128" ? "128" : "320";

  try {
    const headers: Record<string, string> = {
      "User-Agent": UA,
      Accept: "audio/*,*/*",
      ...(process.env.EVI_COOKIE ? { Cookie: process.env.EVI_COOKIE } : {}),
    };
    const range = req.headers.get("range");
    if (range) headers.Range = range;

    const upstream = await fetch(
      `${EVI_BASE}/api/stream/${encodeURIComponent(songId)}?quality=${quality}`,
      { headers, cache: "no-store" },
    );

    if ((!upstream.ok && upstream.status !== 206) || !upstream.body) {
      await upstream.body?.cancel();
      return NextResponse.json(
        { ok: false, error: "Stream upstream failed" },
        { status: 502 },
      );
    }

    const out: Record<string, string> = {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Accept-Ranges": "bytes",
    };
    const passthrough = ["content-type", "content-length", "content-range"];
    for (const h of passthrough) {
      const v = upstream.headers.get(h);
      if (v) out[h === "content-type" ? "Content-Type" : h] = v;
    }
    if (!out["Content-Type"]) out["Content-Type"] = "audio/mpeg";

    return new NextResponse(upstream.body, { status: upstream.status, headers: out });
  } catch (err) {
    console.error("[Music Stream Error]", err);
    return NextResponse.json({ ok: false, error: "Stream failed" }, { status: 500 });
  }
}
