import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EVI_BASE = "https://evi.wtf";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type EviWord = { word?: string; startTime?: number; endTime?: number };
type EviLine = { words?: EviWord[]; startTime?: number; endTime?: number };

export async function GET(req: NextRequest) {
  const limited = await widgetRateLimit(req, "music_lyrics", 120);
  if (limited) return limited;

  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const p = req.nextUrl.searchParams;
  const id = (p.get("id") || "").trim().slice(0, 32);
  const title = (p.get("title") || "").trim().slice(0, 200);
  const artist = (p.get("artist") || "").trim().slice(0, 200);
  const duration = (p.get("duration") || "").trim().slice(0, 16);
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing song id" }, { status: 400 });
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const qs = new URLSearchParams({ id, title, artist, duration });
    const upstream = await fetch(`${EVI_BASE}/api/lyrics?${qs.toString()}`, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        ...(process.env.EVI_COOKIE ? { Cookie: process.env.EVI_COOKIE } : {}),
      },
      cache: "no-store",
      signal: ctrl.signal,
    });

    if (!upstream.ok) {
      await upstream.body?.cancel();
      return NextResponse.json(
        { ok: false, error: "Lyrics upstream failed" },
        {
          status: 502,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        },
      );
    }

    const data = await upstream.json().catch(() => null);
    const raw: EviLine[] = Array.isArray(data?.lines) ? data.lines : [];
    const lines = raw
      .map((l) => ({
        text: Array.isArray(l.words)
          ? l.words.map((w) => (typeof w.word === "string" ? w.word : "")).join("")
          : "",
        start: typeof l.startTime === "number" ? l.startTime : 0,
        end: typeof l.endTime === "number" ? l.endTime : 0,
      }))
      .map((l) => ({ ...l, text: l.text.trim() }))
      .filter((l) => l.text !== "");

    return NextResponse.json(
      { ok: true, lines },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (err) {
    console.error("[Music Lyrics Error]", err);
    return NextResponse.json(
      { ok: false, error: "Lyrics failed" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}
