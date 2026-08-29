import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { readImageWithLimit, FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_REDIRECTS = 3;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/apng",
  "image/bmp",
]);

function isBlockedIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
    return true;
  }

  const [a, b] = octets;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 0) return true;
  if (a === 192 && b === 168) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}

function isBlockedIpv6(address: string): boolean {
  const addr = address.toLowerCase().split("%")[0];
  if (addr === "::" || addr === "::1") return true;

  const embedded = /^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/.exec(addr);
  if (embedded) return isBlockedIpv4(embedded[1]);

  if (/^f[cd]/.test(addr)) return true;
  if (/^fe[89ab]/.test(addr)) return true;
  if (/^ff/.test(addr)) return true;
  if (addr.startsWith("100:")) return true;
  if (addr.startsWith("64:ff9b:")) return true;
  if (addr.startsWith("2001:0:")) return true;
  if (addr.startsWith("2001:db8")) return true;
  if (addr.startsWith("2002:")) return true;
  return false;
}

async function resolvesToPublicHost(hostname: string): Promise<boolean> {
  const host = hostname.replace(/^\[|\]$/g, "");

  let records: Array<{ address: string; family: number }>;
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    return false;
  }

  if (records.length === 0) return false;
  return records.every((record) =>
    record.family === 6 ? !isBlockedIpv6(record.address) : !isBlockedIpv4(record.address)
  );
}

function isFetchableUrl(url: URL): boolean {
  return url.protocol === "https:" && !url.username && !url.password;
}

async function fetchValidatedImage(startUrl: URL): Promise<Response | { error: number }> {
  let target = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isFetchableUrl(target)) return { error: 400 };
    if (!(await resolvesToPublicHost(target.hostname))) return { error: 403 };

    const res = await fetch(target.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      await res.body?.cancel();
      if (!location) return { error: 502 };
      try {
        target = new URL(location, target);
      } catch {
        return { error: 502 };
      }
      continue;
    }

    return res;
  }

  return { error: 502 };
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return new NextResponse(null, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(urlParam);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (!isFetchableUrl(parsed)) {
    return new NextResponse(null, { status: 400 });
  }

  const ip = getClientIp(req.headers);
  if (ip) {
    try {
      const limit = await checkRateLimit(`discord_activity_image:${ip}`, 120, 60, 60);
      if (!limit.ok) {
        return new NextResponse(null, {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        });
      }
    } catch {
    }
  }

  try {
    const upstream = await fetchValidatedImage(parsed);
    if ("error" in upstream) {
      return new NextResponse(null, { status: upstream.error });
    }

    if (!upstream.ok) {
      await upstream.body?.cancel();
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      await upstream.body?.cancel();
      return new NextResponse(null, { status: 415 });
    }

    const buffer = await readImageWithLimit(upstream);
    if (!buffer) {
      return new NextResponse(null, { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=43500, s-maxage=43500, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[Discord Activity Image Proxy Error]", err);
    return new NextResponse(null, { status: 500 });
  }
}
  