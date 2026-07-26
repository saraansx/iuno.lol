"use server";

import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { commentRateLimit } from "@/lib/rate-limit";

export async function addComment(profileId: number, content: string, replyToId?: number) {
  const authorId = await getSessionUserId();
  if (!authorId) return { error: "Unauthorized" };

  const rate = await commentRateLimit(authorId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return { error: `You're posting too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.` };
  }

  if (!content || content.trim().length === 0) {
    return { error: "Comment cannot be empty" };
  }

  if (content.length > 200) {
    return { error: "Comment is too long (maximum 200 characters)" };
  }

  const [result] = await db.insert(schema.profileComments).values({
    profileId,
    authorId,
    content: content.trim(),
    replyToId,
  });

  const newComment = await db.query.profileComments.findFirst({
    where: eq(schema.profileComments.id, result.insertId),
    with: { author: true }
  });

  return { success: true, comment: newComment };
}

export async function getComments(profileId: number) {
  const viewerId = await getSessionUserId();
  const rawComments = await db.query.profileComments.findMany({
    where: eq(schema.profileComments.profileId, profileId),
    with: {
      author: true,
      likes: viewerId ? {
        where: eq(schema.commentLikes.userId, viewerId)
      } : undefined,
    },
    orderBy: [desc(schema.profileComments.isPinned), desc(schema.profileComments.createdAt)],
  });

  const comments = rawComments.map(c => {
    const isLiked = c.likes && c.likes.length > 0;
    // Remove likes array from being sent to client for privacy/size
    const { likes, ...rest } = c; 
    return { ...rest, isLiked };
  });

  return { success: true, comments };
}

export async function toggleLikeComment(commentId: number) {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Unauthorized" };

  const existingLike = await db.query.commentLikes.findFirst({
    where: and(
      eq(schema.commentLikes.commentId, commentId),
      eq(schema.commentLikes.userId, userId)
    ),
  });

  if (existingLike) {
    await db.delete(schema.commentLikes).where(eq(schema.commentLikes.id, existingLike.id));
    // Atomic decrement (ensures it doesn't drop below 0)
    await db.update(schema.profileComments)
      .set({ likesCount: sql`GREATEST(0, ${schema.profileComments.likesCount} - 1)` })
      .where(eq(schema.profileComments.id, commentId));
  } else {
    await db.insert(schema.commentLikes).values({ commentId, userId });
    // Atomic increment
    await db.update(schema.profileComments)
      .set({ likesCount: sql`${schema.profileComments.likesCount} + 1` })
      .where(eq(schema.profileComments.id, commentId));
  }

  return { success: true };
}

export async function togglePinComment(commentId: number, profileId: number) {
  const userId = await getSessionUserId();
  if (!userId || userId !== profileId) return { error: "Unauthorized" };

  const comment = await db.query.profileComments.findFirst({
    where: eq(schema.profileComments.id, commentId),
  });

  if (!comment || comment.profileId !== profileId) {
    return { error: "Comment not found or unauthorized" };
  }

  await db.update(schema.profileComments)
    .set({ isPinned: !comment.isPinned })
    .where(eq(schema.profileComments.id, commentId));

  return { success: true };
}

export async function editComment(commentId: number, content: string) {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Unauthorized" };

  const comment = await db.query.profileComments.findFirst({
    where: eq(schema.profileComments.id, commentId),
  });

  if (!comment || comment.authorId !== userId) {
    return { error: "Unauthorized" };
  }

  if (!content || content.trim().length === 0) {
    return { error: "Comment cannot be empty" };
  }

  if (content.length > 200) {
    return { error: "Comment is too long (maximum 200 characters)" };
  }

  await db.update(schema.profileComments)
    .set({ content: content.trim() })
    .where(eq(schema.profileComments.id, commentId));

  return { success: true };
}

export async function deleteComment(commentId: number, profileId: number) {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Unauthorized" };

  const comment = await db.query.profileComments.findFirst({
    where: eq(schema.profileComments.id, commentId),
  });

  if (!comment) return { error: "Comment not found" };

  // Can delete if author OR if profile owner
  if (comment.authorId !== userId && profileId !== userId) {
    return { error: "Unauthorized" };
  }

  await db.delete(schema.profileComments).where(
    or(
      eq(schema.profileComments.id, commentId),
      eq(schema.profileComments.replyToId, commentId)
    )
  );

  return { success: true };
}

export async function getDashboardComments() {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Unauthorized" };

  // Received comments (on this user's profile)
  const rawReceived = await db.query.profileComments.findMany({
    where: eq(schema.profileComments.profileId, userId),
    with: {
      author: true,
      likes: {
        where: eq(schema.commentLikes.userId, userId)
      },
    },
    orderBy: [desc(schema.profileComments.createdAt)],
    limit: 10,
  });

  // Given comments (written by this user)
  const rawGiven = await db.query.profileComments.findMany({
    where: eq(schema.profileComments.authorId, userId),
    with: {
      author: true,
      likes: {
        where: eq(schema.commentLikes.userId, userId)
      },
    },
    orderBy: [desc(schema.profileComments.createdAt)],
    limit: 10,
  });

  const mapComments = (raw: any[]) => raw.map(c => {
    const isLiked = c.likes && c.likes.length > 0;
    const { likes, ...rest } = c;
    return { ...rest, isLiked };
  });

  return { 
    success: true, 
    received: mapComments(rawReceived), 
    given: mapComments(rawGiven) 
  };
}
