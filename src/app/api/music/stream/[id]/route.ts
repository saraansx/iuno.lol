import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EVI_BASE = "https://evi.wtf";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// fail before nginx proxy_read_timeout so client gets JSON, not a hung socket
const UPSTREAM_TIMEOUT_MS = 20_000;

function fetchUpstream(url: string, headers: Record<string, string>) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  return fetch(url, { headers, cache: "no-store", signal: ctrl.signal }).finally(() =>
    clearTimeout(t),
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = await widgetRateLimit(req, "music_stream", 120);
  if (limited) return limited;

  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
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

    // try requested quality, fall back to 128 on timeout/5xx (lighter transcode)
    let upstream: Response | null = null;
    for (const q of quality === "128" ? ["128"] : [quality, "128"]) {
      try {
        const res = await fetchUpstream(
          `${EVI_BASE}/api/stream/${encodeURIComponent(songId)}?quality=${q}`,
          headers,
        );
        if ((res.ok || res.status === 206) && res.body) {
          upstream = res;
          break;
        }
        await res.body?.cancel();
      } catch {
        // timeout/abort — try next quality
      }
    }

    const body = upstream?.body;
    if (!upstream || !body) {
      return NextResponse.json(
        { ok: false, error: "Stream timed out, try again", retryable: true },
        {
          status: 504,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        },
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

    return new NextResponse(body, { status: upstream.status, headers: out });
  } catch (err) {
    console.error("[Music Stream Error]", err);
    return NextResponse.json({ ok: false, error: "Stream failed" }, { status: 500 });
  }
}
