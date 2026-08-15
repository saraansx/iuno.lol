"use server";

import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { eq, and, desc, asc, sql, or } from "drizzle-orm";
import { commentRateLimit, commentLikeRateLimit, commentEditRateLimit, commentDeleteRateLimit, commentPinRateLimit } from "@/lib/rate-limit";

/**
 * Shape of the author object we're allowed to expose to the client.
 * Never spread the full `users` row here — it contains the password hash,
 * email, and ip.
 */
type PublicCommentAuthor = {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarShape: "square" | "soft" | "rounded" | "circle" | null;
};

type CommentAuthorRow = {
  id: number;
  username: string;
  settings?: {
    displayName?: string | null;
    avatarUrl?: string | null;
    avatarShape?: "square" | "soft" | "rounded" | "circle" | null;
  } | null;
};

function safeAuthor(author: CommentAuthorRow): PublicCommentAuthor {
  return {
    id: author.id,
    username: author.username,
    displayName: author.settings?.displayName ?? null,
    avatarUrl: author.settings?.avatarUrl ?? null,
    avatarShape: author.settings?.avatarShape ?? null,
  };
}

const commentAuthorRelation = {
  columns: { id: true, username: true },
  with: {
    settings: {
      columns: {
        displayName: true,
        avatarUrl: true,
        avatarShape: true,
      },
    },
  },
} as const;

export async function addComment(profileId: number, content: string, replyToId?: number) {
  const authorId = await getSessionUserId();
  if (!authorId) return { error: "Unauthorized" };

  const rate = await commentRateLimit(authorId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return { error: `You're posting too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.` };
  }

  const profile = await getUserById(profileId);
  if (!profile) return { error: "Profile not found" };
  if (!profile.allowNewComments && authorId !== profileId) {
    return { error: "Comments are disabled on this profile." };
  }

  if (!content || content.trim().length === 0) {
    return { error: "Comment cannot be empty" };
  }

  if (content.length > 200) {
    return { error: "Comment is too long (maximum 200 characters)" };
  }

  if (replyToId) {
    const parentComment = await db.query.profileComments.findFirst({
      where: and(
        eq(schema.profileComments.id, replyToId),
        eq(schema.profileComments.profileId, profileId)
      ),
    });
    if (!parentComment) {
      return { error: "Parent comment not found on this profile." };
    }
  }

  const [result] = await db.insert(schema.profileComments).values({
    profileId,
    authorId,
    content: content.trim(),
    replyToId: replyToId ?? null,
  });

  const newComment = await db.query.profileComments.findFirst({
    where: eq(schema.profileComments.id, result.insertId),
    with: { author: commentAuthorRelation }
  });

  if (!newComment) return { success: true, comment: null };

  const { author, ...rest } = newComment;
  return { success: true, comment: { ...rest, author: safeAuthor(author) } };
}

export async function getComments(
  profileId: number, 
  page: number = 1, 
  limit: number = 10,
  filter: string = "Newest first"
) {
  const viewerId = await getSessionUserId();

  const profile = await getUserById(profileId);
  if (!profile) return { success: true, comments: [], hasMore: false };
  if (!profile.showCommentsPublicly && viewerId !== profileId) {
    return { success: true, comments: [], hasMore: false };
  }

  let orderBys = [];
  if (filter === "Oldest first") {
    orderBys = [desc(schema.profileComments.isPinned), asc(schema.profileComments.createdAt)];
  } else if (filter === "Most liked") {
    orderBys = [desc(schema.profileComments.isPinned), desc(schema.profileComments.likesCount), desc(schema.profileComments.createdAt)];
  } else {
    // Default: Newest first
    orderBys = [desc(schema.profileComments.isPinned), desc(schema.profileComments.createdAt)];
  }

  const rawComments = await db.query.profileComments.findMany({
    where: eq(schema.profileComments.profileId, profileId),
    with: {
      author: commentAuthorRelation,
      likes: viewerId ? {
        where: eq(schema.commentLikes.userId, viewerId)
      } : undefined,
    },
    orderBy: orderBys,
    limit: limit + 1, // Fetch one extra to know if there's a next page
    offset: (page - 1) * limit,
  });

  const hasMore = rawComments.length > limit;
  const commentsToReturn = hasMore ? rawComments.slice(0, limit) : rawComments;

  const comments = commentsToReturn.map(c => {
    const isLiked = c.likes && c.likes.length > 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { likes, author, ...rest } = c;
    return {
      ...rest,
      isLiked,
      author: safeAuthor(author),
    };
  });

  return { success: true, comments, hasMore };
}

