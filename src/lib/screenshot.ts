import "server-only";
import type { Browser } from "puppeteer";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    try {
      const b = await browserPromise;
      if (!b.connected) {
        browserPromise = null;
      }
    } catch {
      browserPromise = null;
    }
  }
  if (!browserPromise) {
    browserPromise = (async () => {
      const puppeteer = (await import("puppeteer")).default;
      return puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--hide-scrollbars",
          "--enable-unsafe-swiftshader",
          "--use-gl=angle",
          "--use-angle=swiftshader",
          "--enable-webgl",
          "--ignore-gpu-blocklist",
        ],
      });
    })();
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

export type ScreenshotOptions = {
  url: string;
  width?: number;
  height?: number;
  settleMs?: number;
};

const MAX_CONCURRENT = 2;
let active = 0;
const waiters: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
  active++;
}

function releaseSlot(): void {
  active--;
  const next = waiters.shift();
  if (next) next();
}

export async function screenshotProfile(opts: ScreenshotOptions): Promise<Buffer> {
  await acquireSlot();
  try {
    return await runScreenshot(opts);
  } finally {
    releaseSlot();
  }
}

async function runScreenshot(opts: ScreenshotOptions): Promise<Buffer> {
  const width = opts.width ?? 1200;
  const height = opts.height ?? 1500;
  const settleMs = opts.settleMs ?? 2800;

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });

    await page.goto(opts.url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await new Promise((r) => setTimeout(r, settleMs));

    const buf = (await page.screenshot({
      type: "jpeg",
      quality: 82,
      fullPage: false,
    })) as Buffer;

    return buf;
  } finally {
    await page.close().catch(() => {});
  }
}