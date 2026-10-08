export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next) return "/dashboard";

  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//") || next.includes("\\")) return "/dashboard";

  for (let i = 0; i < next.length; i++) {
    const code = next.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return "/dashboard";
  }

  if (next.startsWith("/signin") || next.startsWith("/register")) return "/dashboard";

  return next;
}

export const DISCORD_NEXT_COOKIE = "discord_oauth_next";