export async function toggleLikeComment(commentId: number) {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Unauthorized" };

  const rate = await commentLikeRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return { error: `You're doing that too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.` };
  }

  await db.transaction(async (tx) => {
    const existingLikes = await tx
      .select({ id: schema.commentLikes.id })
      .from(schema.commentLikes)
      .where(
        and(
          eq(schema.commentLikes.commentId, commentId),
          eq(schema.commentLikes.userId, userId)
        )
      )
      .for("update");

    if (existingLikes.length > 0) {
      await tx.delete(schema.commentLikes).where(eq(schema.commentLikes.id, existingLikes[0].id));
      // Atomic decrement (ensures it doesn't drop below 0)
      await tx.update(schema.profileComments)
        .set({ likesCount: sql`GREATEST(0, ${schema.profileComments.likesCount} - 1)` })
        .where(eq(schema.profileComments.id, commentId));
    } else {
      await tx.insert(schema.commentLikes).values({ commentId, userId });
      // Atomic increment
      await tx.update(schema.profileComments)
        .set({ likesCount: sql`${schema.profileComments.likesCount} + 1` })
        .where(eq(schema.profileComments.id, commentId));
    }
  });

  return { success: true };
}

export async function togglePinComment(commentId: number, profileId: number) {
  const userId = await getSessionUserId();
  if (!userId || userId !== profileId) return { error: "Unauthorized" };

  const rate = await commentPinRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return { error: `You're doing that too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.` };
  }

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

  const rate = await commentEditRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return { error: `You're editing too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.` };
  }

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

  const rate = await commentDeleteRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return { error: `You're deleting too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.` };
  }

  const comment = await db.query.profileComments.findFirst({
    where: eq(schema.profileComments.id, commentId),
  });

  if (!comment) return { error: "Comment not found" };

  // The profileId param is attacker-controllable, so it must never be used
  // for authorization. Authorize against the comment's ACTUAL profile owner.
  if (comment.profileId !== profileId) {
    return { error: "Comment not found" };
  }

  // Can delete if author OR if profile owner
  if (comment.authorId !== userId && comment.profileId !== userId) {
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

export async function getDashboardComments(page: number = 1, limit: number = 4) {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Unauthorized" };

  const offset = (page - 1) * limit;

  // Received comments (on this user's profile)
  const rawReceived = await db.query.profileComments.findMany({
    where: eq(schema.profileComments.profileId, userId),
    with: {
      author: commentAuthorRelation,
      likes: {
        where: eq(schema.commentLikes.userId, userId)
      },
    },
    orderBy: [desc(schema.profileComments.createdAt)],
    limit: limit + 1, // Fetch one extra to know if there's a next page
    offset,
  });

  // Given comments (written by this user)
  const rawGiven = await db.query.profileComments.findMany({
    where: eq(schema.profileComments.authorId, userId),
    with: {
      author: commentAuthorRelation,
      likes: {
        where: eq(schema.commentLikes.userId, userId)
      },
    },
    orderBy: [desc(schema.profileComments.createdAt)],
    limit: limit + 1, // Fetch one extra to know if there's a next page
    offset,
  });

  const receivedHasMore = rawReceived.length > limit;
  const receivedSlice = receivedHasMore ? rawReceived.slice(0, limit) : rawReceived;
  const givenHasMore = rawGiven.length > limit;
  const givenSlice = givenHasMore ? rawGiven.slice(0, limit) : rawGiven;

  // Total counts (not page-limited) so the tab labels can show "Received 60"
  // even though only one page of 4 is rendered.
  const [receivedCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.profileComments)
    .where(eq(schema.profileComments.profileId, userId));
  const [givenCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.profileComments)
    .where(eq(schema.profileComments.authorId, userId));

  const mapComments = <T extends { likes?: unknown[], author: CommentAuthorRow }>(raw: T[]) => raw.map(c => {
    const isLiked = !!(c.likes && c.likes.length > 0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { likes, author, ...rest } = c;
    return {
      ...rest,
      isLiked,
      author: safeAuthor(author),
    };
  });

  return {
    success: true,
    received: mapComments(receivedSlice),
    given: mapComments(givenSlice),
    receivedHasMore,
    givenHasMore,
    receivedTotal: receivedCount?.count ?? 0,
    givenTotal: givenCount?.count ?? 0,
  };
}
