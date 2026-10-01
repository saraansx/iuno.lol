import { NextResponse } from "next/server";
import { requireImageHostUser } from "@/lib/features/image-host/access";
import { listImageHostActivity } from "@/lib/features/image-host/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireImageHostUser();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const userId = auth.userId;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "5", 10) || 5, 1), 25);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    const { items, total } = await listImageHostActivity(userId, { limit, offset });
    return NextResponse.json({ items, total, hasMore: offset + items.length < total });
  } catch (error) {
    console.error("[image-host] Activity error:", error);
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
  }
}
