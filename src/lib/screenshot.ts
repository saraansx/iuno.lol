import "server-only";

export type ScreenshotOptions = {
  url: string;
  width?: number;
  height?: number;
  settleMs?: number;
};

export async function screenshotProfile(opts: ScreenshotOptions): Promise<Buffer> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_BROWSER_TOKEN;
  if (!accountId || !token) {
    throw new Error("Screenshot service is not configured.");
  }

  const width = opts.width ?? 1200;
  const height = opts.height ?? 1500;
  const settleMs = opts.settleMs ?? 2800;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/screenshot`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: opts.url,
        viewport: { width, height },
        gotoOptions: { waitUntil: "domcontentloaded", timeout: 30000 },
        waitForTimeout: settleMs,
        screenshotOptions: { type: "jpeg", quality: 82, fullPage: false },
      }),
      signal: AbortSignal.timeout(45000),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudflare screenshot failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error("Cloudflare screenshot returned empty body");
  return buf;
}
