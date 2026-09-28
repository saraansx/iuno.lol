import { NextResponse } from "next/server";
import { checkRateLimit, ipBucket } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/server/security/ip";
import { isPasswordCorrect } from "@/lib/server/security/bcrypt";
import { IMAGE_HOST_BASE } from "@/lib/cdn";
import { getImageHostFileAccess } from "@/lib/features/image-host/db";
import {
  FILE_PASSWORD_MAX,
  PUBLIC_NAME_RE,
  UNLOCK_TTL_SECONDS,
  createUnlockToken,
  unlockCookieName,
} from "@/lib/features/image-host/unlock";

export const dynamic = "force-dynamic";

// Public: a viewer submits a file's password to get a short-lived unlock cookie
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!PUBLIC_NAME_RE.test(name) || !password || password.length > FILE_PASSWORD_MAX) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Per-IP, per-file attempt limit to slow down guessing
    const bucket = ipBucket(`ih:unlock:${name}`, getClientIp(req.headers), 10);
    const rl = await checkRateLimit(bucket.key, bucket.max, 10 * 60);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const file = await getImageHostFileAccess(name);
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const url = `${IMAGE_HOST_BASE}${name}`;
    if (!file.passwordHash) return NextResponse.json({ url });

    if (!(await isPasswordCorrect(password, file.passwordHash))) {
      return NextResponse.json({ error: "Wrong password" }, { status: 403 });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ url });
    res.cookies.set(unlockCookieName(name), createUnlockToken(name, file.passwordHash), {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: UNLOCK_TTL_SECONDS,
      // Shared with host.iuno.lol, where the file is actually served
      ...(isProduction && { domain: ".iuno.lol" }),
    });
    return res;
  } catch (error) {
    console.error("[image-host] Unlock error:", error);
    return NextResponse.json({ error: "Couldn't unlock file" }, { status: 500 });
  }
}
