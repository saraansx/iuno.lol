import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { uploadRateLimit, uploadPreRateLimit } from "@/lib/rate-limit";
import { recordUploadedFile } from "@/lib/catbox-ownership";
import { toCdnUrl } from "@/lib/cdn";
import { detectImageOrVideo, detectAudio } from "@/lib/media-signature";
import { getUserById } from "@/lib/features/users/db";
import { isPremiumActive } from "@/lib/premium";

const CATBOX_API = "https://catbox.moe/user/api.php";

export const maxDuration = 300;

const PREMIUM_BACKGROUND_MB = 100;

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > (PREMIUM_BACKGROUND_MB + 2) * 1024 * 1024) {
      return NextResponse.json({ error: `Payload too large. Maximum file size is ${PREMIUM_BACKGROUND_MB}MB.` }, { status: 413 });
    }

    const preRl = await uploadPreRateLimit(userId);
    if (!preRl.ok) {
      return NextResponse.json({ error: `Too many uploads. Please wait ${preRl.retryAfterSeconds} seconds before trying again.` }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("fileToUpload");
    const assetType = formData.get("assetType") as string;

    if (!(file instanceof File) || !["avatar", "background", "banner", "favicon", "cursor", "embed", "track", "artwork", "link-icon", "badge"].includes(assetType)) {
      return NextResponse.json({ error: "Invalid upload parameters" }, { status: 400 });
    }

    const rl = await uploadRateLimit(userId, assetType);
    if (!rl.ok) {
      return NextResponse.json({ error: `Too many uploads. Please wait ${rl.retryAfterSeconds} seconds before trying again.` }, { status: 429 });
    }

    const isTinyAsset = assetType === "favicon" || assetType === "cursor" || assetType === "link-icon" || assetType === "badge";
    const premium = assetType === "background" && isPremiumActive(await getUserById(userId));
    const maxSize = assetType === "background"
      ? (premium ? PREMIUM_BACKGROUND_MB : 10) * 1024 * 1024
      : assetType === "track"
      ? 15 * 1024 * 1024
      : isTinyAsset
      ? 1024 * 1024
      : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024);
      const upsell = assetType === "background" && !premium ? ` Premium gets up to ${PREMIUM_BACKGROUND_MB}MB.` : "";
      return NextResponse.json({ error: `File too large. Maximum size for ${assetType} is ${limitMB}MB.${upsell}` }, { status: 400 });
    }

    const head = Buffer.from(await file.slice(0, 4096).arrayBuffer());

    const detected = assetType === "track" ? detectAudio(head) : detectImageOrVideo(head);
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
    catboxForm.append("fileToUpload", file.slice(0, file.size, detected.mime), `media_${Date.now()}.${detected.ext}`);

    let catboxRes: Response;
    let body: string;
    try {
      catboxRes = await fetch(CATBOX_API, {
        method: "POST",
        body: catboxForm,
        signal: AbortSignal.timeout(280000),
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
        await fetch(CATBOX_API, { method: "POST", body: del, signal: AbortSignal.timeout(15000) });
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
