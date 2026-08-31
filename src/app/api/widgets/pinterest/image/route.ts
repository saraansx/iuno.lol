import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ["pinimg.com", "pinterest.com", "pinimg.cn"],
    key: "pinterest_image",
    referer: "https://www.pinterest.com/",
  });
}
