import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSessionUserId } from "@/lib/auth/session";
import { uploadRateLimit } from "@/lib/rate-limit";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function deleteOldFile(userId: number, assetType: string, newKey: string) {
  try {
    const prefix = `${userId}/${assetType}/`;

    const listedObjects = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Prefix: prefix,
      })
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

    for (const item of listedObjects.Contents) {
      if (item.Key && item.Key !== newKey) {
        console.log(`Deleting orphaned S3 object: ${item.Key}`);
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: item.Key,
          })
        );
      }
    }
  } catch (error) {
    console.error("Failed to cleanup old S3 objects:", error);
  }
}

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

  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
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

export async function POST(req: Request) {
  try {
    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > 22 * 1024 * 1024) {
      return NextResponse.json({ error: "Payload too large. Max request size is 20MB." }, { status: 413 });
    }

    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("fileToUpload") as File;
    const assetType = formData.get("assetType") as string;

    if (!file || !["avatar", "background", "banner"].includes(assetType)) {
      return NextResponse.json({ error: "Invalid upload parameters" }, { status: 400 });
    }

    const rl = await uploadRateLimit(userId, assetType);
    if (!rl.ok) {
      return NextResponse.json({ error: `Too many uploads. Please wait ${rl.retryAfterSeconds} seconds before trying again.` }, { status: 429 });
    }

    const maxSize = assetType === "background" ? 20 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024);
      return NextResponse.json({ error: `File too large. Maximum size for ${assetType} is ${limitMB}MB.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Deep binary magic byte verification
    const detected = getRealFileExtension(buffer);
    if (!detected) {
      return NextResponse.json({ error: "Invalid or corrupted media file format." }, { status: 400 });
    }

    const filename = `${userId}/${assetType}/media.${detected.ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: filename,
        Body: buffer,
        ContentType: detected.mime,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    deleteOldFile(userId, assetType, filename).catch((err) => console.error("Failed to delete old file:", err));

    const cacheBuster = Date.now();
    const publicUrl = `https://cdn.iuno.lol/${filename}?v=${cacheBuster}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file to S3" }, { status: 500 });
  }
}
