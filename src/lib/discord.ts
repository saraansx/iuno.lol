
const API = "https://discord.com/api/v10";

export class DiscordError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function botFetch(path: string, token: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new DiscordError("Couldn't reach Discord. Try again in a bit.", 0);
  }
  return res;
}

export async function fetchInvite(code: string, token: string): Promise<{ code: string } | null> {
  const res = await botFetch(`/invites/${encodeURIComponent(code)}`, token);
  if (res.status === 404) return null;
  if (!res.ok) throw new DiscordError(`Discord API error (${res.status})`, res.status);
  return { code };
}

export async function grantGuildRole(
  guildId: string,
  discordId: string,
  roleId: string,
  token: string
): Promise<void> {
  const res = await botFetch(`/guilds/${guildId}/members/${discordId}/roles/${roleId}`, token, {
    method: "PUT",
  });
  if (res.status === 204 || res.status === 200) return;
  if (res.status === 404) throw new DiscordError("Join the Discord server first, then try again.", 404);
  if (res.status === 403) {
    throw new DiscordError("Bot can't assign the role (check permissions + role order).", 403);
  }
  throw new DiscordError(`Discord API error (${res.status})`, res.status);
}
