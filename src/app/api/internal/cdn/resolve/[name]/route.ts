import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { resolveCdnStorageId, CDN_PUBLIC_NAME_RE } from "@/lib/cdn-host";

export const dynamic = "force-dynamic";

const STORAGE_RE = /^[A-Za-z0-9._-]{1,128}$/;
const PUBLIC_CACHE = "public, max-age=14400";

function authorized(req: Request): boolean {
  const secret = process.env.IMAGE_HOST_RESOLVE_SECRET;
  const given = req.headers.get("x-resolve-secret");
  if (!secret || !given) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!authorized(req)) return new NextResponse(null, { status: 404 });

  const { name } = await params;
  if (!CDN_PUBLIC_NAME_RE.test(name)) return new NextResponse(null, { status: 404 });

  const publicId = name.slice(0, name.lastIndexOf("."));

  try {
    const storageId = await resolveCdnStorageId(publicId);
    if (!storageId || !STORAGE_RE.test(storageId)) return new NextResponse(null, { status: 404 });

    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-Storage-Id": storageId,
        "X-Cache-Control": PUBLIC_CACHE,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[cdn] Resolve error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
