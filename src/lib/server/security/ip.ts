const TRUSTED_IP_HEADER = 'cf-connecting-ip';

let warned = false;

export function getClientIp(headers: Headers | { get(name: string): string | null }): string | null {
  const raw = headers.get(TRUSTED_IP_HEADER)?.trim();
  if (raw) {
    const first = raw.split(',')[0].trim();
    if (first && isValidIp(first)) return first;
  }

  // Local dev has no Cloudflare in front of it.
  if (process.env.NODE_ENV !== 'production') return '127.0.0.1';

  if (!warned) {
    warned = true;
    console.error(
      `[security] "${TRUSTED_IP_HEADER}" missing in production — IP-based limits are inactive. Is traffic still routed through Cloudflare?`,
    );
  }
  return null;
}

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45 || ip === 'unknown') return false;
  return /^[0-9a-fA-F:.]+$/.test(ip);
}
