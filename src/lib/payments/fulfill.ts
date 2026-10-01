import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { BADGE_ROLE_MAP } from "@/lib/badge-roles";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import type { Plan } from "@/lib/payments/plans";

// After a successful purchase: give the plan's badge and Discord role.
// Best-effort — the purchase itself is already saved; sync-badges fixes any miss.
export async function grantPlanPerks(userId: number, plan: Plan): Promise<void> {
  try {
    await db
      .insert(schema.userBadges)
      .values({ userId, badgeId: plan.badgeId, equipped: false, equippedAt: null })
      .onDuplicateKeyUpdate({ set: { badgeId: plan.badgeId } });
  } catch (err) {
    console.error(`[payments] badge grant (${plan.badgeId}) failed:`, err);
  }

  const [user] = await db
    .select({ username: schema.users.username, discordId: schema.users.discordId })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  const roleId = BADGE_ROLE_MAP[plan.badgeId];
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (user?.discordId && roleId && botToken && guildId) {
    try {
      await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${user.discordId}/roles/${roleId}`, {
        method: "PUT",
        headers: { Authorization: `Bot ${botToken}` },
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      console.error(`[payments] discord role (${plan.badgeId}) failed:`, err);
    }
  }

  if (user?.username) await purgeCloudflareProfileCache(user.username);
}
