import { NextResponse } from "next/server";
import { requireImageHostUser } from "@/lib/features/image-host/access";
import { imageHostMutateRateLimit } from "@/lib/rate-limit";
import { hashPassword, isPasswordCorrect } from "@/lib/server/security/bcrypt";
import { purgeCloudflareFiles } from "@/lib/cloudflare";
import { getOwnedImageHostFile, setImageHostFilePassword } from "@/lib/features/image-host/db";
import { FILE_PASSWORD_MAX, FILE_PASSWORD_MIN } from "@/lib/features/image-host/unlock";
import { imageShareBase, toShareUrl } from "@/lib/features/domains";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function load(req: Request, { params }: Ctx) {
  const auth = await requireImageHostUser();
  if (!auth.ok) return { error: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  const userId = auth.userId;

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
    // Purge the custom-domain copy too, or a newly locked file stays public there.
    await purgeCloudflareFiles([r.file.url, toShareUrl(r.file.url, await imageShareBase(r.userId))]);
    return NextResponse.json({ locked: true });
  } catch (error) {
    console.error("[image-host] Set password error:", error);
    return NextResponse.json({ error: "Couldn't add password" }, { status: 500 });
  }
}

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
