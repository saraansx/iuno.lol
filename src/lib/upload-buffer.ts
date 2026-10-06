import "server-only";
import "@/lib/net-fix";
import { recordUploadedFile } from "@/lib/catbox-ownership";
import { toHostedCdnUrl } from "@/lib/cdn-host";

const CATBOX_API = "https://catbox.moe/user/api.php";

export async function uploadBufferToCatbox(
  userId: number,
  buf: Buffer,
  opts: { ext?: string; mime?: string } = {},
): Promise<string | null> {
  const userhash = process.env.CATBOX_USERHASH;
  if (!userhash) {
    console.error("[upload-buffer] CATBOX_USERHASH not configured");
    return null;
  }

  const ext = opts.ext ?? "jpg";
  const mime = opts.mime ?? "image/jpeg";

  const MAX_ATTEMPTS = 3;
  let body: string | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("userhash", userhash);
    const blob = new Blob([new Uint8Array(buf)], { type: mime });
    form.append("fileToUpload", blob, `screenshot_${Date.now()}.${ext}`);

    try {
      const res = await fetch(CATBOX_API, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(120000),
      });
      const text = (await res.text()).trim();
      if (res.ok && text.startsWith("https://files.catbox.moe/")) {
        body = text;
        break;
      }
      console.error(
        `[upload-buffer] catbox rejected (attempt ${attempt}/${MAX_ATTEMPTS}):`,
        res.status,
        text.slice(0, 200),
      );
    } catch (e) {
      console.error(
        `[upload-buffer] catbox network error (attempt ${attempt}/${MAX_ATTEMPTS}):`,
        e instanceof Error ? e.message : e,
      );
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }

  if (!body) return null;

  await recordUploadedFile(userId, body);
  return toHostedCdnUrl(body);
}