import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getImageHostFileAccess } from "@/lib/features/image-host/db";
import { PUBLIC_NAME_RE } from "@/lib/features/image-host/unlock";

export const dynamic = "force-dynamic";

const STORAGE_RE = /^[A-Za-z0-9._-]{1,128}$/;

const PUBLIC_CACHE = "public, max-age=14400";
const PRIVATE_CACHE = "private, no-store";

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
  if (!PUBLIC_NAME_RE.test(name)) return new NextResponse(null, { status: 404 });

  try {
    const file = await getImageHostFileAccess(name);
    if (!file?.storageId || !STORAGE_RE.test(file.storageId)) return new NextResponse(null, { status: 404 });

    if (file.passwordHash) {
      return new NextResponse(null, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-Storage-Id": file.storageId,
        "X-Cache-Control": file.passwordHash ? PRIVATE_CACHE : PUBLIC_CACHE,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[image-host] Resolve error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
