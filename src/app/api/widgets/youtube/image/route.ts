import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["ggpht.com", "googleusercontent.com", "ytimg.com", "youtube.com", "google.com"],
    key: "youtube_image",
    referer: "https://www.youtube.com/",
    cors: true,
  });
}
