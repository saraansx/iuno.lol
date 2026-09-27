import { db, schema } from "@/lib/db";
import { and, eq, inArray } from "drizzle-orm";
import { BADGE_ROLE_MAP } from "@/lib/badge-roles";
import { DiscordError, fetchInvite, grantGuildRole } from "@/lib/discord";

export const RECRUITER_BADGE_ID = "discord-recruiter";
export const RECRUITER_REQUIRED = 10;

const RECRUITER_ROLE_ID = BADGE_ROLE_MAP[RECRUITER_BADGE_ID];

function botConfig(): { base: string; secret: string; guildId: string; botToken: string } {
  const base = (process.env.DISCORD_BOT_URL || "").replace(/\/$/, "");
  const secret = process.env.BOT_API_SECRET || "";
  const guildId = process.env.DISCORD_GUILD_ID || "";
  const botToken = process.env.DISCORD_BOT_TOKEN || "";
  if (!base || !secret || !guildId || !botToken) throw new Error("Discord sync isn't set up yet.");
  return { base, secret, guildId, botToken };
}

async function botFetch(path: string, init?: RequestInit): Promise<unknown> {
  const { base, secret } = botConfig();
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new Error("Couldn't reach the Discord bot. Try again in a bit.");
  }
  if (res.status === 401) throw new Error("Bot auth misconfigured. Tell an admin.");
  if (res.status === 503) throw new Error("Invite tracking isn't ready yet.");
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Something went wrong. Try again in a bit.");
  }
  return res.json();
}

export interface RecruiterState {
  code: string;
  url: string;
  uses: number;
  required: number;
  granted: boolean;
}

function inviteUrl(code: string): string {
  return `https://discord.gg/${code}`;
}

export async function getOrCreateInvite(discordId: string): Promise<{ code: string; uses: number }> {
  const { botToken, guildId } = botConfig();

  const found = (await botFetch(`/recruiter/owner/${discordId}`)) as
    | { code?: string; uses?: number }
    | { none: boolean };
  if (!("none" in found) && typeof found.code === "string" && found.code) {
    let alive = true;
    try {
      alive = (await fetchInvite(found.code, botToken)) !== null;
    } catch {
      alive = true;
    }
    if (alive) return { code: found.code, uses: Number(found.uses ?? 0) };
  }

  const created = (await botFetch(`/recruiter/create`, {
    method: "POST",
    body: JSON.stringify({ owner: discordId, guild_id: guildId, fresh: true }),
  })) as { code?: string; uses?: number };
  if (typeof created.code !== "string" || !created.code) {
    throw new Error("Bot didn't return a valid invite. Try again.");
  }
  return { code: created.code, uses: Number(created.uses ?? 0) };
}

export async function hasInvite(discordId: string): Promise<boolean> {
  try {
    const found = (await botFetch(`/recruiter/owner/${discordId}`)) as
      | { code?: string }
      | { none: boolean };
    return !("none" in found) && typeof found.code === "string" && !!found.code;
  } catch {
    return false;
  }
}

async function hasBadge(userId: number): Promise<boolean> {
  const found = await db
    .select({ id: schema.userBadges.id })
    .from(schema.userBadges)
    .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, RECRUITER_BADGE_ID)))
    .limit(1);
  return found.length > 0;
}

export async function grantRecruiterBadge(userId: number, discordId: string): Promise<boolean> {
  const { botToken, guildId } = botConfig();
  if (!RECRUITER_ROLE_ID) throw new Error("Recruiter role isn't mapped yet.");

  try {
    await grantGuildRole(guildId, discordId, RECRUITER_ROLE_ID, botToken);
  } catch (e) {
    if (e instanceof DiscordError) throw new Error(e.message);
    throw e;
  }

  if (!(await hasBadge(userId))) {
    await db.insert(schema.userBadges).values({
      userId,
      badgeId: RECRUITER_BADGE_ID,
      equipped: false,
      equippedAt: null,
    });
    return true;
  }
  return false;
}

export async function refreshRecruiter(userId: number, discordId: string): Promise<RecruiterState> {
  const { code, uses } = await getOrCreateInvite(discordId);
  let granted = await hasBadge(userId);
  if (!granted && uses >= RECRUITER_REQUIRED) {
    try {
      await grantRecruiterBadge(userId, discordId);
      granted = true;
    } catch {
    }
  }
  return { code, url: inviteUrl(code), uses, required: RECRUITER_REQUIRED, granted };
}

export async function syncAllRecruiterInvites(): Promise<{ checked: number; granted: number }> {
  const owners = (await botFetch(`/recruiter/owners`)) as Record<
    string,
    { uses?: number; owner?: string | null }
  >;

  const qualified = Object.values(owners).filter(
    (v) => Number(v.uses ?? 0) >= RECRUITER_REQUIRED && v.owner
  );
  if (qualified.length === 0) return { checked: Object.keys(owners).length, granted: 0 };

  const discordIds = [...new Set(qualified.map((v) => v.owner as string))];
  const users = await db
    .select({ id: schema.users.id, discordId: schema.users.discordId, username: schema.users.username })
    .from(schema.users)
    .where(inArray(schema.users.discordId, discordIds));
  const userByDiscordId = new Map(users.map((u) => [u.discordId as string, u]));

  let granted = 0;
  for (const discordId of discordIds) {
    const user = userByDiscordId.get(discordId);
    if (!user) continue;
    try {
      if (await grantRecruiterBadge(user.id, discordId)) granted += 1;
    } catch {
      continue;
    }
  }
  return { checked: Object.keys(owners).length, granted };
}
