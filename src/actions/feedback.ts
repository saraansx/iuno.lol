"use server";

import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

import { getSessionUserId } from "@/lib/auth/session";
import { and } from "drizzle-orm";

export async function submitFeedbackAction(userId: number, type: 'like' | 'dislike' | 'unlike' | 'undislike') {
  const sessionUserId = await getSessionUserId();

  if (!sessionUserId) {
    return { success: false, error: "You must be logged in to like or dislike." };
  }

  try {
    const setData: Record<string, any> = {};

    if (type === 'like') {
      setData.likesCount = sql`${schema.users.likesCount} + 1`;
    } else if (type === 'dislike') {
      setData.dislikesCount = sql`${schema.users.dislikesCount} + 1`;
    } else if (type === 'unlike') {
      setData.likesCount = sql`GREATEST(0, ${schema.users.likesCount} - 1)`;
    } else if (type === 'undislike') {
      setData.dislikesCount = sql`GREATEST(0, ${schema.users.dislikesCount} - 1)`;
    }

    if (Object.keys(setData).length === 0) return { success: true };

    await db
      .update(schema.users)
      .set(setData)
      .where(eq(schema.users.id, userId));

    if (type === 'like' || type === 'dislike') {
      await db.insert(schema.profileFeedback).values({
        receiverId: userId,
        giverId: sessionUserId,
        type: type,
      }).onDuplicateKeyUpdate({ set: { type: type, createdAt: sql`CURRENT_TIMESTAMP` } });
    } else if (type === 'unlike' || type === 'undislike') {
      await db.delete(schema.profileFeedback).where(
        and(
          eq(schema.profileFeedback.receiverId, userId),
          eq(schema.profileFeedback.giverId, sessionUserId)
        )
      );
    }

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
