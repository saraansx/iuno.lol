import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EVI_BASE = "https://evi.wtf";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type EviResult = {
  id: string | number;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  year?: number;
  explicit?: boolean;
  cover_art?: string | number | null;
  cover_url?: string | null;
};

export async function GET(req: NextRequest) {
  const limited = await widgetRateLimit(req, "music_search", 120);
  if (limited) return limited;

  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  if (!q) {
    return NextResponse.json(
      { ok: true, results: [] },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  }

  try {
    const upstream = await fetch(`${EVI_BASE}/api/search?q=${encodeURIComponent(q)}`, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        ...(process.env.EVI_COOKIE ? { Cookie: process.env.EVI_COOKIE } : {}),
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      await upstream.body?.cancel();
      return NextResponse.json(
        { ok: false, error: "Search upstream failed" },
        {
          status: 502,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        },
      );
    }

    const data = await upstream.json();
    const list: EviResult[] = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.songs)
        ? data.songs
        : [];

    const results = list.slice(0, 4).map((t) => {
      const id = String(t.id);
      const artist = t.artist || "Unknown artist";
      const artwork =
        t.cover_art !== null && t.cover_art !== undefined && String(t.cover_art) !== ""
          ? `/api/music/artwork?id=${encodeURIComponent(String(t.cover_art))}&artist=${encodeURIComponent(artist)}`
          : typeof t.cover_url === "string" && t.cover_url.startsWith("http")
            ? t.cover_url
            : typeof t.cover_url === "string" && t.cover_url.startsWith("/api/artwork")
              ? `${EVI_BASE}${t.cover_url}`
              : null;
      return {
        id,
        title: t.title || "Untitled",
        artist,
        album: t.album || null,
        duration: typeof t.duration === "number" ? t.duration : null,
        year: typeof t.year === "number" ? t.year : null,
        explicit: Boolean(t.explicit),
        artwork,
        streamUrl: `/api/music/stream/${encodeURIComponent(id)}?quality=320`,
      };
    });

    return NextResponse.json(
      { ok: true, results },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (err) {
    console.error("[Music Search Error]", err);
    return NextResponse.json(
      { ok: false, error: "Search failed" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      },
    );
  }
}
