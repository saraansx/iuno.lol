import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit, ipBucket } from "@/lib/rate-limit";
import { ICONIFY_API, brandColorFor, normalizeColorParam } from "@/lib/links";
import { sanitizeSvg } from "@/lib/server/security/svg-sanitize";

const ICON_NAME_RE = /^[a-z0-9]+[a-z0-9-]*:[a-z0-9][a-z0-9-:]*$/i;
const MAX_SVG_BYTES = 100_000;

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

  const tint = normalizeColorParam(searchParams.get("color"));
  const [prefix, ...rest] = name.split(":");
  let upstream: Response;
  try {
    upstream = await fetch(`${ICONIFY_API}/${prefix}/${rest.join(":")}.svg`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(30_000),
    });
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
  if (!raw || raw.length > MAX_SVG_BYTES) {
    console.error("[icons/svg] invalid body:", name);
    return new NextResponse("Invalid icon", { status: 502 });
  }

  const sanitized = sanitizeSvg(raw);
  if (!sanitized.ok) {
    console.warn(`[icons/svg] rejected icon ${name}: ${sanitized.reason}`);
    return new NextResponse("Invalid icon", { status: 422 });
  }

  const svg = sanitized.svg.replace(/currentColor/g, tint ? `#${tint}` : brandColorFor(name));

  return svgResponse(svg);
}

function svgResponse(svg: string) {
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, s-maxage=2592000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
