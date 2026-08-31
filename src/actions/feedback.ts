"use server";

import { db, schema } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/lib/auth/session";
import { invalidateLiveStatsCache } from "@/app/api/profile/live/route";

export async function submitFeedbackAction(userId: number, type: 'like' | 'dislike' | 'unlike' | 'undislike') {
  const sessionUserId = await getSessionUserId();

  if (!sessionUserId) {
    return { success: false, error: "You must be logged in to like or dislike." };
  }

  try {
    await db.transaction(async (tx) => {
      const existingRows = await tx
        .select({ type: schema.profileFeedback.type })
        .from(schema.profileFeedback)
        .where(
          and(
            eq(schema.profileFeedback.receiverId, userId),
            eq(schema.profileFeedback.giverId, sessionUserId)
          )
        )
        .for("update");

      const existingType = existingRows[0]?.type as string | undefined;

      const counterDiffs: Record<string, import("drizzle-orm").SQL> = {};

      switch (type) {
        case "like":
          if (existingType === "like") {
            return { applied: false };
          }
          counterDiffs.likesCount = sql`${schema.users.likesCount} + 1`;
          if (existingType === "dislike") {
            counterDiffs.dislikesCount = sql`GREATEST(0, ${schema.users.dislikesCount} - 1)`;
          }
          break;

        case "dislike":
          if (existingType === "dislike") {
            return { applied: false };
          }
          counterDiffs.dislikesCount = sql`${schema.users.dislikesCount} + 1`;
          if (existingType === "like") {
            counterDiffs.likesCount = sql`GREATEST(0, ${schema.users.likesCount} - 1)`;
          }
          break;

        case "unlike":
          if (existingType !== "like") {
            return { applied: false };
          }
          counterDiffs.likesCount = sql`GREATEST(0, ${schema.users.likesCount} - 1)`;
          break;

        case "undislike":
          if (existingType !== "dislike") {
            return { applied: false };
          }
          counterDiffs.dislikesCount = sql`GREATEST(0, ${schema.users.dislikesCount} - 1)`;
          break;
      }

      if (Object.keys(counterDiffs).length > 0) {
        await tx
          .update(schema.users)
          .set(counterDiffs)
          .where(eq(schema.users.id, userId));
      }

      if (type === "like" || type === "dislike") {
        await tx
          .insert(schema.profileFeedback)
          .values({ receiverId: userId, giverId: sessionUserId, type })
          .onDuplicateKeyUpdate({
            set: { type, createdAt: sql`CURRENT_TIMESTAMP` },
          });
      } else {
        await tx
          .delete(schema.profileFeedback)
          .where(
            and(
              eq(schema.profileFeedback.receiverId, userId),
              eq(schema.profileFeedback.giverId, sessionUserId)
            )
          );
      }

      return { applied: true };
    });

    try {
      await invalidateLiveStatsCache(userId);
      const [receiver] = await db
        .select({ username: schema.users.username })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);
      if (receiver?.username) {
        revalidatePath(`/${receiver.username}`);
      }
    } catch (e) {
      console.error("Failed to invalidate cache/revalidate profile:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getDashboardFeedback(page: number = 1, limit: number = 4) {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const offset = (page - 1) * limit;

    const receivedRaw = await db.query.profileFeedback.findMany({
      where: eq(schema.profileFeedback.receiverId, sessionUserId),
      with: {
        giver: {
          columns: {
            id: true,
            username: true,
          },
          with: {
            settings: {
              columns: {
                avatarUrl: true,
              }
            }
          }
        }
      },
      orderBy: (pf, { desc }) => [desc(pf.createdAt)],
      limit: limit + 1,
      offset,
    });

    const receivedHasMore = receivedRaw.length > limit;
    const receivedSlice = receivedHasMore ? receivedRaw.slice(0, limit) : receivedRaw;

    const received = receivedSlice.map(r => ({
      ...r,
      giver: {
        id: r.giver.id,
        username: r.giver.username,
        avatarUrl: r.giver.settings?.avatarUrl ?? null
      }
    }));

    const givenRaw = await db.query.profileFeedback.findMany({
      where: eq(schema.profileFeedback.giverId, sessionUserId),
      with: {
        receiver: {
          columns: {
            id: true,
            username: true,
          },
          with: {
            settings: {
              columns: {
                avatarUrl: true,
              }
            }
          }
        }
      },
      orderBy: (pf, { desc }) => [desc(pf.createdAt)],
      limit: limit + 1,
      offset,
    });

    const givenHasMore = givenRaw.length > limit;
    const givenSlice = givenHasMore ? givenRaw.slice(0, limit) : givenRaw;

    const given = givenSlice.map(g => ({
      ...g,
      receiver: {
        id: g.receiver.id,
        username: g.receiver.username,
        avatarUrl: g.receiver.settings?.avatarUrl ?? null
      }
    }));

    const [receivedTotal] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.profileFeedback)
      .where(eq(schema.profileFeedback.receiverId, sessionUserId));
    const [givenTotal] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.profileFeedback)
      .where(eq(schema.profileFeedback.giverId, sessionUserId));

    return {
      success: true,
      received,
      given,
      receivedHasMore,
      givenHasMore,
      receivedTotal: receivedTotal?.count ?? 0,
      givenTotal: givenTotal?.count ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard feedback:", error);
    return { success: false, error: "Database error" };
  }
}
