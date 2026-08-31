import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

const IG_PROXY_HOST = process.env.INSTAGRAM_PROXY_URL
  ? new URL(process.env.INSTAGRAM_PROXY_URL).hostname.toLowerCase()
  : null;

const ALLOWED_HOSTS = [
  "instagram.com",
  "cdninstagram.com",
  "fbcdn.net",
  ...(IG_PROXY_HOST ? [IG_PROXY_HOST] : []),
];

export async function GET(req: NextRequest) {
  return proxyWidgetImage(req, {
    allowedHosts: ALLOWED_HOSTS,
    key: "instagram_image",
    referer: "https://www.instagram.com/",
  });
}
