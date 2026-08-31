import { NextRequest } from "next/server";
import { proxyWidgetImage } from "@/lib/widget-image-proxy";

// GitHub serves the avatar as a redirect to its CDN, so this goes through the
// shared proxy: every hop is re-validated, the content type is checked, and the
// response carries nosniff.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const cleanUsername = (username || "").trim().toLowerCase();

  if (!cleanUsername || !/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/.test(cleanUsername)) {
    return new Response(null, { status: 400 });
  }

  const url = new URL(req.url);
  url.searchParams.set(
    "url",
    `https://github.com/${encodeURIComponent(cleanUsername)}.png?size=200`
  );

  return proxyWidgetImage(new NextRequest(url, req), {
    allowedHosts: ["github.com", "githubusercontent.com"],
    key: "github_avatar",
  });
}
