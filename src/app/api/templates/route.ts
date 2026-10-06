import { NextResponse } from "next/server";
import { createTemplate, listTemplates } from "@/actions/templates";

export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const sort = (searchParams.get("sort") as "newest" | "popular" | null) ?? undefined;
  const tab = (searchParams.get("tab") as "public" | "favorites" | "mine" | null) ?? undefined;
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
  const data = await listTemplates({ q, sort, page, limit, tab });
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, max-age=15, s-maxage=15, stale-while-revalidate=60" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const isPublic = body?.isPublic !== false;
    const result = await createTemplate({ name, isPublic });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    const code = msg === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
