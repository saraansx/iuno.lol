import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { listImageHostActivity } from "@/lib/features/image-host/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
