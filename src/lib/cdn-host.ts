import "server-only";
import { randomInt } from "node:crypto";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { CDN_BASE, storedFileId } from "@/lib/cdn";

const PUBLIC_ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const PUBLIC_ID_LENGTH = 5;

export const CDN_PUBLIC_NAME_RE = /^[A-Za-z0-9]{5}\.[a-z0-9]{2,5}$/;

function newPublicId(): string {
  let id = "";
  for (let i = 0; i < PUBLIC_ID_LENGTH; i++) id += PUBLIC_ID_ALPHABET[randomInt(PUBLIC_ID_ALPHABET.length)];
  return id;
}

function isDuplicateKeyError(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "ER_DUP_ENTRY" || e?.cause?.code === "ER_DUP_ENTRY";
}

function extFromId(storageId: string): string {
  const dot = storageId.lastIndexOf(".");
  const ext = dot >= 0 ? storageId.slice(dot + 1).toLowerCase() : "";
  return /^[a-z0-9]{2,5}$/.test(ext) ? ext : "bin";
}

export async function toHostedCdnUrl(url: string): Promise<string> {
  const storageId = storedFileId(url);
  if (!storageId) return url;

  if (url.startsWith(CDN_BASE) && CDN_PUBLIC_NAME_RE.test(storageId)) {
    const [existingByPublic] = await db
      .select({ id: schema.cdnFiles.id })
      .from(schema.cdnFiles)
      .where(eq(schema.cdnFiles.publicId, storageId.slice(0, storageId.lastIndexOf("."))))
      .limit(1);
    if (existingByPublic) return url;
  }

  const [existing] = await db
    .select({ publicId: schema.cdnFiles.publicId, ext: schema.cdnFiles.ext })
    .from(schema.cdnFiles)
    .where(eq(schema.cdnFiles.storageId, storageId))
    .limit(1);
  if (existing) return `${CDN_BASE}${existing.publicId}.${existing.ext}`;

  const ext = extFromId(storageId);
  for (let attempt = 0; ; attempt++) {
    const publicId = newPublicId();
    try {
      await db.insert(schema.cdnFiles).values({ publicId, storageId, ext });
      return `${CDN_BASE}${publicId}.${ext}`;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const [row] = await db
          .select({ publicId: schema.cdnFiles.publicId, ext: schema.cdnFiles.ext })
          .from(schema.cdnFiles)
          .where(eq(schema.cdnFiles.storageId, storageId))
          .limit(1);
        if (row) return `${CDN_BASE}${row.publicId}.${row.ext}`;
        if (attempt < 5) continue;
      }
      throw error;
    }
  }
}

export async function resolveCdnStorageId(publicId: string): Promise<string | null> {
  const [row] = await db
    .select({ storageId: schema.cdnFiles.storageId })
    .from(schema.cdnFiles)
    .where(eq(schema.cdnFiles.publicId, publicId))
    .limit(1);
  return row?.storageId ?? null;
}
