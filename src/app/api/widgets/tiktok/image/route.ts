import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: [
      "tiktokcdn.com",
      "tiktokcdn-us.com",
      "tiktok.com",
      "ibyteimg.com",
      "byteoversea.com",
      "muscdn.com",
    ],
    key: "tiktok_image",
    referer: "https://www.tiktok.com/",
    cors: true,
  });
}
