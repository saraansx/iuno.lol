import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { deleteTemplate, setTemplateVisibility } from "@/actions/templates";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: raw } = await ctx.params;
  const id = parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await deleteTemplate(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    const code = msg === "Unauthorized" ? 401 : msg === "Not allowed" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status: code });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: raw } = await ctx.params;
  const id = parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const body = await req.json();
    const isPublic = Boolean(body?.isPublic);
    const r = await setTemplateVisibility(id, isPublic);
    return NextResponse.json(r);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    const code = msg === "Unauthorized" ? 401 : msg === "Not allowed" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status: code });
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: raw } = await ctx.params;
  const id = parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [row] = await db
    .select({ id: schema.templates.id, slug: schema.templates.slug, name: schema.templates.name, thumbnailUrl: schema.templates.thumbnailUrl, config: schema.templates.config, isOfficial: schema.templates.isOfficial, useCount: schema.templates.useCount, userId: schema.templates.userId, createdAt: schema.templates.createdAt })
    .from(schema.templates)
    .where(eq(schema.templates.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
