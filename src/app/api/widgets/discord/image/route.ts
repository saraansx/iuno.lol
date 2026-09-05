import { NextRequest, NextResponse } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";
import { verifyWidgetImageUrl } from "@/lib/server/security/widget-signature";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const signature = req.nextUrl.searchParams.get("sig");

  if (!url || !verifyWidgetImageUrl(url, signature)) {
    return new NextResponse(null, { status: 403 });
  }

  return proxyWidgetImage(req, { key: "discord_activity_image" });
}
