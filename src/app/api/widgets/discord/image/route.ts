import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { readImageWithLimit, FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Image proxy for Discord rich-presence activity assets.
 *
 * Unlike the other widget proxies this one cannot use a host allow-list: an
 * activity's artwork lives wherever the app author put it, so the assets
 * legitimately arrive from arbitrary hosts (see `src/lib/discord-activity-image.ts`
 * for why they have to come through here at all). Accepting arbitrary hosts makes
 * this route an SSRF surface, so in place of an allow-list it enforces:
 *
 *   - https only, with no credentials embedded in the URL
 *   - every address the host resolves to must be public unicast, which puts
 *     loopback, private LAN ranges and cloud metadata endpoints out of reach
 *   - redirects are re-validated hop by hop instead of being followed blindly,
 *     so a public host cannot bounce the request onto an internal one
 *   - the response must declare a raster image type, and is bounded by the
 *     shared size and timeout caps
 *   - a per-IP rate limit, so the route cannot be turned into a bandwidth relay
 *
 * Residual risk: a host that answers with a public address during the check and
 * an internal one when fetched (DNS rebinding). Closing that would mean pinning
 * the checked address into the connection, which `fetch` exposes no hook for;
 * the ranges below still block every fixed internal target.
 */

/** Redirect hops to re-validate before giving up on a URL. */
const MAX_REDIRECTS = 3;

/**
 * Activity artwork is png / jpeg / gif / webp in practice. SVG is deliberately
 * excluded: it can carry script, and served from our own origin it would run
 * against iuno.lol under the site's CSP.
 */
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

/** True for every IPv4 address that is not public unicast. */
function isBlockedIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
    // Unparseable — treat as unsafe rather than guessing.
    return true;
  }

  const [a, b] = octets;
  if (a === 0) return true; // 0.0.0.0/8 "this host"
  if (a === 10) return true; // 10/8 private
  if (a === 127) return true; // loopback
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64/10 carrier NAT
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12 private
  if (a === 192 && b === 0) return true; // 192.0.0/24 protocol assignments
  if (a === 192 && b === 168) return true; // 192.168/16 private
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18/15 benchmarking
  if (a >= 224) return true; // multicast, reserved, broadcast
  return false;
}

/** True for every IPv6 address that is not public unicast. */
function isBlockedIpv6(address: string): boolean {
  const addr = address.toLowerCase().split("%")[0]; // drop any zone index
  if (addr === "::" || addr === "::1") return true; // unspecified, loopback

  // ::ffff:a.b.c.d and ::a.b.c.d embed an IPv4 address — judge it as IPv4.
  const embedded = /^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/.exec(addr);
  if (embedded) return isBlockedIpv4(embedded[1]);

  if (/^f[cd]/.test(addr)) return true; // fc00::/7 unique local
  if (/^fe[89ab]/.test(addr)) return true; // fe80::/10 link-local
  if (/^ff/.test(addr)) return true; // ff00::/8 multicast
  if (addr.startsWith("100:")) return true; // 100::/64 discard-only
  if (addr.startsWith("64:ff9b:")) return true; // NAT64, embeds IPv4
  if (addr.startsWith("2001:0:")) return true; // Teredo, embeds IPv4
  if (addr.startsWith("2001:db8")) return true; // documentation
  if (addr.startsWith("2002:")) return true; // 6to4, embeds IPv4
  return false;
}

/**
 * True when every address the host resolves to is publicly routable.
 *
 * All answers have to pass: a host handing back one public and one internal
 * address would otherwise leave which one `fetch` connects to up to chance.
 */
async function resolvesToPublicHost(hostname: string): Promise<boolean> {
  // A bracketed literal (https://[::1]/x) keeps its brackets in `hostname`.
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

/**
 * Fetches `startUrl`, re-running the protocol and address checks on every
 * redirect target. Returns the upstream response, or a status to reply with.
 */
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
      // Handled below so each hop goes back through the checks above.
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

  return { error: 502 }; // redirect loop
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

  // 120 images a minute per IP. A profile view needs at most two, and repeat
  // views are absorbed by the edge and browser caches, so this only ever bites
  // scripted abuse.
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
      // Redis unreachable — serve the image rather than blank every widget.
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
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[Discord Activity Image Proxy Error]", err);
    return new NextResponse(null, { status: 500 });
  }
}
