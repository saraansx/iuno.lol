import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';
import { razorpayConfigured } from '@/lib/payments/razorpay';
import { polarConfigured } from '@/lib/payments/polar';
import { CDN_BASE, IMAGE_HOST_BASE } from '@/lib/cdn';

export const dynamic = 'force-dynamic';

const WIDGET_UPSTREAMS = [
  'https://discord.com/api/v10/gateway',
  'https://api.github.com',
  'https://open.spotify.com',
];

const CHECK_CACHE_MS = 30_000;
const checkResults = new Map<string, { up: boolean; at: number }>();

async function cached(key: string, check: () => Promise<boolean>, ttlMs = CHECK_CACHE_MS): Promise<boolean> {
  const hit = checkResults.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.up;
  const up = await check();
  checkResults.set(key, { up, at: Date.now() });
  return up;
}

async function probe(url: string, init: RequestInit = {}): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      ...init,
    });
    return res.status < 500;
  } catch (error) {
    console.error(`[health] Probe failed for ${url}:`, error);
    return false;
  }
}

const CORE_CHECK_CACHE_MS = 10_000;

async function checkDatabase(): Promise<boolean> {
  return cached('db', async () => {
    try {
      await db.execute(sql`SELECT id FROM users LIMIT 1`);
      return true;
    } catch (error) {
      console.error('[health:db] Check failed:', error);
      return false;
    }
  }, CORE_CHECK_CACHE_MS);
}

async function checkCache(): Promise<boolean> {
  return cached('redis', async () => {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      console.error('[health:cache] Check failed:', error);
      return false;
    }
  }, CORE_CHECK_CACHE_MS);
}

async function checkMedia(): Promise<boolean> {
  if (!process.env.CATBOX_USERHASH) return false;
  return cached('media', async () => {
    const [hostUp, cdnUp] = await Promise.all([probe(IMAGE_HOST_BASE), probe(CDN_BASE)]);
    return hostUp && cdnUp;
  });
}

async function checkPayments(): Promise<boolean> {
  return cached('payments', async () => {
    const checks: Promise<boolean>[] = [];
    if (razorpayConfigured()) checks.push(probe('https://api.razorpay.com/v1/', { method: 'GET' }));
    if (polarConfigured()) checks.push(probe('https://api.polar.sh/', { method: 'GET' }));
    const results = await Promise.all(checks);
    return results.some(Boolean);
  });
}

async function checkEmail(): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  return cached('email', async () => {
    try {
      const res = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return true;
      if (res.status === 401) {
        const body = (await res.json().catch(() => null)) as { name?: string } | null;
        return body?.name === 'restricted_api_key';
      }
      return false;
    } catch (error) {
      console.error('[health:email] Check failed:', error);
      return false;
    }
  });
}

async function checkWidgets(): Promise<boolean> {
  return cached('widgets', async () => {
    const results = await Promise.all(WIDGET_UPSTREAMS.map((url) => probe(url, { method: 'GET' })));
    return results.every(Boolean);
  });
}

async function checkProfiles(): Promise<boolean> {
  const [dbUp, cacheUp] = await Promise.all([checkDatabase(), checkCache()]);
  return dbUp && cacheUp;
}

const SERVICES: Record<string, { label: string; check: () => Promise<boolean> }> = {
  db: { label: 'Database', check: checkDatabase },
  redis: { label: 'Cache', check: checkCache },
  stats: { label: 'Profile & Live Stats', check: checkProfiles },
  media: { label: 'Image Hosting & CDN', check: checkMedia },
  payments: { label: 'Payment Gateway', check: checkPayments },
  email: { label: 'Email Delivery', check: checkEmail },
  widgets: { label: 'Profile Widgets', check: checkWidgets },
};

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const serviceKey = request.nextUrl.searchParams.get('service')?.toLowerCase().trim();

  if (serviceKey) {
    const service = SERVICES[serviceKey];
    if (!service) {
      return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
    }

    const up = await service.check();
    return NextResponse.json(
      { status: up ? 'ok' : 'down', service: service.label, responseTimeMs: Date.now() - startTime },
      { status: up ? 200 : 503, headers: NO_STORE },
    );
  }

  const [dbUp, cacheUp] = await Promise.all([checkDatabase(), checkCache()]);
  const isHealthy = dbUp && cacheUp;

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      services: { database: dbUp ? 'up' : 'down', cache: cacheUp ? 'up' : 'down' },
    },
    { status: isHealthy ? 200 : 503, headers: NO_STORE },
  );
}
