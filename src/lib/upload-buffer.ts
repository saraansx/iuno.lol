import "server-only";
import "@/lib/net-fix";
import { storagePut } from "@/lib/storage";

export async function uploadUserMedia(
  userId: number,
  buf: Buffer,
  opts: { ext?: string; mime?: string } = {},
): Promise<string | null> {
  const ext = opts.ext ?? "jpg";
  const mime = opts.mime ?? "image/jpeg";

  const stored = await storagePut(buf, { userId, ext, mime });
  return stored?.rawUrl ?? null;
}
