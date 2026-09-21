import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { BADGE_ROLE_MAP } from "@/lib/badge-roles";
import {
  DiscordError,
  createGuildInvite,
  fetchInvite,
  grantGuildRole,
  listGuildInvites,
} from "@/lib/discord";

export const RECRUITER_BADGE_ID = "discord-recruiter";
export const RECRUITER_REQUIRED = 5;

const RECRUITER_ROLE_ID = BADGE_ROLE_MAP[RECRUITER_BADGE_ID];

function requireDiscordEnv(): { botToken: string; guildId: string } {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!botToken || !guildId) throw new Error("Discord sync isn't set up yet.");
  return { botToken, guildId };
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

// Live counts from the bot (accurate: unique current members, leaves
// decrement). Null when the bot API is unreachable — callers fall back
// to Discord REST counts.
async function getBotUsesByCode(): Promise<Map<string, number> | null> {
  const botUrl = (process.env.DISCORD_BOT_URL || "").replace(/\/$/, "");
  if (!botUrl) return null;
  try {
    const res = await fetch(`${botUrl}/recruiter/invites`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, { uses?: number }>;
    if (!data || typeof data !== "object") return null;
    return new Map(
      Object.entries(data).map(([code, v]) => [code, Number(v?.uses ?? 0)])
    );
  } catch {
    return null;
  }
}

// Ensure the user has a fixed personal invite; returns it with fresh use count.
export async function getOrCreateInvite(userId: number): Promise<{ code: string; uses: number }> {
  const { botToken, guildId } = requireDiscordEnv();

  const rows = await db
    .select()
    .from(schema.discordInvites)
    .where(eq(schema.discordInvites.userId, userId))
    .limit(1);
  const existing = rows[0] ?? null;

  let code: string | null = existing?.code ?? null;
  let channelId: string | null = existing?.channelId ?? null;

  // Validate the saved code — recreate if deleted/expired.
  if (code) {
    try {
      const info = await fetchInvite(code, botToken);
      if (!info) code = null;
    } catch (e) {
      if (e instanceof DiscordError) throw new Error(e.message);
      throw e;
    }
  }

  if (!code) {
    try {
      const created = await createGuildInvite(guildId, botToken);
      code = created.code;
      channelId = created.channelId;
    } catch (e) {
      if (e instanceof DiscordError) throw new Error(e.message);
      throw e;
    }
    if (existing) {
      await db
        .update(schema.discordInvites)
        .set({ code, channelId, uses: 0 })
        .where(eq(schema.discordInvites.userId, userId));
    } else {
      await db.insert(schema.discordInvites).values({ userId, code, channelId });
    }
  }

  // Tell the bot who owns this code (bot-made codes otherwise say "bot").
  // Silent on failure — invite stats still work, just with creator fallback.
  try {
    const ownerRows = await db
      .select({ discordId: schema.users.discordId })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    const ownerDiscordId = ownerRows[0]?.discordId;
    const botUrl = (process.env.DISCORD_BOT_URL || "").replace(/\/$/, "");
    if (ownerDiscordId && botUrl) {
      await fetch(`${botUrl}/recruiter/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, owner: ownerDiscordId }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => null);
    }
  } catch {
    // ignore — non-critical
  }

  // Fresh use count. Bot counts are authoritative for codes it tracks
  // (unique current members); take the max so pre-bot joins still count.
  const [botUses, restUses] = await Promise.all([
    getBotUsesByCode(),
    (async () => {
      try {
        const invites = await listGuildInvites(guildId, botToken);
        return invites.find((i) => i.code === code)?.uses ?? 0;
      } catch {
        return existing?.uses ?? 0;
      }
    })(),
  ]);
  const uses = Math.max(restUses, botUses?.get(code) ?? 0);

  await db
    .update(schema.discordInvites)
    .set({ uses })
    .where(eq(schema.discordInvites.userId, userId));

  return { code, uses };
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
  const { botToken, guildId } = requireDiscordEnv();
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
  const { code, uses } = await getOrCreateInvite(userId);
  let granted = await hasBadge(userId);
  if (!granted && uses >= RECRUITER_REQUIRED) {
    await grantRecruiterBadge(userId, discordId);
    granted = true;
  }
  return { code, url: inviteUrl(code), uses, required: RECRUITER_REQUIRED, granted };
}

export async function syncAllRecruiterInvites(): Promise<{ checked: number; granted: number }> {
  const { botToken, guildId } = requireDiscordEnv();

  const invites = await listGuildInvites(guildId, botToken);
  const botUses = await getBotUsesByCode();
  // Bot counts win where tracked (unique current members); max() keeps
  // pre-bot joins counted too.
  const usesByCode = new Map(invites.map((i) => [i.code, i.uses]));
  if (botUses) {
    for (const [code, uses] of botUses) {
      usesByCode.set(code, Math.max(uses, usesByCode.get(code) ?? 0));
    }
  }

  const rows = await db.select().from(schema.discordInvites);
  const users = await db
    .select({ id: schema.users.id, discordId: schema.users.discordId })
    .from(schema.users);
  const discordIdByUserId = new Map(
    users.filter((u) => !!u.discordId).map((u) => [u.id, u.discordId as string])
  );

  let granted = 0;
  for (const row of rows) {
    const uses = usesByCode.get(row.code);
    if (uses === undefined) continue;
    if (uses !== row.uses) {
      await db.update(schema.discordInvites).set({ uses }).where(eq(schema.discordInvites.id, row.id));
    }
    if (uses < RECRUITER_REQUIRED) continue;
    const discordId = discordIdByUserId.get(row.userId);
    if (!discordId || !RECRUITER_ROLE_ID) continue;
    try {
      if (await grantRecruiterBadge(row.userId, discordId)) granted += 1;
    } catch {
      continue;
    }
  }
  return { checked: rows.length, granted };
}
