"use server";

import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById, getCustomBadges } from "@/lib/features/users/db";
import type { CustomBadge } from "@/components/profile/layouts/ProfileBadges";
import { storedFileId } from "@/lib/cdn";
import { isStorageKeyUsableBy, storageRawUrl } from "@/lib/storage";
import { randomBytes } from "crypto";
import { revalidateProfile } from "@/app/[username]/profile-data";
import { profileUpdateRateLimit } from "@/lib/rate-limit";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import { eq, and, asc, like, sql } from "drizzle-orm";
import { BADGES, EARLY_CUTOFF_UID, LEVELS, VIEW_MILESTONES, LIKE_MILESTONES } from "@/app/dashboard/customize/badges/badges-data";
import { ROLE_BADGE_MAP, BADGE_ROLE_MAP } from "@/lib/badge-roles";
import { isPremiumActive } from "@/lib/premium";
import { RECRUITER_BADGE_ID, refreshRecruiter } from "@/lib/recruiter";

type BadgeEntry = (typeof BADGES)[number];
type LevelEntry = (typeof LEVELS)[number];
type ViewEntry = (typeof VIEW_MILESTONES)[number];
type LikeEntry = (typeof LIKE_MILESTONES)[number];

function findBadge(badgeId: string): BadgeEntry | LevelEntry | ViewEntry | LikeEntry | null {
  const found =
    (BADGES as readonly BadgeEntry[]).find((b) => b.id === badgeId) ??
    (LEVELS as readonly LevelEntry[]).find((b) => b.id === badgeId) ??
    (VIEW_MILESTONES as readonly ViewEntry[]).find((b) => b.id === badgeId) ??
    (LIKE_MILESTONES as readonly LikeEntry[]).find((b) => b.id === badgeId);
  return found ?? null;
}
function isLocked(badge: BadgeEntry | LevelEntry | ViewEntry | LikeEntry): boolean {
  return "pill" in badge;
}

async function revalidateOwnProfile(userId: number) {
  const user = await getUserById(userId);
  if (user?.username) {
    revalidateProfile(user.username);
    await purgeCloudflareProfileCache(user.username);
  }
}

type MyBadges = { owned: string[]; equipped: string[]; custom: CustomBadge[]; tokens: number };

const CUSTOM_PREFIX = "custom-";

export async function getMyBadges(): Promise<MyBadges> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const user = await getUserById(userId);
  const totalViews = user?.views ?? 0;
  const reachedViews = VIEW_MILESTONES.filter((m) => totalViews >= m.views).map((m) => m.id);
  const totalLikes = user?.likesCount ?? 0;
  const reachedLikes = LIKE_MILESTONES.filter((m) => totalLikes >= m.likes).map((m) => m.id);
  const reached = [...reachedViews, ...reachedLikes];

  const rows = await db
    .select({ badgeId: schema.userBadges.badgeId, equipped: schema.userBadges.equipped })
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, userId))
    .orderBy(asc(schema.userBadges.sortOrder), asc(schema.userBadges.equippedAt));

  const ownedSet = new Set(rows.map((r) => r.badgeId));
  const paid: Record<string, boolean> = {
    premium: isPremiumActive(user),
    "image-host": Boolean(user?.hasImageHost),
    verified: Boolean(user?.hasVerified),
    donator: Boolean(user?.hasDonator),
  };
  for (const [badgeId, owns] of Object.entries(paid)) {
    if (!owns && ownedSet.has(badgeId)) {
      await db
        .delete(schema.userBadges)
        .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, badgeId)));
      ownedSet.delete(badgeId);
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i].badgeId === badgeId) rows.splice(i, 1);
      }
    } else if (owns && !ownedSet.has(badgeId)) {
      reached.push(badgeId);
    }
  }
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
    custom: await getCustomBadges(userId),
    tokens: user?.badgeTokens ?? 0,
  };
}

export async function createCustomBadge(input: { name: string; iconUrl: string }): Promise<MyBadges> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const name = String(input.name ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 32) throw new Error("Badge name must be 1–32 characters.");

  const key = storedFileId(input.iconUrl);
  if (!key || !isStorageKeyUsableBy(userId, key)) throw new Error("Upload a badge icon first.");

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const customIconUrl = storageRawUrl(key);

  await db.transaction(async (tx) => {
    const [user] = await tx
      .select({ tokens: schema.users.badgeTokens })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .for("update");
    const [{ used }] = await tx
      .select({ used: sql<number>`COUNT(*)` })
      .from(schema.userBadges)
      .where(and(eq(schema.userBadges.userId, userId), like(schema.userBadges.badgeId, `${CUSTOM_PREFIX}%`)));
    if (Number(used) >= (user?.tokens ?? 0)) throw new Error("No free badge slot. Buy a badge token first.");
    await tx.insert(schema.userBadges).values({
      userId,
      badgeId: `${CUSTOM_PREFIX}${randomBytes(6).toString("hex")}`,
      equipped: false,
      equippedAt: null,
      customName: name,
      customIconUrl,
    });
  });

  await revalidateOwnProfile(userId);
  return getMyBadges();
}

export async function resetCustomBadges(): Promise<MyBadges> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(schema.userBadges)
    .where(and(eq(schema.userBadges.userId, userId), like(schema.userBadges.badgeId, `${CUSTOM_PREFIX}%`)));

  await revalidateOwnProfile(userId);
  return getMyBadges();
}

export async function deleteCustomBadge(badgeId: string): Promise<MyBadges> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");
  if (typeof badgeId !== "string" || !badgeId.startsWith(CUSTOM_PREFIX)) throw new Error("Unknown badge.");

  await db
    .delete(schema.userBadges)
    .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, badgeId)));

  await revalidateOwnProfile(userId);
  return getMyBadges();
}

