import "server-only";

import { nerveGetBinary } from "@/lib/nerve";

export type ScreenshotOptions = {
  url: string;
  width?: number;
  height?: number;
  settleMs?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

async function screenshotViaNerve(opts: ScreenshotOptions): Promise<Buffer | null> {
  const width = clamp(opts.width ?? 1200, 320, 3840);
  const height = clamp(opts.height ?? 1500, 240, 2160);
  const delaySeconds = clamp(Math.ceil((opts.settleMs ?? 2800) / 1000), 0, 20);

  return nerveGetBinary(
    "/v1/screenshot",
    {
      url: opts.url,
      width,
      height,
      delay: delaySeconds,
      format: "jpeg",
      quality: 82,
      scale: 1,
    },
    40_000,
  );
}

async function screenshotViaCloudflare(opts: ScreenshotOptions): Promise<Buffer> {
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

export async function screenshotProfile(opts: ScreenshotOptions): Promise<Buffer> {
  const nerveBuf = await screenshotViaNerve(opts).catch((err) => {
    console.warn(
      "[screenshot] Nerve request threw:",
      err instanceof Error ? err.message : err,
    );
    return null;
  });

  if (nerveBuf && nerveBuf.length > 0) return nerveBuf;

  console.warn("[screenshot] Nerve unavailable, falling back to Cloudflare");
  return screenshotViaCloudflare(opts);
}
