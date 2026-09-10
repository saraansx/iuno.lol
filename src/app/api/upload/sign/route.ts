import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSessionUserId } from "@/lib/auth/session";
import { uploadRateLimit, uploadPreRateLimit } from "@/lib/rate-limit";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const VIDEO_MIME_TO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preRl = await uploadPreRateLimit(userId);
    if (!preRl.ok) {
      return NextResponse.json(
        { error: `Too many uploads. Please wait ${preRl.retryAfterSeconds} seconds before trying again.` },
        { status: 429 },
      );
    }

    const body = (await req.json().catch(() => null)) as {
      assetType?: string;
      contentType?: string;
      size?: number;
    } | null;

    const { assetType, contentType, size } = body ?? {};
    if (assetType !== "background" || typeof size !== "number") {
      return NextResponse.json({ error: "Invalid upload parameters" }, { status: 400 });
    }

    if (size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size for background is 20MB." },
        { status: 400 },
      );
    }

    const ext = contentType ? VIDEO_MIME_TO_EXT[contentType] : undefined;
    if (!ext || !contentType) {
      return NextResponse.json({ error: "Only MP4/WebM videos allowed." }, { status: 400 });
    }

    const rl = await uploadRateLimit(userId, assetType);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many uploads. Please wait ${rl.retryAfterSeconds} seconds before trying again.` },
        { status: 429 },
      );
    }

    const key = `${userId}/${assetType}/media_${Date.now()}.${ext}`;
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
        ContentLength: size,
        CacheControl: "public, max-age=31536000, immutable",
      }),
      { expiresIn: 120 },
    );

    return NextResponse.json({
      uploadUrl,
      key,
      url: `https://storage.iuno.lol/${key}`,
    });
  } catch (error) {
    console.error("Sign upload error:", error);
    return NextResponse.json({ error: "Failed to prepare upload" }, { status: 500 });
  }
}
