import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getImageHostFileAccess } from "@/lib/features/image-host/db";
import { PUBLIC_NAME_RE, isValidUnlockToken, unlockCookieName } from "@/lib/features/image-host/unlock";

export const dynamic = "force-dynamic";

const STORAGE_RE = /^[A-Za-z0-9._-]{1,128}$/;

// Cache policy nginx applies to the file response (Cloudflare honours it)
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

// Called by the host.iuno.lol nginx (auth_request) to map a public file name
// to its upstream storage name. Never reachable without the shared secret.
// The viewer's cookies are forwarded, so password-locked files are only
// resolved for the owner or someone holding a valid unlock cookie.
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!authorized(req)) return new NextResponse(null, { status: 404 });

  const { name } = await params;
  if (!PUBLIC_NAME_RE.test(name)) return new NextResponse(null, { status: 404 });

  try {
    const file = await getImageHostFileAccess(name);
    if (!file?.storageId || !STORAGE_RE.test(file.storageId)) return new NextResponse(null, { status: 404 });

    if (file.passwordHash) {
      const token = (await cookies()).get(unlockCookieName(name))?.value;
      const unlocked =
        isValidUnlockToken(name, file.passwordHash, token) || (await getSessionUserId()) === file.userId;
      if (!unlocked) {
        return new NextResponse(null, { status: 401, headers: { "Cache-Control": "no-store" } });
      }
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
