import "server-only";
import "@/lib/net-fix";
import { CDN_BASE, storedFileId } from "@/lib/cdn";
import { purgeCloudflareFiles } from "@/lib/cloudflare";
import { createR2Client, type R2ClientConfig } from "@/lib/r2-storage";

export interface StoragePutResult {
  key: string;
  rawUrl: string;
}

export type R2Settings = R2ClientConfig & { publicBase: string };

function normalizePublicBase(value: string | undefined): string | null {
  const base = value?.trim();
  if (!base) return null;
  try {
    const url = new URL(base);
    if (url.protocol !== "https:") return null;
    const path = url.pathname.replace(/\/+$/, "");
    if (path !== "") return null;
    if (url.search || url.hash) return null;
    return `${url.origin}`;
  } catch {
    return null;
  }
}

export function r2Config(): R2Settings | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  const publicBase = normalizePublicBase(process.env.R2_PUBLIC_BASE);

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  if (!publicBase) {
    if (process.env.R2_PUBLIC_BASE?.trim()) {
      console.error(
        "[storage] R2_PUBLIC_BASE must be a bare https origin (e.g. https://cdn.iuno.lol) with no path",
      );
    }
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBase };
}

export function storageConfigured(): boolean {
  return r2Config() !== null;
}

export function storageRawBase(): string {
  const r2 = r2Config();
  return r2 ? `${r2.publicBase}/` : CDN_BASE;
}

export function storageRawUrl(key: string): string {
  return `${storageRawBase()}${key}`;
}

export function isOwnedStorageKey(userId: number, key: string | null | undefined): boolean {
  return typeof key === "string" && key.startsWith(`u${userId}_`);
}

export function isStorageKeyUsableBy(userId: number, key: string | null | undefined): boolean {
  if (typeof key !== "string" || key.length === 0) return false;
  const match = /^u(\d+)_/.exec(key);
  return !match || Number(match[1]) === userId;
}

function randomKey(userId: number | undefined, ext: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  const prefix = userId ? `u${userId}` : "media";
  return `${prefix}_${Date.now()}_${suffix}.${ext}`;
}

export async function storagePut(
  buf: Buffer,
  opts: { userId?: number; ext?: string; mime?: string } = {},
): Promise<StoragePutResult | null> {
  const r2 = r2Config();
  if (!r2) {
    console.error(
      "[storage] R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
        "R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_BASE.",
    );
    return null;
  }

  const ext = (opts.ext ?? "jpg").replace(/[^A-Za-z0-9]/g, "").toLowerCase() || "jpg";
  const mime = opts.mime ?? "application/octet-stream";
  const key = randomKey(opts.userId, ext);
  const client = createR2Client(r2);
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await client.putObject(key, new Uint8Array(buf), mime);
      if (res.ok) return { key, rawUrl: storageRawUrl(key) };
      const detail = await res.text().catch(() => "");
      console.error(
        `[storage] R2 put rejected (attempt ${attempt}/${MAX_ATTEMPTS}):`,
        res.status,
        detail.slice(0, 200),
      );
    } catch (error) {
      console.error(
        `[storage] R2 put error (attempt ${attempt}/${MAX_ATTEMPTS}):`,
        error instanceof Error ? error.message : error,
      );
    }
    if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, attempt * 1500));
  }

  return null;
}

export interface StorageDeleteResult {
  deleted: string[];
  failed: string[];
}

const R2_DELETE_CONCURRENCY = 6;

export async function storageDeleteKeys(keys: string[]): Promise<StorageDeleteResult> {
  const unique = [...new Set(keys.filter((k) => typeof k === "string" && k.length > 0))];
  if (unique.length === 0) return { deleted: [], failed: [] };

  const r2 = r2Config();
  if (!r2) return { deleted: [], failed: unique };

  const client = createR2Client(r2);
  const deleted: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < unique.length; i += R2_DELETE_CONCURRENCY) {
    const chunk = unique.slice(i, i + R2_DELETE_CONCURRENCY);
    await Promise.all(
      chunk.map(async (key) => {
        try {
          const res = await client.deleteObject(key);
          if (res.ok || res.status === 404) deleted.push(key);
          else failed.push(key);
        } catch {
          failed.push(key);
        }
      }),
    );
  }
  return { deleted, failed };
}

export async function storageDeleteOwned(
  userId: number,
  urls: (string | null | undefined)[],
): Promise<void> {
  const keys = [
    ...new Set(
      urls
        .map((url) => storedFileId(url))
        .filter((key): key is string => Boolean(key))
        .filter((key) => isOwnedStorageKey(userId, key)),
    ),
  ];
  if (keys.length === 0) return;

  const { deleted, failed } = await storageDeleteKeys(keys);
  if (failed.length > 0) {
    console.error(`[storage] ${failed.length}/${keys.length} owned file(s) not deleted from R2`);
  }
  if (deleted.length > 0) {
    await purgeCloudflareFiles(deleted.map((key) => `${CDN_BASE}${key}`));
  }
}

export async function storageFetchObject(key: string, init?: RequestInit): Promise<Response | null> {
  const url = storageRawUrl(key);
  try {
    return await fetch(url, init);
  } catch (error) {
    console.error(`[storage] fetch failed for ${url}:`, error instanceof Error ? error.message : error);
    return null;
  }
}
