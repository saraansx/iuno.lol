"use server";

import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { revalidatePath } from "next/cache";
import { profileUpdateRateLimit } from "@/lib/rate-limit";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import { eq, and, asc, sql } from "drizzle-orm";
import { BADGES, EARLY_CUTOFF_UID, LEVELS, VIEW_MILESTONES, LIKE_MILESTONES, DONATION_MILESTONES } from "@/app/dashboard/customize/badges/badges-data";
import { ROLE_BADGE_MAP, BADGE_ROLE_MAP } from "@/lib/badge-roles";
import { isPremiumActive } from "@/lib/premium";
import { RECRUITER_BADGE_ID, refreshRecruiter } from "@/lib/recruiter";

type BadgeEntry = (typeof BADGES)[number];
type LevelEntry = (typeof LEVELS)[number];
type ViewEntry = (typeof VIEW_MILESTONES)[number];
type LikeEntry = (typeof LIKE_MILESTONES)[number];
type DonationEntry = (typeof DONATION_MILESTONES)[number];

function findBadge(badgeId: string): BadgeEntry | LevelEntry | ViewEntry | LikeEntry | DonationEntry | null {
  const found =
    (BADGES as readonly BadgeEntry[]).find((b) => b.id === badgeId) ??
    (LEVELS as readonly LevelEntry[]).find((b) => b.id === badgeId) ??
    (VIEW_MILESTONES as readonly ViewEntry[]).find((b) => b.id === badgeId) ??
    (LIKE_MILESTONES as readonly LikeEntry[]).find((b) => b.id === badgeId) ??
    (DONATION_MILESTONES as readonly DonationEntry[]).find((b) => b.id === badgeId);
  return found ?? null;
}
function isLocked(badge: BadgeEntry | LevelEntry | ViewEntry | LikeEntry | DonationEntry): boolean {
  return "pill" in badge;
}

