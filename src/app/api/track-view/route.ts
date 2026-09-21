import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { createHash } from 'crypto';
import { decrypt } from '@/lib/server/security/jwt';
import { getClientIp } from '@/lib/server/security/ip';

const TRACK_VIEW_SCRIPT = `
if redis.call('SET', KEYS[1], '1', 'NX') then
  if ARGV[3] == '1' and not redis.call('SET', KEYS[2], '1', 'NX') then
    return 0
  end
  if ARGV[4] == '1' and not redis.call('SET', KEYS[5], '1', 'NX') then
    return 0
  end
  redis.call('HINCRBY', KEYS[3], 'total', 1)
  redis.call('HINCRBY', KEYS[3], ARGV[1], 1)
  redis.call('SADD', KEYS[4], ARGV[2])
  return 1
end
return 0
`;

function shortHash(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, fingerprint } = body;

    if (!profileId || typeof profileId !== 'number' || !Number.isInteger(profileId) || profileId < 1) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    const ip = getClientIp(request.headers);
    if (!ip) {
      return NextResponse.json({ success: true, message: 'Unidentified visitor ignored' });
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

    const userAgent = request.headers.get('user-agent') || '';
    const ipHash = shortHash(`${ip}|${userAgent}`);

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

    const counted = (await redis.eval(
      TRACK_VIEW_SCRIPT,
      5,
      `v:${profileId}:${ipHash}`,
      `v:${profileId}:fp:${fingerprintHash ?? '-'}`,
      `views_pending:${profileId}`,
      'profiles_with_pending_views',
      viewerId !== null ? `v:${profileId}:u:${viewerId}` : `v:${profileId}:u:-`,
      device,
      String(profileId),
      fingerprintHash ? '1' : '0',
      viewerId !== null ? '1' : '0',
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
