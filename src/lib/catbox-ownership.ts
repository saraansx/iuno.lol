import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { storedFileId, isStoredMediaUrl, CATBOX_BASE, CDN_BASE } from "@/lib/cdn";
import { purgeCloudflareFiles } from "@/lib/cloudflare";

const CATBOX_API = "https://catbox.moe/user/api.php";

function catboxFileId(url: string | null | undefined): string | null {
  return storedFileId(url);
}

export async function recordUploadedFile(userId: number, url: string): Promise<void> {
  if (!isStoredMediaUrl(url)) return;
  try {
    await db
      .insert(schema.uploadedFiles)
      .values({ userId, url })
      .onDuplicateKeyUpdate({ set: { userId } });
  } catch (error) {
    console.error("[Catbox] failed to record upload:", error);
  }
}

async function deleteFromCatbox(fileIds: string[]): Promise<void> {
  const userhash = process.env.CATBOX_USERHASH;
  if (!userhash || fileIds.length === 0) return;
  try {
    const form = new FormData();
    form.append("reqtype", "deletefiles");
    form.append("userhash", userhash);
    form.append("files", fileIds.join(" "));
    await fetch(CATBOX_API, { method: "POST", body: form, signal: AbortSignal.timeout(15000) });
  } catch (error) {
    console.error("[Catbox] delete failed:", error);
  }
}

export async function deleteOwnedCatboxFiles(
  userId: number,
  urls: (string | null | undefined)[],
): Promise<void> {
  const candidates = [
    ...new Set(
      urls
        .filter((u): u is string => typeof u === "string" && u.length > 0)
        .map((u) => catboxFileId(u))
        .filter((f): f is string => Boolean(f)),
    ),
  ];
  if (candidates.length === 0) return;

  const fullUrls = candidates.flatMap((f) => [`${CATBOX_BASE}${f}`, `${CDN_BASE}${f}`]);
  const owned = await db
    .select({ url: schema.uploadedFiles.url })
    .from(schema.uploadedFiles)
    .where(and(eq(schema.uploadedFiles.userId, userId), inArray(schema.uploadedFiles.url, fullUrls)));

  const ownedIds = owned
    .map((row) => catboxFileId(row.url))
    .filter((f): f is string => Boolean(f));
  if (ownedIds.length === 0) return;

  await deleteFromCatbox(ownedIds);
  await db
    .delete(schema.uploadedFiles)
    .where(and(eq(schema.uploadedFiles.userId, userId), inArray(schema.uploadedFiles.url, fullUrls)));

  await purgeCloudflareFiles(ownedIds.map((f) => `${CDN_BASE}${f}`));
}
