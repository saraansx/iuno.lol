import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["mzstatic.com"],
    key: "apple_music_image",
    referer: "https://music.apple.com/",
    cors: true,
  });
}
