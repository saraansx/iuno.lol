import { NextResponse } from "next/server";
import "@/lib/net-fix";
import { requireImageHostUser } from "@/lib/features/image-host/access";
import { imageHostUploadRateLimit } from "@/lib/rate-limit";
import { detectImageOrVideo } from "@/lib/media-signature";
import {
  IMAGE_HOST_MAX_FILE_BYTES,
  IMAGE_HOST_MAX_FILE_MB,
  IMAGE_HOST_QUOTA_BYTES,
  imageHostKind,
} from "@/lib/image-host";
import { recordImageHostFile, getImageHostUsedBytes } from "@/lib/features/image-host/db";
import { imageShareBase, toShareUrl } from "@/lib/features/domains";
import { storageConfigured, storageDeleteKeys, storagePut } from "@/lib/storage";
import { redis } from "@/lib/redis";

export const maxDuration = 300;

function sanitizeName(raw: string): string {
  const cleaned = raw.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 255);
  return cleaned || "upload";
}

export async function POST(req: Request) {
  let userId: number | null = null;
  let reserved = 0;
  try {
    const auth = await requireImageHostUser();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    userId = auth.userId;

    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > IMAGE_HOST_MAX_FILE_BYTES + 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File exceeds the ${IMAGE_HOST_MAX_FILE_MB} MB limit` },
        { status: 413 },
      );
    }

    const rl = await imageHostUploadRateLimit(userId);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many uploads. Please wait ${rl.retryAfterSeconds} seconds before trying again.` },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("fileToUpload");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > IMAGE_HOST_MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds the ${IMAGE_HOST_MAX_FILE_MB} MB limit` },
        { status: 400 },
      );
    }

    const reservedKey = `ih:reserved:${userId}`;
    const reservedTotal = await redis.incrby(reservedKey, file.size);
    reserved = file.size;
    await redis.expire(reservedKey, maxDuration + 30);

    const usedBefore = await getImageHostUsedBytes(userId);
    if (usedBefore + reservedTotal > IMAGE_HOST_QUOTA_BYTES) {
      return NextResponse.json(
        {
          error: "Storage quota exceeded. Delete some files and try again.",
          usedBytes: usedBefore,
          quotaBytes: IMAGE_HOST_QUOTA_BYTES,
        },
        { status: 413 },
      );
    }

    const head = Buffer.from(await file.slice(0, 4096).arrayBuffer());

    const detected = detectImageOrVideo(head);
    const kind = detected ? imageHostKind(detected.mime) : null;
    if (!detected || !kind) {
      return NextResponse.json(
        { error: "Unsupported file. Only images and videos are allowed." },
        { status: 400 },
      );
    }

    if (!storageConfigured()) {
      return NextResponse.json({ error: "Upload storage is not configured." }, { status: 500 });
    }

    const stored = await storagePut(Buffer.from(await file.arrayBuffer()), {
      ext: detected.ext,
      mime: detected.mime,
    });
    if (!stored) {
      return NextResponse.json({ error: "Upload rejected by storage. Try again." }, { status: 502 });
    }

    let verified = false;
    for (let attempt = 0; attempt < 3 && !verified; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
      try {
        const check = await fetch(stored.rawUrl, { headers: { Range: "bytes=0-0" }, signal: AbortSignal.timeout(10000) });
        const sample = check.ok || check.status === 206 ? await check.arrayBuffer().catch(() => null) : null;
        if (sample && sample.byteLength > 0) verified = true;
      } catch (e) {
        console.error(`[image-host] storage verify attempt ${attempt + 1} error:`, stored.rawUrl, e);
      }
    }
    if (!verified) {
      console.error("[image-host] storage verify error:", stored.rawUrl);
      await storageDeleteKeys([stored.key]);
      return NextResponse.json({ error: "Upload got corrupted in transit. Try again." }, { status: 502 });
    }

    const url = await recordImageHostFile({
      userId,
      storageId: stored.key,
      ext: detected.ext,
      name: sanitizeName(file.name),
      size: file.size,
      kind,
    });
    const [usedBytes, base] = await Promise.all([getImageHostUsedBytes(userId), imageShareBase(userId)]);

    return NextResponse.json({ url: toShareUrl(url, base), kind, size: file.size, usedBytes, quotaBytes: IMAGE_HOST_QUOTA_BYTES });
  } catch (error) {
    console.error("[image-host] Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  } finally {
    if (userId !== null && reserved > 0) {
      await redis.decrby(`ih:reserved:${userId}`, reserved).catch(() => {});
    }
  }
}
