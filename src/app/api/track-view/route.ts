import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { createHash } from 'crypto';
import { decrypt } from '@/lib/server/security/jwt';
import { getClientIp, ipDedupKey } from '@/lib/server/security/ip';
import { viewTrackRateLimit } from '@/lib/rate-limit';
import { SITE_CONFIG } from '@/lib/config';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

const VIEW_DEDUP_TTL_SECONDS = 60 * 60 * 24 * 7;

const SITE_ORIGIN = new URL(SITE_CONFIG.url).origin;

const ALLOWED_ORIGINS = new Set([SITE_ORIGIN, SITE_ORIGIN.replace('://', '://www.')]);

const AUTOMATION_UA =
  /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|discordbot|telegrambot|curl|wget|python-requests|python-urllib|go-http|okhttp|axios|node-fetch|headlesschrome|phantomjs|selenium|puppeteer|playwright/i;

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin);
}

function looksLikeRealBrowser(request: NextRequest): boolean {
  const userAgent = (request.headers.get('user-agent') || '').trim();
  if (!userAgent || AUTOMATION_UA.test(userAgent)) return false;

  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') return false;

  const origin = request.headers.get('origin');
  if (origin && !isAllowedOrigin(origin)) return false;

  return true;
}

const TRACK_VIEW_SCRIPT = `
if redis.call('SET', KEYS[1], '1', 'NX', 'EX', ARGV[5]) then
  if ARGV[3] == '1' and not redis.call('SET', KEYS[2], '1', 'NX', 'EX', ARGV[5]) then
    return 0
  end
  if ARGV[4] == '1' and not redis.call('SET', KEYS[5], '1', 'NX', 'EX', ARGV[5]) then
    return 0
  end
  redis.call('HINCRBY', KEYS[3], 'total', 1)
  redis.call('HINCRBY', KEYS[3], ARGV[1], 1)
  redis.call('SADD', KEYS[4], ARGV[2])
  if ARGV[6] ~= '-' then
    redis.call('HINCRBY', KEYS[6], ARGV[6], 1)
  end
  return 1
end
return 0
`;

function shortHash(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

async function profileExists(profileId: number): Promise<boolean> {
  const cacheKey = `profile_exists:${profileId}`;
  const cached = await redis.get(cacheKey);
  if (cached !== null) return cached === '1';

  const [row] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.id, profileId))
    .limit(1);

  const exists = !!row;
  await redis.set(cacheKey, exists ? '1' : '0', 'EX', exists ? 60 * 60 : 60 * 5);
  return exists;
}

export async function POST(request: NextRequest) {
  try {
    if (!looksLikeRealBrowser(request)) {
      return NextResponse.json({ success: true, message: 'Ignored' });
    }

    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
    }

    const body = await request.json();
    const { profileId, fingerprint } = body;

    if (!profileId || typeof profileId !== 'number' || !Number.isInteger(profileId) || profileId < 1) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    const ip = getClientIp(request.headers);
    if (!ip) {
      return NextResponse.json({ success: true, message: 'Unidentified visitor ignored' });
    }

    const ipRate = await viewTrackRateLimit(ip);
    if (!ipRate.ok) {
      return NextResponse.json(
        { success: true, message: 'Too many views from this network' },
        { status: 429, headers: { 'Retry-After': String(ipRate.retryAfterSeconds) } },
      );
    }

    const sessionCookie = request.cookies.get('iuno_session')?.value;
    let viewerId: number | null = null;
    if (sessionCookie) {
      const payload = await decrypt(sessionCookie);
      const id = Number(payload?.userId);
      if (Number.isInteger(id) && id > 0) viewerId = id;
    }
    if (viewerId !== null && viewerId === profileId) {
      return NextResponse.json({ success: true, message: 'Owner view ignored' });
    }

    if (!(await profileExists(profileId))) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const ipHash = shortHash(ipDedupKey(ip));

    const fingerprintHash =
      typeof fingerprint === 'string' && fingerprint.length > 0 && fingerprint.length <= 128
        ? shortHash(fingerprint)
        : null;

    const ua = userAgent.toLowerCase();
    let device = 'other';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      device = 'ios';
    } else if (ua.includes('android')) {
      device = 'android';
    } else if (ua.includes('windows')) {
      device = 'windows';
    } else if (ua.includes('macintosh') || ua.includes('mac os')) {
      device = 'mac';
    }

    const rawCountry = (request.headers.get('cf-ipcountry') || '').trim().toUpperCase();
    const country = /^[A-Z]{2}$/.test(rawCountry) && rawCountry !== 'XX' && rawCountry !== 'T1'
      ? rawCountry
      : '-';

    const counted = (await redis.eval(
      TRACK_VIEW_SCRIPT,
      6,
      `v:${profileId}:${ipHash}`,
      `v:${profileId}:fp:${fingerprintHash ?? '-'}`,
      `views_pending:${profileId}`,
      'profiles_with_pending_views',
      viewerId !== null ? `v:${profileId}:u:${viewerId}` : `v:${profileId}:u:-`,
      `views_country_pending:${profileId}`,
      device,
      String(profileId),
      fingerprintHash ? '1' : '0',
      viewerId !== null ? '1' : '0',
      String(VIEW_DEDUP_TTL_SECONDS),
      country,
    )) as number;

    if (counted !== 1) {
      return NextResponse.json({ success: true, message: 'Already viewed recently' });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[views] Redis tracking failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