export async function getDonatedCents(userId: number): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(${schema.donations.amountCents}), 0)` })
    .from(schema.donations)
    .where(eq(schema.donations.userId, userId));
  return Number(rows[0]?.total ?? 0);
}

async function revalidateOwnProfile(userId: number) {
  const user = await getUserById(userId);
  if (user?.username) {
    revalidatePath(`/${user.username}`);
    await purgeCloudflareProfileCache(user.username);
  }
}

export async function getMyBadges(): Promise<{ owned: string[]; equipped: string[] }> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  // View + like milestones unlock purely from profile stats — grant any
  // reached ones (stats only grow, so grants are never revoked).
  const user = await getUserById(userId);
  const totalViews = user?.views ?? 0;
  const reachedViews = VIEW_MILESTONES.filter((m) => totalViews >= m.views).map((m) => m.id);
  const totalLikes = user?.likesCount ?? 0;
  const reachedLikes = LIKE_MILESTONES.filter((m) => totalLikes >= m.likes).map((m) => m.id);
  const donatedCents = await getDonatedCents(userId);
  const reachedDonations = DONATION_MILESTONES.filter((m) => donatedCents >= m.amount * 100).map((m) => m.id);
  const reached = [...reachedViews, ...reachedLikes, ...reachedDonations];

  const rows = await db
    .select({ badgeId: schema.userBadges.badgeId, equipped: schema.userBadges.equipped })
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, userId))
    .orderBy(asc(schema.userBadges.sortOrder), asc(schema.userBadges.equippedAt));

  const ownedSet = new Set(rows.map((r) => r.badgeId));
  for (const id of reached) {
    if (!ownedSet.has(id)) {
      await db.insert(schema.userBadges).values({
        userId,
        badgeId: id,
        equipped: false,
        equippedAt: null,
      });
      ownedSet.add(id);
      rows.push({ badgeId: id, equipped: false });
    }
  }

  return {
    owned: rows.map((r) => r.badgeId),
    equipped: rows.filter((r) => r.equipped).map((r) => r.badgeId),
  };
}

export async function equipBadge(badgeId: string): Promise<{ owned: string[]; equipped: string[] }> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const cleanId = badgeId.trim().slice(0, 32);
  const badge = findBadge(cleanId);
  if (!badge) throw new Error("Unknown badge.");
  if (isLocked(badge)) throw new Error("This badge isn't available yet.");
  if (cleanId === "early" && userId > EARLY_CUTOFF_UID) {
    throw new Error("Only the first 100 members can earn this badge.");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const existing = await db
    .select()
    .from(schema.userBadges)
    .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, cleanId)))
    .limit(1);

  if (existing.length === 0 && cleanId !== "early") {
    throw new Error("Locked — sync your Discord roles to unlock this badge.");
  }

  if (existing.length > 0 && existing[0].equipped) {
    return getMyBadges();
  }

  const now = new Date();
  if (existing.length > 0) {
    await db
      .update(schema.userBadges)
      .set({ equipped: true, equippedAt: now })
      .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, cleanId)));
  } else {
    await db.insert(schema.userBadges).values({
      userId,
      badgeId: cleanId,
      equipped: true,
      equippedAt: now,
    });
  }

  await revalidateOwnProfile(userId);
  return getMyBadges();
}

export async function unequipBadge(badgeId: string): Promise<{ owned: string[]; equipped: string[] }> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const cleanId = badgeId.trim().slice(0, 32);

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  await db
    .update(schema.userBadges)
    .set({ equipped: false, equippedAt: null })
    .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, cleanId)));

  await revalidateOwnProfile(userId);
  return getMyBadges();
}

export async function saveEquippedBadges(ids: string[]): Promise<{ owned: string[]; equipped: string[] }> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const clean = [...new Set(ids.map((id) => id.trim().slice(0, 50)).filter(Boolean))];

  for (const id of clean) {
    const badge = findBadge(id);
    if (!badge) throw new Error("Unknown badge.");
    if (isLocked(badge)) throw new Error("This badge isn't available yet.");
    if (id === "early" && userId > EARLY_CUTOFF_UID) {
      throw new Error("Only the first 100 members can earn this badge.");
    }
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const rows = await db
    .select()
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, userId));
  const ownedSet = new Set(rows.map((r) => r.badgeId));

  for (const id of clean) {
    if (id !== "early" && !ownedSet.has(id)) {
      throw new Error("Locked — sync your Discord roles to unlock this badge.");
    }
    if (id === "early" && userId > EARLY_CUTOFF_UID) {
      throw new Error("Only the first 100 members can earn this badge.");
    }
  }

  const now = new Date();
  for (const [index, id] of clean.entries()) {
    if (!ownedSet.has(id)) {
      await db.insert(schema.userBadges).values({
        userId,
        badgeId: id,
        equipped: true,
        equippedAt: now,
        sortOrder: index,
      });
    }
  }
  for (const row of rows) {
    const index = clean.indexOf(row.badgeId);
    const shouldEquip = index !== -1;
    if (shouldEquip && !row.equipped) {
      await db
        .update(schema.userBadges)
        .set({ equipped: true, equippedAt: now, sortOrder: index })
        .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, row.badgeId)));
    } else if (shouldEquip && row.equipped && row.sortOrder !== index) {
      await db
        .update(schema.userBadges)
        .set({ sortOrder: index })
        .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, row.badgeId)));
    } else if (!shouldEquip && row.equipped) {
      await db
        .update(schema.userBadges)
        .set({ equipped: false, equippedAt: null })
        .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, row.badgeId)));
    }
  }

  await revalidateOwnProfile(userId);
  return getMyBadges();
}

export async function syncDiscordBadges(): Promise<{
  owned: string[];
  equipped: string[];
  added: string[];
  removed: string[];
}> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const user = await getUserById(userId);
  const discordId = user?.discordId;
  if (!discordId) throw new Error("Connect your Discord account first.");

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!botToken || !guildId) throw new Error("Discord sync isn't set up yet.");

  let roles: string[] = [];
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
      headers: { Authorization: `Bot ${botToken}` },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 404 || res.status === 400) {
      // Not in the guild, or the linked Discord ID is stale/invalid (app
      // disconnected) — nothing verifiable, so role badges get stripped below.
      roles = [];
    } else if (!res.ok) {
      throw new Error(`Discord API error (${res.status})`);
    } else {
      const data = (await res.json()) as { roles?: unknown };
      roles = Array.isArray(data.roles) ? data.roles.map(String) : [];
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Discord API error")) throw e;
    throw new Error("Couldn't reach Discord. Try again in a bit.");
  }

  const added: string[] = [];
  const removed: string[] = [];

  // Premium members get the Discord premium role granted by the bot on sync,
  // which then unlocks the premium badge through the normal role mapping below.
  const premiumRoleId = BADGE_ROLE_MAP["premium"];
  const premium = isPremiumActive(user);
  let premiumGrantFailed = false;
  if (premium && premiumRoleId && !roles.includes(premiumRoleId)) {
    try {
      const put = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${premiumRoleId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bot ${botToken}` },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (put.ok) {
        roles.push(premiumRoleId);
      } else {
        // 404 = not in the guild (can't grant); leave badge state untouched.
        premiumGrantFailed = true;
      }
    } catch {
      premiumGrantFailed = true;
    }
  }

  for (const [roleId, badgeId] of Object.entries(ROLE_BADGE_MAP)) {
    const badge = findBadge(badgeId) ?? LEVELS.find((l) => l.id === badgeId) ?? null;
    if (!badge || isLocked(badge)) continue;
    // Don't strip the premium badge when the grant failed (e.g. user not in guild).
    if (badgeId === "premium" && premium && premiumGrantFailed) continue;

    const existing = await db
      .select()
      .from(schema.userBadges)
      .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, badgeId)))
      .limit(1);

    if (roles.includes(roleId)) {
      if (existing.length === 0) {
        await db.insert(schema.userBadges).values({
          userId,
          badgeId,
          equipped: false,
          equippedAt: null,
        });
        added.push(badgeId);
      }
    } else if (existing.length > 0) {
      await db
        .delete(schema.userBadges)
        .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, badgeId)));
      removed.push(badgeId);
    }
  }

  const earlyExisting = await db
    .select()
    .from(schema.userBadges)
    .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, "early")))
    .limit(1);

  if (userId <= EARLY_CUTOFF_UID) {
    if (earlyExisting.length === 0) {
      await db.insert(schema.userBadges).values({
        userId,
        badgeId: "early",
        equipped: false,
        equippedAt: null,
      });
      added.push("early");
    }
  } else if (earlyExisting.length > 0) {
    await db
      .delete(schema.userBadges)
      .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, "early")));
    removed.push("early");
  }

  // Discord Recruiter: poll personal invite uses, grant at threshold.
  // Never fails the whole sync — the modal refresh surfaces errors instead.
  try {
    const before = await db
      .select({ id: schema.userBadges.id })
      .from(schema.userBadges)
      .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, RECRUITER_BADGE_ID)))
      .limit(1);
    const state = await refreshRecruiter(userId, discordId);
    if (state.granted && before.length === 0) added.push(RECRUITER_BADGE_ID);
  } catch {
    // ignore — covered by nightly cron + manual refresh
  }

  await revalidateOwnProfile(userId);
  const state = await getMyBadges();
  return { ...state, added, removed };
}
