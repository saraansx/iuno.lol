import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

const ITEM_CDN = "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["steamstatic.com", "steamcommunity.com", "steampowered.com", "akamaihd.net"],
    key: "steam_image",
    referer: "https://steamcommunity.com/",
    baseUrl: ITEM_CDN,
    extraContentTypes: ["video/webm", "video/mp4"],
    allowRange: true,
    cors: true,
  });
}
