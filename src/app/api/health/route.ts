import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service')?.toLowerCase().trim();

  if (service) {
    switch (service) {
      case 'web':
        return NextResponse.json({
          status: 'ok',
          service: 'Website & Dashboard',
          responseTimeMs: Date.now() - startTime,
        });

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
          await db.execute(sql`SELECT 1`);
          return NextResponse.json({
            status: 'ok',
            service: 'Profile & Live Stats API',
            responseTimeMs: Date.now() - startTime,
          });
        } catch (error) {
          console.error('[health:stats] Check failed:', error);
          return NextResponse.json(
            { status: 'down', service: 'Profile & Live Stats API' },
            { status: 503 }
          );
        }
      }

      case 'media':
      case 'storage': {
        const bucket = process.env.AWS_S3_BUCKET_NAME || 'storage.iuno.lol';
        return NextResponse.json({
          status: 'ok',
          service: 'Media Storage (AWS S3)',
          bucket,
          responseTimeMs: Date.now() - startTime,
        });
      }

      case 'cron': {
        return NextResponse.json({
          status: 'ok',
          service: 'Background Cron Jobs',
          schedule: 'daily',
          responseTimeMs: Date.now() - startTime,
        });
      }

      case 'email':
      case 'mail':
      case 'resend': {
        const hasKey = Boolean(process.env.RESEND_API_KEY);
        if (!hasKey) {
          return NextResponse.json(
            { status: 'down', service: 'Email Delivery (Resend)', error: 'RESEND_API_KEY missing' },
            { status: 503 }
          );
        }
        return NextResponse.json({
          status: 'ok',
          service: 'Email Delivery (Resend)',
          provider: 'Resend',
          responseTimeMs: Date.now() - startTime,
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
    }
  }

  const checks: Record<string, 'up' | 'down'> = {
    database: 'down',
    redis: 'down',
    storage: 'up',
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
