import { SITE_CONFIG } from "@/lib/config";

export async function purgeCloudflareProfileCache(username: string): Promise<void> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId || !username) return;

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: [`${SITE_CONFIG.url}/${encodeURIComponent(username)}`],
        }),
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) {
      console.error("[Cloudflare] purge failed:", res.status, (await res.text()).slice(0, 200));
    }
  } catch (err) {
    console.error("[Cloudflare] purge error:", err);
  }
}
