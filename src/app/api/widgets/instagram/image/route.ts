import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["cdninstagram.com", "fbcdn.net", "instagram.com"],
    key: "instagram_image",
    referer: "https://www.instagram.com/",
    cors: true,
  });
}
