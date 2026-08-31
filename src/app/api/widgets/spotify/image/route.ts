import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["scdn.co", "spotifycdn.com", "spotify.com"],
    key: "spotify_image",
  });
}
