import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit } from "@/lib/rate-limit";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const FETCH_TIMEOUT_MS = 30_000;

export async function readImageWithLimit(
  res: Response,
  maxBytes: number = MAX_IMAGE_BYTES
): Promise<ArrayBuffer | null> {
  const declared = res.headers.get("content-length");
  if (declared) {
    const size = Number(declared);
    if (Number.isFinite(size) && size > maxBytes) {
      return null;
    }
  }

  const body = res.body;
  if (!body) {
    const buffer = await res.arrayBuffer();
    return buffer.byteLength > maxBytes ? null : buffer;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const out = new ArrayBuffer(total);
  const view = new Uint8Array(out);
  let offset = 0;
  for (const chunk of chunks) {
    view.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

const MAX_REDIRECTS = 3;

const CACHE_CONTROL = "public, max-age=43380, s-maxage=43380";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const IMAGE_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/apng",
  "image/bmp",
];

const EXT_CONTENT_TYPES: Record<string, string> = {
  ".webm": "video/webm",
  ".mp4": "video/mp4",
};

export interface WidgetProxyOptions {
  allowedHosts?: string[];
  key: string;
  referer?: string;
  extraContentTypes?: string[];
  baseUrl?: string;
  allowRange?: boolean;
  cors?: boolean;
}

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

function isAllowedHost(hostname: string, allowedHosts?: string[]): boolean {
  if (!allowedHosts) return true;
  const host = hostname.toLowerCase();
  return allowedHosts.some((h) => host === h || host.endsWith(`.${h}`));
}

function normalizeUrl(raw: string, baseUrl?: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw, baseUrl);
  } catch {
    return null;
  }

  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  return url;
}

function resolveContentType(url: URL, upstream: string | null, allowed: Set<string>): string | null {
  const type = (upstream || "").split(";")[0].trim().toLowerCase();
  if (allowed.has(type)) return type;

  const dot = url.pathname.lastIndexOf(".");
  const byExt = dot === -1 ? undefined : EXT_CONTENT_TYPES[url.pathname.slice(dot).toLowerCase()];
  return byExt && allowed.has(byExt) ? byExt : null;
}

async function fetchValidated(
  startUrl: URL,
  opts: WidgetProxyOptions,
  range: string | null
): Promise<Response | { error: number }> {
  let target = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isAllowedHost(target.hostname, opts.allowedHosts)) return { error: 403 };
    if (!(await resolvesToPublicHost(target.hostname))) return { error: 403 };

    const headers: Record<string, string> = {
      "User-Agent": BROWSER_UA,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    };
    if (opts.referer) headers.Referer = opts.referer;
    if (range && opts.allowRange) headers.Range = range;

    const res = await fetch(target.toString(), {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      await res.body?.cancel();
      if (!location) return { error: 502 };

      const next = normalizeUrl(location, target.toString());
      if (!next) return { error: 502 };
      target = next;
      continue;
    }

    return res;
  }

  return { error: 502 };
}

export async function proxyWidgetImage(
  req: NextRequest,
  opts: WidgetProxyOptions
): Promise<NextResponse> {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) return new NextResponse(null, { status: 400 });

  const parsed = normalizeUrl(urlParam, opts.baseUrl);
  if (!parsed) return new NextResponse(null, { status: 400 });
  if (!isAllowedHost(parsed.hostname, opts.allowedHosts)) {
    return new NextResponse(null, { status: 403 });
  }

  const ip = getClientIp(req.headers);
  if (ip) {
    try {
      const limit = await checkRateLimit(`${opts.key}:${ip}`, 120, 60);
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
    const range = req.headers.get("range");
    const upstream = await fetchValidated(parsed, opts, range);
    if ("error" in upstream) return new NextResponse(null, { status: upstream.error });

    if (!upstream.ok && !(opts.allowRange && upstream.status === 206)) {
      await upstream.body?.cancel();
      return new NextResponse(null, { status: upstream.status });
    }

    const allowed = new Set([...IMAGE_CONTENT_TYPES, ...(opts.extraContentTypes || [])]);
    const contentType = resolveContentType(parsed, upstream.headers.get("content-type"), allowed);
    if (!contentType) {
      await upstream.body?.cancel();
      return new NextResponse(null, { status: 415 });
    }

    const buffer = await readImageWithLimit(upstream);
    if (!buffer) return new NextResponse(null, { status: 413 });

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": CACHE_CONTROL,
    };
    if (opts.cors) headers["Access-Control-Allow-Origin"] = "*";
    if (opts.allowRange) {
      headers["Accept-Ranges"] = "bytes";
      const contentRange = upstream.headers.get("content-range");
      if (contentRange) headers["Content-Range"] = contentRange;
    }

    return new NextResponse(buffer, { status: upstream.status, headers });
  } catch (err) {
    console.error(`[${opts.key} proxy error]`, err);
    return new NextResponse(null, { status: 500 });
  }
}

