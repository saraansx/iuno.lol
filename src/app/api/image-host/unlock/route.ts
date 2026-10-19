import { NextResponse } from "next/server";
import { checkRateLimit, ipBucket } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/server/security/ip";
import { isPasswordCorrect } from "@/lib/server/security/bcrypt";
import { storageFetchObject } from "@/lib/storage";
import { getImageHostFileAccess } from "@/lib/features/image-host/db";
import { FILE_PASSWORD_MAX, PUBLIC_NAME_RE } from "@/lib/features/image-host/unlock";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!PUBLIC_NAME_RE.test(name) || !password || password.length > FILE_PASSWORD_MAX) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const bucket = ipBucket(`ih:unlock:${name}`, getClientIp(req.headers), 10);
    const rl = await checkRateLimit(bucket.key, bucket.max, 10 * 60);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const file = await getImageHostFileAccess(name);
    if (!file?.storageId) return NextResponse.json({ error: "File not found" }, { status: 404 });
    if (file.passwordHash && !(await isPasswordCorrect(password, file.passwordHash))) {
      return NextResponse.json({ error: "Wrong password" }, { status: 403 });
    }

    const upstream = await storageFetchObject(file.storageId, {
      headers: { "User-Agent": "iuno-cdn/1.0" },
      signal: AbortSignal.timeout(55000),
    });
    if (!upstream || !upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "File unavailable. Try again." }, { status: 502 });
    }

    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": "private, no-store",
    });
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    console.error("[image-host] Unlock error:", error);
    return NextResponse.json({ error: "Couldn't unlock file" }, { status: 500 });
  }
}
