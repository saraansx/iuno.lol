import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';
import { razorpayConfigured } from '@/lib/payments/razorpay';
import { polarConfigured } from '@/lib/payments/polar';
import { CDN_BASE, IMAGE_HOST_BASE } from '@/lib/cdn';

export const dynamic = 'force-dynamic';

async function probeMediaHost(base: string): Promise<boolean> {
  try {
    const res = await fetch(base, {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    return res.status < 500;
  } catch (error) {
    console.error(`[health:media] Probe failed for ${base}:`, error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service')?.toLowerCase().trim();

  if (service) {
    switch (service) {
      case 'db':
      case 'database': {
        try {
          await db.execute(sql`SELECT 1`);
          return NextResponse.json({
            status: 'ok',
            service: 'Database (MySQL)',
            responseTimeMs: Date.now() - startTime,
          });
        } catch (error) {
          console.error('[health:db] Check failed:', error);
          return NextResponse.json(
            { status: 'down', service: 'Database (MySQL)' },
            { status: 503 }
          );
        }
      }

      case 'redis':
      case 'cache': {
        try {
          await redis.ping();
          return NextResponse.json({
            status: 'ok',
            service: 'Cache & Rate Limiting (Redis)',
            responseTimeMs: Date.now() - startTime,
          });
        } catch (error) {
          console.error('[health:redis] Check failed:', error);
          return NextResponse.json(
            { status: 'down', service: 'Cache & Rate Limiting (Redis)' },
            { status: 503 }
          );
        }
      }

      case 'stats':
      case 'profiles': {
        try {
          await redis.ping();
          await db.execute(sql`SELECT id FROM users LIMIT 1`);
          return NextResponse.json({
            status: 'ok',
            service: 'Profile & Live Stats',
            responseTimeMs: Date.now() - startTime,
          });
        } catch (error) {
          console.error('[health:stats] Check failed:', error);
          return NextResponse.json(
            { status: 'down', service: 'Profile & Live Stats' },
            { status: 503 }
          );
        }
      }

      case 'media':
      case 'cdn':
      case 'storage': {
        const configured = Boolean(process.env.CATBOX_USERHASH);
        const [hostUp, cdnUp] = await Promise.all([
          probeMediaHost(IMAGE_HOST_BASE),
          probeMediaHost(CDN_BASE),
        ]);
        const up = configured && hostUp && cdnUp;
        return NextResponse.json({
          status: up ? 'ok' : 'down',
          service: 'Image Hosting & CDN',
          responseTimeMs: Date.now() - startTime,
        }, { status: up ? 200 : 503 });
      }

      case 'payments':
      case 'payment':
      case 'gateway': {
        const configured = razorpayConfigured() || polarConfigured();
        return NextResponse.json({
          status: configured ? 'ok' : 'down',
          service: 'Payment Gateway',
          responseTimeMs: Date.now() - startTime,
        }, { status: configured ? 200 : 503 });
      }

      default:
        return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
    }
  }

  const checks: Record<string, 'up' | 'down'> = {
    database: 'down',
    redis: 'down',
  };

  try {
    await db.execute(sql`SELECT 1`);
    checks.database = 'up';
  } catch (error) {
    console.error('[health] Database check failed:', error);
  }

  try {
    await redis.ping();
    checks.redis = 'up';
  } catch (error) {
    console.error('[health] Redis check failed:', error);
  }

  const isHealthy = checks.database === 'up' && checks.redis === 'up';

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      services: checks,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
