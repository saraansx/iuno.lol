"use server";

import { db, schema } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";
import { revalidateProfile } from "@/app/[username]/profile-data";

import { getSessionUserId } from "@/lib/auth/session";
import { invalidateLiveStatsCache } from "@/lib/live-stats-cache";
import { safePage, safeLimit } from "@/lib/utils";
import { profileFeedbackRateLimit } from "@/lib/rate-limit";

const FEEDBACK_TYPES = ["like", "dislike", "unlike", "undislike"] as const;

export async function submitFeedbackAction(userId: number, type: 'like' | 'dislike' | 'unlike' | 'undislike') {
  const sessionUserId = await getSessionUserId();

  if (!sessionUserId) {
    return { success: false, error: "You must be logged in to like or dislike." };
  }

  const rate = await profileFeedbackRateLimit(sessionUserId);
  if (!rate.ok) {
    return { success: false, error: `You're doing that too fast. Please wait ${rate.retryAfterSeconds} second${rate.retryAfterSeconds === 1 ? '' : 's'}.` };
  }

  if (!FEEDBACK_TYPES.includes(type)) {
    return { success: false, error: "Invalid feedback type." };
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return { success: false, error: "Invalid profile." };
  }

  const [targetSettings] = await db
    .select({ feedbackEnabled: schema.userSettings.feedbackEnabled })
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, userId))
    .limit(1);

  if (targetSettings?.feedbackEnabled === false) {
    return { success: false, error: "Feedback is turned off for this profile." };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [target] = await tx
        .select({ id: schema.users.id, username: schema.users.username })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .for("update");

      if (!target) {
        return { applied: false, notFound: true, username: null };
      }

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
            return { applied: false, username: target.username };
          }
          counterDiffs.likesCount = sql`${schema.users.likesCount} + 1`;
          if (existingType === "dislike") {
            counterDiffs.dislikesCount = sql`GREATEST(0, ${schema.users.dislikesCount} - 1)`;
          }
          break;

        case "dislike":
          if (existingType === "dislike") {
            return { applied: false, username: target.username };
          }
          counterDiffs.dislikesCount = sql`${schema.users.dislikesCount} + 1`;
          if (existingType === "like") {
            counterDiffs.likesCount = sql`GREATEST(0, ${schema.users.likesCount} - 1)`;
          }
          break;

        case "unlike":
          if (existingType !== "like") {
            return { applied: false, username: target.username };
          }
          counterDiffs.likesCount = sql`GREATEST(0, ${schema.users.likesCount} - 1)`;
          break;

        case "undislike":
          if (existingType !== "dislike") {
            return { applied: false, username: target.username };
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

      return { applied: true, username: target.username };
    });

    if (result && "notFound" in result) {
      return { success: false, error: "Profile not found." };
    }

    if (!result?.applied) {
      return { success: true, changed: false };
    }

    try {
      if (result.username) {
        await invalidateLiveStatsCache(result.username);
        revalidateProfile(result.username);
      }
    } catch (e) {
      console.error("Failed to invalidate cache/revalidate profile:", e);
    }

    return { success: true, changed: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getDashboardFeedback(
  receivedPage: number = 1,
  givenPage: number = 1,
  rawLimit: number = 4,
  only?: "received" | "given",
) {
  const limit = safeLimit(rawLimit, 4);
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const receivedOffset = (safePage(receivedPage) - 1) * limit;
    const givenOffset = (safePage(givenPage) - 1) * limit;

    const receivedQuery = only === "given" ? Promise.resolve([]) : db.query.profileFeedback.findMany({
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
      offset: receivedOffset,
    });

    const givenQuery = only === "received" ? Promise.resolve([]) : db.query.profileFeedback.findMany({
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
      offset: givenOffset,
    });

    const [receivedRaw, givenRaw, [receivedTotal], [givenTotal]] = await Promise.all([
      receivedQuery,
      givenQuery,
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(schema.profileFeedback)
        .where(eq(schema.profileFeedback.receiverId, sessionUserId)),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(schema.profileFeedback)
        .where(eq(schema.profileFeedback.giverId, sessionUserId)),
    ]);

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
