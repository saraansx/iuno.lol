import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { IMAGE_HOST_QUOTA_BYTES } from "@/lib/image-host";
import { getImageHostStats } from "@/lib/features/image-host/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getImageHostStats(userId);
    return NextResponse.json({ ...stats, quotaBytes: IMAGE_HOST_QUOTA_BYTES });
  } catch (error) {
    console.error("[image-host] Stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