export async function saveEquippedBadges(ids: string[]): Promise<MyBadges> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const clean = [...new Set(ids.map((id) => id.trim().slice(0, 50)).filter(Boolean))];

  for (const id of clean) {
    if (id.startsWith(CUSTOM_PREFIX)) continue;
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

  await db.transaction(async (tx) => {
    await tx
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .for("update");

    const rows = await tx
      .select()
      .from(schema.userBadges)
      .where(eq(schema.userBadges.userId, userId));
    const ownedSet = new Set(rows.map((r) => r.badgeId));

    for (const id of clean) {
      if (id !== "early" && !ownedSet.has(id)) {
        throw new Error("Locked — sync your Discord roles to unlock this badge.");
      }
    }

    const now = new Date();
    for (const [index, id] of clean.entries()) {
      if (!ownedSet.has(id)) {
        await tx.insert(schema.userBadges).values({
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
      const where = and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, row.badgeId));
      if (shouldEquip && !row.equipped) {
        await tx.update(schema.userBadges).set({ equipped: true, equippedAt: now, sortOrder: index }).where(where);
      } else if (shouldEquip && row.equipped && row.sortOrder !== index) {
        await tx.update(schema.userBadges).set({ sortOrder: index }).where(where);
      } else if (!shouldEquip && row.equipped) {
        await tx.update(schema.userBadges).set({ equipped: false, equippedAt: null }).where(where);
      }
    }
  });

  await revalidateOwnProfile(userId);
  return getMyBadges();
}

export async function syncDiscordBadges(): Promise<MyBadges & { added: string[]; removed: string[] }> {
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

  const premiumRoleId = BADGE_ROLE_MAP["premium"];
  const premium = isPremiumActive(user);
  const imageHostRoleId = BADGE_ROLE_MAP["image-host"];
  const imageHost = Boolean(user?.hasImageHost);
  const verifiedRoleId = BADGE_ROLE_MAP["verified"];
  const verified = Boolean(user?.hasVerified);
  const donatorRoleId = BADGE_ROLE_MAP["donator"];
  const donator = Boolean(user?.hasDonator);
  if (verified && verifiedRoleId && !roles.includes(verifiedRoleId)) {
    try {
      const put = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${verifiedRoleId}`,
        { method: "PUT", headers: { Authorization: `Bot ${botToken}` }, signal: AbortSignal.timeout(10000) }
      );
      if (put.ok) roles.push(verifiedRoleId);
    } catch {
    }
  }
  if (donator && donatorRoleId && !roles.includes(donatorRoleId)) {
    try {
      const put = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${donatorRoleId}`,
        { method: "PUT", headers: { Authorization: `Bot ${botToken}` }, signal: AbortSignal.timeout(10000) }
      );
      if (put.ok) roles.push(donatorRoleId);
    } catch {
    }
  }
  if (imageHost && imageHostRoleId && !roles.includes(imageHostRoleId)) {
    try {
      const put = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${imageHostRoleId}`,
        { method: "PUT", headers: { Authorization: `Bot ${botToken}` }, signal: AbortSignal.timeout(10000) }
      );
      if (put.ok) roles.push(imageHostRoleId);
    } catch {
    }
  }
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
      }
    } catch {
    }
  }

  const owned = new Set(
    (
      await db
        .select({ badgeId: schema.userBadges.badgeId })
        .from(schema.userBadges)
        .where(eq(schema.userBadges.userId, userId))
    ).map((r) => r.badgeId)
  );

  for (const [roleId, badgeId] of Object.entries(ROLE_BADGE_MAP)) {
    const badge = findBadge(badgeId) ?? LEVELS.find((l) => l.id === badgeId) ?? null;
    if (!badge || isLocked(badge)) continue;

    if ((badgeId === "premium" && !premium) || (badgeId === "image-host" && !imageHost) || (badgeId === "verified" && !verified) || (badgeId === "donator" && !donator)) {
      if (owned.has(badgeId)) {
        await db
          .delete(schema.userBadges)
          .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, badgeId)));
        owned.delete(badgeId);
        removed.push(badgeId);
      }
      try {
        await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`, {
          method: "DELETE",
          headers: { Authorization: `Bot ${botToken}` },
          signal: AbortSignal.timeout(8000),
        });
      } catch {
      }
      continue;
    }
    if (badgeId === "premium" || badgeId === "image-host" || badgeId === "verified" || badgeId === "donator") continue;

    if (roles.includes(roleId)) {
      if (!owned.has(badgeId)) {
        await db.insert(schema.userBadges).values({
          userId,
          badgeId,
          equipped: false,
          equippedAt: null,
        });
        owned.add(badgeId);
        added.push(badgeId);
      }
    } else if (owned.has(badgeId)) {
      await db
        .delete(schema.userBadges)
        .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, badgeId)));
      owned.delete(badgeId);
      removed.push(badgeId);
    }
  }

  if (userId <= EARLY_CUTOFF_UID) {
    if (!owned.has("early")) {
      await db.insert(schema.userBadges).values({
        userId,
        badgeId: "early",
        equipped: false,
        equippedAt: null,
      });
      added.push("early");
    }
  } else if (owned.has("early")) {
    await db
      .delete(schema.userBadges)
      .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.badgeId, "early")));
    removed.push("early");
  }

  try {
    const state = await refreshRecruiter(userId, discordId);
    if (state.granted && !owned.has(RECRUITER_BADGE_ID)) added.push(RECRUITER_BADGE_ID);
  } catch {
  }

  await revalidateOwnProfile(userId);
  const state = await getMyBadges();
  return { ...state, added, removed };
}
