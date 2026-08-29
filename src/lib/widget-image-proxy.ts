
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
