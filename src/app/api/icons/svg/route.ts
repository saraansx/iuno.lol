import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit, ipBucket } from "@/lib/rate-limit";
import { ICONIFY_API, brandColorFor, normalizeColorParam } from "@/lib/links";

const ICON_NAME_RE = /^[a-z0-9]+[a-z0-9-]*:[a-z0-9][a-z0-9-:]*$/i;
const MAX_SVG_BYTES = 100_000;

// In-memory cache so repeat views (and React re-renders) don't refetch
// upstream. CDN immutable headers shield origin beyond a single instance.
const svgCache = new Map<string, { svg: string; at: number }>();
const SVG_CACHE_TTL = 24 * 60 * 60 * 1000;
const SVG_CACHE_MAX = 1000;

function cacheGet(name: string): string | null {
  const hit = svgCache.get(name);
  if (!hit) return null;
  if (Date.now() - hit.at > SVG_CACHE_TTL) {
    svgCache.delete(name);
    return null;
  }
  return hit.svg;
}

function cacheSet(name: string, svg: string) {
  if (svgCache.size >= SVG_CACHE_MAX) {
    const oldest = svgCache.keys().next();
    if (!oldest.done) svgCache.delete(oldest.value);
  }
  svgCache.set(name, { svg, at: Date.now() });
}

export async function GET(req: Request) {
  const h = await headers();
  const ip = getClientIp(h);
  const bucket = ipBucket("icons:svg", ip, 200);
  const rate = await checkRateLimit(bucket.key, bucket.max, 10 * 60);
  if (!rate.ok) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("icon") || "").trim();
  if (!name || name.length > 100 || !ICON_NAME_RE.test(name)) {
    return new NextResponse("Invalid icon", { status: 400 });
  }

  // Optional user tint (validated hex only) — overrides the brand color.
  const tint = normalizeColorParam(searchParams.get("color"));
  const cacheKey = tint ? `${name}|${tint}` : name;

  const cached = cacheGet(cacheKey);
  if (cached) {
    return svgResponse(cached);
  }

  const [prefix, ...rest] = name.split(":");
  let upstream: Response;
  try {
    upstream = await fetch(`${ICONIFY_API}/${prefix}/${rest.join(":")}.svg`);
  } catch (e) {
    console.error("[icons/svg] upstream fetch failed:", name, e);
    return new NextResponse("Not found", { status: 502 });
  }
  if (upstream.status === 404) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!upstream.ok) {
    console.error("[icons/svg] upstream status:", name, upstream.status);
    return new NextResponse("Not found", { status: 502 });
  }

  const raw = await upstream.text();
  if (!raw || raw.length > MAX_SVG_BYTES || !raw.includes("<svg")) {
    console.error("[icons/svg] invalid body:", name);
    return new NextResponse("Invalid icon", { status: 502 });
  }

  // <img> has no inherited text color, so currentColor renders black.
  // Recolor to the user tint, else the brand color (or white fallback).
  // Explicit fills like multicolor logos are untouched.
  const svg = raw.replace(/currentColor/g, tint ? `#${tint}` : brandColorFor(name));

  cacheSet(cacheKey, svg);
  return svgResponse(svg);
}

function svgResponse(svg: string) {
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // SVGs render inside <img> (no scripts run), this only hardens
      // direct navigation to the URL.
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
