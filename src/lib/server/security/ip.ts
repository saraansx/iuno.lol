/**
 * Extracts client IP address with priority for edge proxy headers.
 * 1. x-real-ip (Vercel / Nginx edge)
 * 2. cf-connecting-ip (Cloudflare)
 * 3. x-vercel-ip (Vercel platform)
 * 4. x-forwarded-for (first IP in proxy chain)
 */
export function getClientIp(headers: Headers | { get(name: string): string | null }): string | null {
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  const cfIp = headers.get('cf-connecting-ip')?.trim();
  if (cfIp && isValidIp(cfIp)) return cfIp;

  const vercelIp = headers.get('x-vercel-ip')?.trim();
  if (vercelIp && isValidIp(vercelIp)) return vercelIp;

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp && isValidIp(firstIp)) return firstIp;
  }

  return null;
}

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45 || ip === 'unknown') return false;
  // Basic sanity check for IPv4 or IPv6
  return /^[0-9a-fA-F:.]+$/.test(ip);
}
