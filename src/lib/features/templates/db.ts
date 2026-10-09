import "server-only";

import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";

export type PublicTemplate = {
  id: number;
  slug: string;
  name: string;
  thumbnailUrl: string | null;
  useCount: number;
  createdAt: string;
  creatorId: number | null;
  creatorUsername: string | null;
  creatorAvatarUrl: string | null;
  favoriteCount: number;
};

export const getPublicTemplateBySlug = cache(async (slug: string): Promise<PublicTemplate | null> => {
  const clean = slug?.trim().toLowerCase();
  if (!clean) return null;

  const [row] = await db
    .select({
      id: schema.templates.id,
      slug: schema.templates.slug,
      name: schema.templates.name,
      thumbnailUrl: schema.templates.thumbnailUrl,
      isPublic: schema.templates.isPublic,
      useCount: schema.templates.useCount,
      createdAt: schema.templates.createdAt,
      creatorId: schema.templates.userId,
      creatorUsername: schema.users.username,
      creatorAvatarUrl: schema.userSettings.avatarUrl,
    })
    .from(schema.templates)
    .leftJoin(schema.users, eq(schema.users.id, schema.templates.userId))
    .leftJoin(schema.userSettings, eq(schema.userSettings.userId, schema.users.id))
    .where(eq(schema.templates.slug, clean))
    .limit(1);

  if (!row || !row.isPublic) return null;

  const [fav] = await db
    .select({ c: sql<number>`COUNT(*)` })
    .from(schema.templateFavorites)
    .where(eq(schema.templateFavorites.templateId, row.id));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    thumbnailUrl: row.thumbnailUrl ?? null,
    useCount: Number(row.useCount ?? 0),
    createdAt: row.createdAt ? new Date(row.createdAt as unknown as string).toISOString() : new Date().toISOString(),
    creatorId: row.creatorId ?? null,
    creatorUsername: row.creatorUsername ?? null,
    creatorAvatarUrl: row.creatorAvatarUrl ?? null,
    favoriteCount: Number(fav?.c ?? 0),
  };
});

export type TemplatePreviewConfig = {
  id: number;
  slug: string;
  name: string;
  isPublic: boolean;
  config: Record<string, unknown>;
};

/**
 * Config for rendering a live preview. Unlike getPublicTemplateBySlug this returns private
 * templates too, but only for their owner — a preview link must not become a way to read a
 * template that has been hidden.
 */
export async function getTemplateForPreview(id: number, viewerId: number): Promise<TemplatePreviewConfig | null> {
  if (!Number.isInteger(id) || id <= 0) return null;

  const [row] = await db
    .select({
      id: schema.templates.id,
      slug: schema.templates.slug,
      name: schema.templates.name,
      config: schema.templates.config,
      isPublic: schema.templates.isPublic,
      userId: schema.templates.userId,
    })
    .from(schema.templates)
    .where(eq(schema.templates.id, id))
    .limit(1);

  if (!row) return null;
  if (!row.isPublic && row.userId !== viewerId) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    isPublic: row.isPublic,
    config: (row.config as Record<string, unknown>) ?? {},
  };
}

export async function getViewerFavorite(templateId: number): Promise<{ favorited: boolean }> {
  const viewerId = await getSessionUserId().catch(() => undefined);
  if (!viewerId) return { favorited: false };
  const [row] = await db
    .select({ id: schema.templateFavorites.id })
    .from(schema.templateFavorites)
    .where(sql`${schema.templateFavorites.userId} = ${viewerId} AND ${schema.templateFavorites.templateId} = ${templateId}`)
    .limit(1);
  return { favorited: Boolean(row) };
}