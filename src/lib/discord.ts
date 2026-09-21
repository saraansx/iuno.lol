// Minimal Discord Bot REST helpers (no gateway needed).
// Used for personal recruiter invites: create, inspect, count uses, grant roles.

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

export interface DiscordInvite {
  code: string;
  uses: number;
  channel?: { id: string };
  inviter?: { id: string };
}

export async function fetchInvite(code: string, token: string): Promise<DiscordInvite | null> {
  const res = await botFetch(`/invites/${encodeURIComponent(code)}`, token);
  if (res.status === 404) return null;
  if (!res.ok) throw new DiscordError(`Discord API error (${res.status})`, res.status);
  const data = (await res.json()) as { code?: string; uses?: number; channel?: { id: string } };
  return { code: String(data.code ?? code), uses: Number(data.uses ?? 0), channel: data.channel };
}

export async function listGuildInvites(guildId: string, token: string): Promise<DiscordInvite[]> {
  const res = await botFetch(`/guilds/${guildId}/invites`, token);
  if (res.status === 403) {
    throw new DiscordError("Bot needs the Manage Server permission to count invites.", 403);
  }
  if (!res.ok) throw new DiscordError(`Discord API error (${res.status})`, res.status);
  const data = (await res.json()) as Array<{ code?: string; uses?: number }>;
  if (!Array.isArray(data)) return [];
  return data
    .filter((d) => typeof d.code === "string")
    .map((d) => ({ code: String(d.code), uses: Number(d.uses ?? 0) }));
}

interface GuildChannel {
  id: string;
  type: number;
  name?: string;
  position?: number;
}

const PREFERRED_CHANNEL_NAMES = ["welcome", "general", "chat", "lobby", "main", "general-chat", "invites"];

// Pick a text channel for creating invites (no extra env needed).
async function pickInviteChannels(guildId: string, token: string): Promise<string[]> {
  const res = await botFetch(`/guilds/${guildId}/channels`, token);
  if (!res.ok) throw new DiscordError(`Discord API error (${res.status})`, res.status);
  const data = (await res.json()) as GuildChannel[];
  const text = (Array.isArray(data) ? data : []).filter((c) => c?.type === 0 && typeof c.id === "string");
  text.sort((a, b) => {
    const ai = PREFERRED_CHANNEL_NAMES.indexOf((a.name ?? "").toLowerCase());
    const bi = PREFERRED_CHANNEL_NAMES.indexOf((b.name ?? "").toLowerCase());
    const ar = ai === -1 ? 99 : ai;
    const br = bi === -1 ? 99 : bi;
    if (ar !== br) return ar - br;
    return (a.position ?? 0) - (b.position ?? 0);
  });
  return text.slice(0, 5).map((c) => c.id);
}

export async function createInvite(channelId: string, token: string): Promise<string> {
  const res = await botFetch(`/channels/${channelId}/invites`, token, {
    method: "POST",
    body: JSON.stringify({ max_age: 0, max_uses: 0, temporary: false, unique: true }),
  });
  if (!res.ok) throw new DiscordError(`Discord API error (${res.status})`, res.status);
  const data = (await res.json()) as { code?: string };
  if (!data.code) throw new DiscordError("Discord didn't return an invite code.", res.status);
  return String(data.code);
}

// Create an invite in the first channel that allows it.
export async function createGuildInvite(guildId: string, token: string): Promise<{ code: string; channelId: string }> {
  const channels = await pickInviteChannels(guildId, token);
  let lastStatus = 0;
  for (const channelId of channels) {
    try {
      const code = await createInvite(channelId, token);
      return { code, channelId };
    } catch (e) {
      if (e instanceof DiscordError && (e.status === 403 || e.status === 404)) {
        lastStatus = e.status;
        continue;
      }
      throw e;
    }
  }
  if (lastStatus === 403) {
    throw new DiscordError("Bot needs the Create Invite permission in a text channel.", 403);
  }
  throw new DiscordError("No usable text channel found for invites.", lastStatus);
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
