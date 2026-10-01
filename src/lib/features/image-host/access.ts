import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";

export async function hasImageHostAccess(userId: number): Promise<boolean> {
  const [row] = await db
    .select({ hasImageHost: schema.users.hasImageHost })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return Boolean(row?.hasImageHost);
}

export type ImageHostUser =
  | { ok: true; userId: number }
  | { ok: false; status: 401 | 403; error: string };

// Signed-in user who has bought Image Host. Every image-host API route goes through this.
export async function requireImageHostUser(): Promise<ImageHostUser> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, status: 401, error: "Unauthorized" };
  if (!(await hasImageHostAccess(userId))) {
    return { ok: false, status: 403, error: "Image Host isn't unlocked on your account." };
  }
  return { ok: true, userId };
}
