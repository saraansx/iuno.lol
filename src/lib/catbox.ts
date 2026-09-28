import "server-only";
import { toCdnUrl } from "@/lib/cdn";

export { isStoredMediaUrl, isCatboxUrl, storedFileId, toCdnUrl, CATBOX_BASE, CDN_BASE } from "@/lib/cdn";

const CATBOX_API = "https://catbox.moe/user/api.php";
const CATBOX_URL_BASE = "https://files.catbox.moe/";

export async function uploadToCatbox(
  buffer: Buffer,
  filename: string,
  mime: string,
): Promise<string | null> {
  const userhash = process.env.CATBOX_USERHASH;
  if (!userhash) {
    console.error("[Catbox] CATBOX_USERHASH is not configured");
    return null;
  }
  try {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("userhash", userhash);
    form.append("fileToUpload", new Blob([new Uint8Array(buffer)], { type: mime }), filename);
    const res = await fetch(CATBOX_API, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(90000),
    });
    const body = (await res.text()).trim();
    if (!res.ok || !body.startsWith(CATBOX_URL_BASE)) {
      console.error("[Catbox] upload error:", res.status, body.slice(0, 200));
      return null;
    }
    return toCdnUrl(body);
  } catch (error) {
    console.error("[Catbox] upload failed:", error);
    return null;
  }
}
