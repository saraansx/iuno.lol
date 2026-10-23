import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["sndcdn.com", "soundcloud.com"],
    key: "soundcloud_image",
    referer: "https://soundcloud.com/",
    cors: true,
  });
}
