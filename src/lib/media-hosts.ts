const PUBLIC_MEDIA_HOSTS = new Set(["cdn.iuno.lol", "host.iuno.lol"]);

export function isHostedMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return PUBLIC_MEDIA_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}
