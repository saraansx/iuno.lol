import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, { key: "discord_activity_image" });
}
