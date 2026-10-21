const TRUSTED_IP_HEADER = 'cf-connecting-ip';

let warned = false;

export function getClientIp(headers: Headers | { get(name: string): string | null }): string | null {
  const raw = headers.get(TRUSTED_IP_HEADER)?.trim();
  if (raw) {
    const first = raw.split(',')[0].trim();
    if (first && isValidIp(first)) return first;
  }

  if (process.env.NODE_ENV !== 'production') return '127.0.0.1';

  if (!warned) {
    warned = true;
    console.error(
      `[security] "${TRUSTED_IP_HEADER}" missing in production — these requests can't be told apart, so they share one rate-limit bucket. Is traffic still routed through Cloudflare?`,
    );
  }
  return null;
}

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45 || ip === 'unknown') return false;
  return /^[0-9a-fA-F:.]+$/.test(ip);
}

export function ipDedupKey(ip: string): string {
  if (!ip.includes(':')) return ip;

  const [head, tail] = ip.toLowerCase().split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const zeros = tail === undefined ? 0 : Math.max(8 - left.length - right.length, 0);
  const groups = [...left, ...Array<string>(zeros).fill('0'), ...right];

  return groups.length >= 4 ? groups.slice(0, 4).join(':') : ip;
}
