import { NextResponse } from "next/server";
import { applyTemplate } from "@/actions/templates";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: raw } = await ctx.params;
  const id = parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const r = await applyTemplate(id);
    return NextResponse.json(r);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    const code = msg === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
