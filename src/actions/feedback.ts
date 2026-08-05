"use server";

import { db, schema } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";

import { getSessionUserId } from "@/lib/auth/session";
import { feedbackRateLimit } from "@/lib/rate-limit";

/**
 * Handle feedback (like / dislike / unlike / undislike) with idempotent
 * counter updates. Each action first checks whether the giver already has
 * a feedback row for this receiver, and only adjusts the counter when the
 * state is actually changing. A transaction with FOR UPDATE locks the
 * existing row to prevent races from double-counting.
 */
export async function submitFeedbackAction(userId: number, type: 'like' | 'dislike' | 'unlike' | 'undislike') {
  const sessionUserId = await getSessionUserId();

  if (!sessionUserId) {
    return { success: false, error: "You must be logged in to like or dislike." };
  }

  const rate = await feedbackRateLimit(sessionUserId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return { success: false, error: `You're doing that too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.` };
  }

  try {
    await db.transaction(async (tx) => {
      // Lock the existing feedback row if one exists.
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
            // Already liked — no-op.
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

      // Apply counter deltas if any.
      if (Object.keys(counterDiffs).length > 0) {
        await tx
          .update(schema.users)
          .set(counterDiffs)
          .where(eq(schema.users.id, userId));
      }

      // Persist the feedback row.
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

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getDashboardFeedback() {
  const sessionUserId = await getSessionUserId();
  if (!sessionUserId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
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
    });

    const received = receivedRaw.map(r => ({
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
    });

    const given = givenRaw.map(g => ({
      ...g,
      receiver: {
        id: g.receiver.id,
        username: g.receiver.username,
        avatarUrl: g.receiver.settings?.avatarUrl ?? null
      }
    }));

    return { success: true, received, given };
  } catch (error) {
    console.error("Failed to fetch dashboard feedback:", error);
    return { success: false, error: "Database error" };
  }
}
