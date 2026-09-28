import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { resolveImageHostStorageId } from "@/lib/features/image-host/db";

export const dynamic = "force-dynamic";

const NAME_RE = /^[A-Za-z0-9]{12}\.[a-z0-9]{2,5}$/;
const STORAGE_RE = /^[A-Za-z0-9._-]{1,128}$/;

function authorized(req: Request): boolean {
  const secret = process.env.IMAGE_HOST_RESOLVE_SECRET;
  const given = req.headers.get("x-resolve-secret");
  if (!secret || !given) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Called by the host.iuno.lol nginx (auth_request) to map a public file name
// to its upstream storage name. Never reachable without the shared secret.
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!authorized(req)) return new NextResponse(null, { status: 404 });

  const { name } = await params;
  if (!NAME_RE.test(name)) return new NextResponse(null, { status: 404 });

  try {
    const storageId = await resolveImageHostStorageId(name);
    if (!storageId || !STORAGE_RE.test(storageId)) return new NextResponse(null, { status: 404 });
    return new NextResponse(null, {
      status: 200,
      headers: { "X-Storage-Id": storageId, "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[image-host] Resolve error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
