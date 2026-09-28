import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { imageHostMutateRateLimit } from "@/lib/rate-limit";
import { hashPassword, isPasswordCorrect } from "@/lib/server/security/bcrypt";
import { purgeCloudflareFiles } from "@/lib/cloudflare";
import { getOwnedImageHostFile, setImageHostFilePassword } from "@/lib/features/image-host/db";
import { FILE_PASSWORD_MAX, FILE_PASSWORD_MIN } from "@/lib/features/image-host/unlock";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// Shared auth / rate limit / ownership checks for both handlers
async function load(req: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const rl = await imageHostMutateRateLimit(userId);
  if (!rl.ok) {
    return {
      error: NextResponse.json(
        { error: `Too many requests. Please wait ${rl.retryAfterSeconds} seconds.` },
        { status: 429 },
      ),
    };
  }

  const id = Number((await params).id);
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!Number.isInteger(id) || id <= 0 || !password || password.length > FILE_PASSWORD_MAX) {
    return { error: NextResponse.json({ error: "Invalid request" }, { status: 400 }) };
  }

  const file = await getOwnedImageHostFile(userId, id);
  if (!file) return { error: NextResponse.json({ error: "File not found" }, { status: 404 }) };

  return { userId, id, password, file };
}

// Lock a file with a password
export async function POST(req: Request, ctx: Ctx) {
  try {
    const r = await load(req, ctx);
    if ("error" in r) return r.error;
    if (r.file.passwordHash) {
      return NextResponse.json({ error: "This file already has a password" }, { status: 409 });
    }
    if (r.password.length < FILE_PASSWORD_MIN) {
      return NextResponse.json(
        { error: `Password must be at least ${FILE_PASSWORD_MIN} characters` },
        { status: 400 },
      );
    }

    await setImageHostFilePassword(r.userId, r.id, await hashPassword(r.password));
    // Drop any publicly cached copy so the lock applies immediately
    await purgeCloudflareFiles([r.file.url]);
    return NextResponse.json({ locked: true });
  } catch (error) {
    console.error("[image-host] Set password error:", error);
    return NextResponse.json({ error: "Couldn't add password" }, { status: 500 });
  }
}

// Remove the password; requires the current password
export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const r = await load(req, ctx);
    if ("error" in r) return r.error;
    if (!r.file.passwordHash) return NextResponse.json({ locked: false });

    if (!(await isPasswordCorrect(r.password, r.file.passwordHash))) {
      return NextResponse.json({ error: "Wrong password" }, { status: 403 });
    }

    await setImageHostFilePassword(r.userId, r.id, null);
    return NextResponse.json({ locked: false });
  } catch (error) {
    console.error("[image-host] Remove password error:", error);
    return NextResponse.json({ error: "Couldn't remove password" }, { status: 500 });
  }
}
