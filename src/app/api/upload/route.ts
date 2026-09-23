import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { uploadRateLimit, uploadPreRateLimit } from "@/lib/rate-limit";
import { recordUploadedFile } from "@/lib/catbox-ownership";
import { toCdnUrl } from "@/lib/cdn";

const CATBOX_API = "https://catbox.moe/user/api.php";

// Video uploads proxy through us to Catbox + verify, so allow extra time.
// Otherwise the function can be killed while the file is already stored,
// leaving the client stuck on "Uploading..." for a file that exists.
export const maxDuration = 60;

function getRealFileExtension(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { ext: "png", mime: "image/png" };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }

  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return { ext: "gif", mime: "image/gif" };
  }

  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }

  const hasFtyp = (offset: number) =>
    buffer.length > offset + 3 &&
    buffer[offset] === 0x66 &&
    buffer[offset + 1] === 0x74 &&
    buffer[offset + 2] === 0x79 &&
    buffer[offset + 3] === 0x70;

  const firstBoxSize = buffer.readUInt32BE(0);
  const dynamicOffset = firstBoxSize - 4;
  if (
    hasFtyp(4) ||
    hasFtyp(8) ||
    hasFtyp(12) ||
    hasFtyp(16) ||
    (dynamicOffset > 3 && dynamicOffset < 64 && hasFtyp(dynamicOffset))
  ) {
    return { ext: "mp4", mime: "video/mp4" };
  }

  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { ext: "webm", mime: "video/webm" };
  }

  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x41 && buffer[9] === 0x56 && buffer[10] === 0x49
  ) {
    return { ext: "avi", mime: "video/x-msvideo" };
  }

  return null;
}

function getAudioExtension(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    return { ext: "mp3", mime: "audio/mpeg" };
  }
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return { ext: "mp3", mime: "audio/mpeg" };
  }
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
    return { ext: "ogg", mime: "audio/ogg" };
  }
  if (buffer[0] === 0x66 && buffer[1] === 0x4c && buffer[2] === 0x61 && buffer[3] === 0x43) {
    return { ext: "flac", mime: "audio/flac" };
  }
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45
  ) {
    return { ext: "wav", mime: "audio/wav" };
  }
  const hasFtyp = (offset: number) =>
    buffer.length > offset + 3 &&
    buffer[offset] === 0x66 &&
    buffer[offset + 1] === 0x74 &&
    buffer[offset + 2] === 0x79 &&
    buffer[offset + 3] === 0x70;
  if (hasFtyp(4) || hasFtyp(8) || hasFtyp(12) || hasFtyp(16)) {
    return { ext: "m4a", mime: "audio/mp4" };
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > 17 * 1024 * 1024) {
      return NextResponse.json({ error: "Payload too large. Maximum file size is 15MB." }, { status: 413 });
    }

    const preRl = await uploadPreRateLimit(userId);
    if (!preRl.ok) {
      return NextResponse.json({ error: `Too many uploads. Please wait ${preRl.retryAfterSeconds} seconds before trying again.` }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("fileToUpload");
    const assetType = formData.get("assetType") as string;

    if (!(file instanceof File) || !["avatar", "background", "banner", "favicon", "cursor", "embed", "track", "artwork", "link-icon"].includes(assetType)) {
      return NextResponse.json({ error: "Invalid upload parameters" }, { status: 400 });
    }

    const rl = await uploadRateLimit(userId, assetType);
    if (!rl.ok) {
      return NextResponse.json({ error: `Too many uploads. Please wait ${rl.retryAfterSeconds} seconds before trying again.` }, { status: 429 });
    }

    const isTinyAsset = assetType === "favicon" || assetType === "cursor" || assetType === "link-icon";
    const maxSize = assetType === "background"
      ? 10 * 1024 * 1024
      : assetType === "track"
      ? 15 * 1024 * 1024
      : isTinyAsset
      ? 1024 * 1024
      : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024);
      return NextResponse.json({ error: `File too large. Maximum size for ${assetType} is ${limitMB}MB.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const detected = assetType === "track" ? getAudioExtension(buffer) : getRealFileExtension(buffer);
    if (!detected) {
      return NextResponse.json({ error: "Invalid or corrupted media file format." }, { status: 400 });
    }

    if ((isTinyAsset || assetType === "embed" || assetType === "artwork" || assetType === "avatar") && !detected.mime.startsWith("image/")) {
      return NextResponse.json({ error: `A ${assetType} must be an image.` }, { status: 400 });
    }

    if (assetType === "link-icon" && detected.mime !== "image/png" && detected.mime !== "image/jpeg" && detected.mime !== "image/webp") {
      return NextResponse.json({ error: "A link-icon must be a static image (PNG, JPG or WebP)." }, { status: 400 });
    }

    const userhash = process.env.CATBOX_USERHASH;
    if (!userhash) {
      return NextResponse.json({ error: "Upload storage is not configured." }, { status: 500 });
    }

    const catboxForm = new FormData();
    catboxForm.append("reqtype", "fileupload");
    catboxForm.append("userhash", userhash);
    catboxForm.append("fileToUpload", new Blob([buffer], { type: detected.mime }), `media_${Date.now()}.${detected.ext}`);

    let catboxRes: Response;
    let body: string;
    try {
      catboxRes = await fetch(CATBOX_API, {
        method: "POST",
        body: catboxForm,
        // Don't hang forever if Catbox is slow — client XHR has a 120s timeout.
        signal: AbortSignal.timeout(55000),
      });
      body = (await catboxRes.text()).trim();
    } catch (e) {
      console.error("Catbox upload network error:", e);
      return NextResponse.json({ error: "Couldn't reach the upload server. Try again." }, { status: 502 });
    }
    if (!catboxRes.ok || !body.startsWith("https://files.catbox.moe/")) {
      console.error("Catbox upload error:", catboxRes.status, body.slice(0, 200));
      return NextResponse.json({ error: "Upload rejected by storage. Try again." }, { status: 502 });
    }

    // Catbox CDN can take a moment to serve a just-uploaded file. Retry the
    // range check a few times before declaring the upload corrupted —
    // otherwise the client sees a failure for a file that is already there.
    let verified = false;
    let lastVerifyStatus = -1;
    for (let attempt = 0; attempt < 3 && !verified; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
      try {
        const check = await fetch(body, {
          headers: { Range: "bytes=0-0" },
          signal: AbortSignal.timeout(10000),
        });
        lastVerifyStatus = check.status;
        const sample =
          check.ok || check.status === 206 ? await check.arrayBuffer().catch(() => null) : null;
        if (sample && sample.byteLength > 0) {
          verified = true;
        }
      } catch (e) {
        console.error(`Catbox upload verify attempt ${attempt + 1} error:`, body, e);
      }
    }
    if (!verified) {
      console.error("Catbox upload verify error:", body, `lastStatus=${lastVerifyStatus}`);
      try {
        const del = new FormData();
        del.append("reqtype", "deletefiles");
        del.append("userhash", userhash);
        del.append("files", body.slice("https://files.catbox.moe/".length));
        await fetch(CATBOX_API, { method: "POST", body: del });
      } catch {}
      return NextResponse.json({ error: "Upload got corrupted in transit. Try again." }, { status: 502 });
    }

    await recordUploadedFile(userId, body);
    return NextResponse.json({ url: toCdnUrl(body) });

  } catch (error) {

    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
