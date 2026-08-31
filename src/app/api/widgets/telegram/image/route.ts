import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["telesco.pe", "telegram.org"],
    key: "telegram_image",
    referer: "https://t.me/",
  });
}
