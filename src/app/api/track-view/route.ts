import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { createHash } from 'crypto';
import { decrypt } from '@/lib/server/security/jwt';
import { getClientIp } from '@/lib/server/security/ip';

const TRACK_VIEW_SCRIPT = `
if redis.call('SET', KEYS[1], '1', 'NX', 'EX', ARGV[1]) then
  redis.call('HINCRBY', KEYS[2], 'total', 1)
  redis.call('HINCRBY', KEYS[2], ARGV[2], 1)
  redis.call('SADD', KEYS[3], ARGV[3])
  return 1
end
return 0
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, fingerprint } = body;

    if (!profileId || typeof profileId !== 'number' || !Number.isInteger(profileId) || profileId < 1) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    const sessionCookie = request.cookies.get('iuno_session')?.value;
    if (sessionCookie) {
      const payload = await decrypt(sessionCookie);
      if (payload && Number(payload.userId) === profileId) {
        return NextResponse.json({ success: true, message: 'Owner view ignored' });
      }
    }

    const ip = getClientIp(request.headers) || 'direct';
    const userAgent = request.headers.get('user-agent') || '';
    const clientFingerprint =
      typeof fingerprint === 'string' && fingerprint.length > 0 ? fingerprint : null;
    const baseString = clientFingerprint ?? ip + userAgent;
    const visitorHash = createHash('sha256').update(baseString).digest('hex').slice(0, 16);

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
      3,
      `v:${profileId}:${visitorHash}`,
      `views_pending:${profileId}`,
      'profiles_with_pending_views',
      '172800',
      device,
      String(profileId),
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
