
export const MAX_HTML_BYTES = 2 * 1024 * 1024;

export async function readBoundedText(
  res: Response,
  maxBytes: number = MAX_HTML_BYTES
): Promise<string | null> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    await res.body?.cancel().catch(() => {});
    return null;
  }

  const body = res.body;
  if (!body) return "";

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let total = 0;

  try {
    while (total <= maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > maxBytes) {
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return text;
  } catch {
    return null;
  } finally {
    await reader.cancel().catch(() => {});
  }
}