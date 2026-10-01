import { NextResponse } from "next/server";
import { requireImageHostUser } from "@/lib/features/image-host/access";
import { IMAGE_HOST_QUOTA_BYTES } from "@/lib/image-host";
import { getImageHostStats } from "@/lib/features/image-host/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireImageHostUser();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const userId = auth.userId;

    const stats = await getImageHostStats(userId);
    return NextResponse.json({ ...stats, quotaBytes: IMAGE_HOST_QUOTA_BYTES });
  } catch (error) {
    console.error("[image-host] Stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
