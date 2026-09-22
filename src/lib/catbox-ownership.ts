import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const CATBOX_API = "https://catbox.moe/user/api.php";
const CATBOX_BASE = "https://files.catbox.moe/";

export function catboxFileId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "files.catbox.moe") return null;
    const name = u.pathname.replace(/^\//, "");
    return name || null;
  } catch {
    return null;
  }
}

function isCatboxUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname === "files.catbox.moe";
  } catch {
    return false;
  }
}

/** Record that `userId` owns a Catbox file. Duplicate URLs are re-attributed to this user. */
export async function recordUploadedFile(userId: number, url: string): Promise<void> {
  if (!isCatboxUrl(url)) return;
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
    await fetch(CATBOX_API, { method: "POST", body: form });
  } catch (error) {
    console.error("[Catbox] delete failed:", error);
  }
}

/**
 * Delete Catbox files ONLY if `userId` owns them (uploaded_files row).
 * URLs owned by other users are skipped — prevents User A deleting User B's files.
 */
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

  const fullUrls = candidates.map((f) => `${CATBOX_BASE}${f}`);
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
}
