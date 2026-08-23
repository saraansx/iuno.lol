/**
 * Shared guard for the widget image proxies.
 *
 * Every proxy fetches an image from an allow-listed CDN and streams it back to
 * the browser. Reading the upstream body with `res.arrayBuffer()` loads the
 * whole response into server memory at once, so a hostile or misbehaving
 * upstream could stream an unbounded body and exhaust memory. This module caps
 * how many bytes a proxy will ever read.
 */

/**
 * Largest image (in bytes) any widget proxy will read from an upstream CDN.
 *
 * Avatars, album art and board thumbnails are all well under 1 MB; 10 MB leaves
 * generous headroom for high-resolution art while still refusing anything large
 * enough to be an abuse vector. Change this one constant to retune every proxy.
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Longest a widget proxy will wait for an upstream CDN before aborting.
 *
 * Without a deadline a slow or hung upstream keeps the request open
 * indefinitely, tying up server resources. 30s is generous for image delivery
 * while still guaranteeing every request eventually terminates. Use it as
 * `AbortSignal.timeout(FETCH_TIMEOUT_MS)` on the outbound fetch. Change this one
 * constant to retune every proxy.
 */
export const FETCH_TIMEOUT_MS = 30_000; // 30 seconds

/**
 * Reads a fetch `Response` body into bytes, refusing anything over `maxBytes`.
 *
 * Enforced two ways so a lying or absent `Content-Length` cannot slip past:
 *   1. If the declared `Content-Length` already exceeds the cap, reject up front
 *      without reading a single byte.
 *   2. Otherwise stream the body and abort the moment the running total crosses
 *      the cap — this catches responses that omit or understate their length.
 *
 * Returns `null` when the limit is exceeded; callers should respond `413`.
 */
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
    // No readable stream (e.g. empty body). The Content-Length check above
    // already bounds this path, but re-check the buffered length to be safe.
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

  // Copy the collected chunks into one contiguous ArrayBuffer. Allocating the
  // ArrayBuffer directly (rather than via a Uint8Array) keeps the return type a
  // plain ArrayBuffer, which is what NextResponse expects as a body.
  const out = new ArrayBuffer(total);
  const view = new Uint8Array(out);
  let offset = 0;
  for (const chunk of chunks) {
    view.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
