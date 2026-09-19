"use server";

import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { revalidatePath } from "next/cache";
import { profileUpdateRateLimit } from "@/lib/rate-limit";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import { eq, and } from "drizzle-orm";
import { BADGES, MAX_EQUIPPED_BADGES } from "@/app/dashboard/customize/badges/badges-data";

type BadgeEntry = (typeof BADGES)[number];

function findBadge(badgeId: string): BadgeEntry | null {
  const found = (BADGES as readonly BadgeEntry[]).find((b) => b.id === badgeId);
  return found ?? null;
}

function isLocked(badge: BadgeEntry): boolean {
  return "pill" in badge;
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

  const rows = await db
    .select({ badgeId: schema.userBadges.badgeId, equipped: schema.userBadges.equipped })
    .from(schema.userBadges)
    .where(eq(schema.userBadges.userId, userId));

  return {
    owned: rows.map((r) => r.badgeId),
    equipped: rows.filter((r) => r.equipped).map((r) => r.badgeId),
  };
}

export async function equipBadge(badgeId: string): Promise<{ owned: string[]; equipped: string[] }> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const cleanId = badgeId.trim().slice(0, 50);
  const badge = findBadge(cleanId);
  if (!badge) throw new Error("Unknown badge.");
  if (isLocked(badge)) throw new Error("This badge isn't available yet.");

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

  if (existing.length > 0 && existing[0].equipped) {
    return getMyBadges();
  }

  const equippedCount = await db
    .select({ id: schema.userBadges.id })
    .from(schema.userBadges)
    .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.equipped, true)));

  if (equippedCount.length >= MAX_EQUIPPED_BADGES) {
    throw new Error(`You can only equip up to ${MAX_EQUIPPED_BADGES} badges. Unequip one first.`);
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

  const cleanId = badgeId.trim().slice(0, 50);

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
