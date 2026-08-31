import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["enka.network", "shinshin.moe"],
    key: "genshin_image",
    referer: "https://enka.network/",
  });
}
