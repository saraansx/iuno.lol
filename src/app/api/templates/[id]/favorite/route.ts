import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: raw } = await ctx.params;
  const id = parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [tpl] = await db.select({ id: schema.templates.id, isPublic: schema.templates.isPublic, userId: schema.templates.userId }).from(schema.templates).where(eq(schema.templates.id, id)).limit(1);
  if (!tpl) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!tpl.isPublic && tpl.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db
    .insert(schema.templateFavorites)
    .values({ userId, templateId: id })
    .onDuplicateKeyUpdate({ set: { userId } });
  return NextResponse.json({ ok: true, favorited: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: raw } = await ctx.params;
  const id = parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [tpl] = await db.select({ isPublic: schema.templates.isPublic, userId: schema.templates.userId }).from(schema.templates).where(eq(schema.templates.id, id)).limit(1);
  if (tpl && !tpl.isPublic && tpl.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.delete(schema.templateFavorites).where(and(eq(schema.templateFavorites.userId, userId), eq(schema.templateFavorites.templateId, id)));
  return NextResponse.json({ ok: true, favorited: false });
}
