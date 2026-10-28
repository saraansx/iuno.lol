import { NextResponse } from "next/server";
import "@/lib/net-fix";
import { requireImageHostUser } from "@/lib/features/image-host/access";
import { imageHostMutateRateLimit } from "@/lib/rate-limit";
import { IMAGE_HOST_QUOTA_BYTES } from "@/lib/image-host";
import { purgeCloudflareFiles } from "@/lib/cloudflare";
import { storageDeleteKeys } from "@/lib/storage";
import {
  listImageHostFiles,
  setImageHostFavorite,
  deleteImageHostFiles,
  type ImageHostFilter,
} from "@/lib/features/image-host/db";
import { imageShareBase, toShareUrl } from "@/lib/features/domains";

const FILTERS: ImageHostFilter[] = ["all", "image", "video", "favorite"];
const MAX_IDS = 100;

export const dynamic = "force-dynamic";

function parseIds(raw: unknown): number[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_IDS) return null;
  const ids = new Set<number>();
  for (const v of raw) {
    if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) return null;
    ids.add(v);
  }
  return [...ids];
}

export async function GET(req: Request) {
  try {
    const auth = await requireImageHostUser();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const userId = auth.userId;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "24", 10) || 24, 1), 48);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);
    const filterParam = searchParams.get("filter") as ImageHostFilter | null;
    const filter: ImageHostFilter = filterParam && FILTERS.includes(filterParam) ? filterParam : "all";

    const [{ files, total }, base] = await Promise.all([listImageHostFiles(userId, { limit, offset, filter }), imageShareBase(userId)]);
    return NextResponse.json({ files: files.map((f) => ({ ...f, shareUrl: toShareUrl(f.url, base) })), total, hasMore: offset + files.length < total });
  } catch (error) {
    console.error("[image-host] List files error:", error);
    return NextResponse.json({ error: "Failed to load files" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireImageHostUser();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const userId = auth.userId;

    const rl = await imageHostMutateRateLimit(userId);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rl.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => null);
    const ids = parseIds(body?.ids);
    if (!ids || typeof body?.favorite !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updated = await setImageHostFavorite(userId, ids, body.favorite);
    return NextResponse.json({ ids: updated, favorite: body.favorite });
  } catch (error) {
    console.error("[image-host] Favorite error:", error);
    return NextResponse.json({ error: "Failed to update files" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireImageHostUser();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const userId = auth.userId;

    const rl = await imageHostMutateRateLimit(userId);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rl.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => null);
    const ids = parseIds(body?.ids);
    if (!ids) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { deletedIds, orphanedStorageIds, deletedUrls, usedBytes } = await deleteImageHostFiles(userId, ids);

    if (orphanedStorageIds.length > 0) {
      const result = await storageDeleteKeys(orphanedStorageIds);
      if (result.failed.length > 0) {
        console.error(`[image-host] ${result.failed.length} file(s) not deleted from storage`);
      }
    }

    if (deletedUrls.length > 0) {
      // Also purge the custom-domain copies, or Cloudflare keeps serving deleted files there.
      const base = await imageShareBase(userId);
      await purgeCloudflareFiles([...deletedUrls, ...deletedUrls.map((u) => toShareUrl(u, base))]);
    }

    return NextResponse.json({ deletedIds, usedBytes, quotaBytes: IMAGE_HOST_QUOTA_BYTES });
  } catch (error) {
    console.error("[image-host] Delete error:", error);
    return NextResponse.json({ error: "Failed to delete files" }, { status: 500 });
  }
}
