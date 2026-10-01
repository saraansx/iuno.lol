import { NextResponse } from "next/server";
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

const CATBOX_API = "https://catbox.moe/user/api.php";

export const maxDuration = 60;

function sanitizeName(raw: string): string {
  const cleaned = raw.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 255);
  return cleaned || "upload";
}

export async function POST(req: Request) {
  try {
    const auth = await requireImageHostUser();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const userId = auth.userId;

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

    const usedBefore = await getImageHostUsedBytes(userId);
    if (usedBefore + file.size > IMAGE_HOST_QUOTA_BYTES) {
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

    const userhash = process.env.CATBOX_USERHASH;
    if (!userhash) {
      return NextResponse.json({ error: "Upload storage is not configured." }, { status: 500 });
    }

    const catboxForm = new FormData();
    catboxForm.append("reqtype", "fileupload");
    catboxForm.append("userhash", userhash);
    catboxForm.append("fileToUpload", file.slice(0, file.size, detected.mime), `media_${Date.now()}.${detected.ext}`);

    let catboxRes: Response;
    let body: string;
    try {
      catboxRes = await fetch(CATBOX_API, {
        method: "POST",
        body: catboxForm,
        signal: AbortSignal.timeout(55000),
      });
      body = (await catboxRes.text()).trim();
    } catch (e) {
      console.error("[image-host] Catbox network error:", e);
      return NextResponse.json({ error: "Couldn't reach the upload server. Try again." }, { status: 502 });
    }
    if (!catboxRes.ok || !body.startsWith("https://files.catbox.moe/")) {
      console.error("[image-host] Catbox upload error:", catboxRes.status, body.slice(0, 200));
      return NextResponse.json({ error: "Upload rejected by storage. Try again." }, { status: 502 });
    }

    let verified = false;
    for (let attempt = 0; attempt < 3 && !verified; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
      try {
        const check = await fetch(body, { headers: { Range: "bytes=0-0" }, signal: AbortSignal.timeout(10000) });
        const sample = check.ok || check.status === 206 ? await check.arrayBuffer().catch(() => null) : null;
        if (sample && sample.byteLength > 0) verified = true;
      } catch (e) {
        console.error(`[image-host] Catbox verify attempt ${attempt + 1} error:`, body, e);
      }
    }
    if (!verified) {
      try {
        const del = new FormData();
        del.append("reqtype", "deletefiles");
        del.append("userhash", userhash);
        del.append("files", body.slice("https://files.catbox.moe/".length));
        await fetch(CATBOX_API, { method: "POST", body: del });
      } catch {}
      return NextResponse.json({ error: "Upload got corrupted in transit. Try again." }, { status: 502 });
    }

    const storageId = body.slice("https://files.catbox.moe/".length);
    const url = await recordImageHostFile({
      userId,
      storageId,
      ext: detected.ext,
      name: sanitizeName(file.name),
      size: file.size,
      kind,
    });
    const usedBytes = await getImageHostUsedBytes(userId);

    return NextResponse.json({ url, kind, size: file.size, usedBytes, quotaBytes: IMAGE_HOST_QUOTA_BYTES });
  } catch (error) {
    console.error("[image-host] Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
