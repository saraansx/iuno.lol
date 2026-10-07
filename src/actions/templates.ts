"use server";

import { revalidatePath } from "next/cache";
import { revalidateProfile } from "@/app/[username]/profile-data";
import { db, schema } from "@/lib/db";
import { eq, sql, desc } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById, getUserBackgrounds } from "@/lib/features/users/db";
import { pickTemplateConfig, sanitizeTemplateConfig, isTemplateConfigEmpty } from "@/lib/template-config";
import { sanitizeProfileSettings } from "@/lib/profile-settings-sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { screenshotProfile } from "@/lib/screenshot";
import { uploadBufferToCatbox } from "@/lib/upload-buffer";
import { deleteOwnedCatboxFiles } from "@/lib/catbox-ownership";
import { SITE_CONFIG } from "@/lib/config";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "template";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

function validateName(name: string): string | null {
  const t = name.trim();
  if (t.length < 3 || t.length > 32) return "Name must be 3-32 characters.";
  if (!/^[a-zA-Z0-9 _-]+$/.test(t)) return "Name can only use letters, numbers, space, _ and -.";
  return null;
}

async function revalidateOwnProfile(userId: number) {
  try {
    const user = await getUserById(userId);
    if (user?.username) revalidateProfile(user.username);
  } catch {}
}

export async function createTemplate(input: {
  name: string;
  thumbnailUrl?: string | null;
  config?: Record<string, unknown> | null;
  isPublic?: boolean;
}) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  const nameErr = validateName(input.name);
  if (nameErr) throw new Error(nameErr);

  const rl = await checkRateLimit(`template:create:${userId}`, 5, 60 * 60);
  if (!rl.ok) throw new Error(`Too many templates. Try again in ${Math.ceil(rl.retryAfterSeconds / 60)} min.`);

  const name = input.name.trim();

  const cntRows = (await db.execute(
    sql`SELECT COUNT(*) AS c FROM templates WHERE user_id = ${userId}`,
  )) as unknown as [[{ c: number | string }]];
  const count = cntRows?.[0]?.[0]?.c ?? 0;
  if (Number(count) >= 10) throw new Error("You can create up to 10 templates.");

  const [dup] = await db
    .select({ id: schema.templates.id })
    .from(schema.templates)
    .where(sql`${schema.templates.userId} = ${userId} AND LOWER(${schema.templates.name}) = LOWER(${name})`)
    .limit(1);
  if (dup) throw new Error("You already have a template with that name.");

  const fullUser = await getUserById(userId);
  if (!fullUser) throw new Error("User not found");
  let config = pickTemplateConfig(fullUser);
  const ownBackgrounds = await getUserBackgrounds(userId);
  if (ownBackgrounds.length > 0) config.backgrounds = ownBackgrounds.slice(0, 20);
  if (input.config && typeof input.config === "object") {
    const sanitized = sanitizeTemplateConfig(input.config as Record<string, unknown>);
    if (!isTemplateConfigEmpty(sanitized)) config = sanitized;
  }
  if (isTemplateConfigEmpty(config)) throw new Error("Nothing to save as template.");

  const slug = slugify(name);

  let thumbnailUrl: string | null = null;
  if (fullUser.username) {
    try {
      const buf = await screenshotProfile({
        url: `${SITE_CONFIG.url}/${fullUser.username}/shot`,
      });
      thumbnailUrl = await uploadBufferToCatbox(userId, buf, { ext: "jpg", mime: "image/jpeg" });
    } catch (e) {
      console.error("[createTemplate] cover screenshot failed:", e);
    }
  }

  await db.insert(schema.templates).values({
    userId,
    slug,
    name,
    thumbnailUrl,
    config: config as Record<string, unknown>,
        isPublic: input.isPublic !== false,
    useCount: 0,
  });

  revalidatePath("/dashboard/customize/templates");
  return { slug, name };
}

export async function deleteTemplate(id: number) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid id");

  const [row] = await db.select({ userId: schema.templates.userId, thumbnailUrl: schema.templates.thumbnailUrl }).from(schema.templates).where(eq(schema.templates.id, id)).limit(1);
  if (!row) throw new Error("Template not found");
  const me = await getUserById(userId);
  const isAdmin = me?.role === "admin";
  if (row.userId !== userId && !isAdmin) throw new Error("Not allowed");

  await db.delete(schema.templates).where(eq(schema.templates.id, id));

  if (row.thumbnailUrl && row.userId) {
    await deleteOwnedCatboxFiles(row.userId, [row.thumbnailUrl]).catch(() => {});
  }

  revalidatePath("/dashboard/customize/templates");
  return { ok: true };
}

export async function setTemplateVisibility(id: number, isPublic: boolean) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid id");

  const [row] = await db.select({ userId: schema.templates.userId }).from(schema.templates).where(eq(schema.templates.id, id)).limit(1);
  if (!row) throw new Error("Template not found");
  const me = await getUserById(userId);
  const isAdmin = me?.role === "admin";
  if (row.userId !== userId && !isAdmin) throw new Error("Not allowed");

  await db.update(schema.templates).set({ isPublic }).where(eq(schema.templates.id, id));
  revalidatePath("/dashboard/customize/templates");
  return { ok: true, isPublic };
}

export async function applyTemplate(id: number) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid id");

  const rl = await checkRateLimit(`template:apply:${userId}`, 20, 60);
  if (!rl.ok) throw new Error(`Too fast. Try again in ${rl.retryAfterSeconds}s.`);

  const [tpl] = await db.select({ config: schema.templates.config }).from(schema.templates).where(eq(schema.templates.id, id)).limit(1);
  if (!tpl) throw new Error("Template not found");
  const config = (tpl.config as Record<string, unknown>) ?? {};
  const sanitized = sanitizeTemplateConfig(config);
  if (isTemplateConfigEmpty(sanitized)) throw new Error("Template is empty.");

  const backgrounds = Array.isArray(sanitized.backgrounds) ? sanitized.backgrounds : null;
  delete (sanitized as Record<string, unknown>).backgrounds;

  sanitizeProfileSettings(sanitized as Record<string, unknown>);

  if (Object.keys(sanitized).length > 0) {
    await db
      .insert(schema.userSettings)
      .values({ userId, ...(sanitized as Record<string, unknown>) } as typeof schema.userSettings.$inferInsert)
      .onDuplicateKeyUpdate({ set: sanitized as Record<string, unknown> });
  }

  if (backgrounds) {
    await db.delete(schema.userBackgrounds).where(eq(schema.userBackgrounds.userId, userId));
    if (backgrounds.length > 0) {
      await db.insert(schema.userBackgrounds).values(
        backgrounds.map((url, i) => ({ userId, url, position: i })),
      );
    }
  }

  await db
    .execute(sql`UPDATE templates SET use_count = use_count + 1, updated_at = NOW() WHERE id = ${id}`)
    .catch(() => {});

  revalidatePath("/dashboard/customize/templates");
  await revalidateOwnProfile(userId);
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export type TemplateListItem = {
  id: number;
  slug: string;
  name: string;
  thumbnailUrl: string | null;
  isPublic: boolean;
  useCount: number;
  createdAt: string;
  creatorId: number | null;
  creatorUsername: string | null;
  favorited?: boolean;
  favoriteCount: number;
};

async function getFavoriteCounts(ids: number[]): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (ids.length === 0) return map;
  const rows = await db
    .select({ templateId: schema.templateFavorites.templateId, c: sql<number>`COUNT(*)` })
    .from(schema.templateFavorites)
    .where(sql`${schema.templateFavorites.templateId} IN ${ids}`)
    .groupBy(schema.templateFavorites.templateId);
  for (const r of rows) map.set(r.templateId, Number(r.c ?? 0));
  return map;
}

export async function listTemplates(opts?: { q?: string; sort?: "newest" | "popular"; page?: number; limit?: number; tab?: "public" | "favorites" | "mine" }): Promise<{
  items: TemplateListItem[];
  total: number;
}> {
  const q = opts?.q?.trim().slice(0, 64) ?? "";
  const sort = opts?.sort === "popular" ? "popular" : "newest";
  const page = Math.max(1, Number(opts?.page ?? 1) || 1);
  const limit = Math.min(48, Math.max(1, Number(opts?.limit ?? 24) || 24));
  const offset = (page - 1) * limit;
  const tab = opts?.tab ?? "public";

  let viewerId: number | undefined;
  if (tab === "favorites" || tab === "mine") {
    viewerId = (await getSessionUserId()) ?? undefined;
    if (!viewerId) return { items: [], total: 0 };
  }

  let baseWhere: ReturnType<typeof sql>;
  if (tab === "mine") {
    baseWhere = q
      ? sql`${schema.templates.userId} = ${viewerId} AND ${schema.templates.name} LIKE ${`%${q}%`}`
      : sql`${schema.templates.userId} = ${viewerId}`;
  } else if (tab === "favorites") {
    baseWhere = q
      ? sql`${schema.templates.isPublic} = true AND ${schema.templates.name} LIKE ${`%${q}%`}`
      : sql`${schema.templates.isPublic} = true`;
  } else {
    baseWhere = q
      ? sql`${schema.templates.isPublic} = true AND ${schema.templates.name} LIKE ${`%${q}%`}`
      : sql`${schema.templates.isPublic} = true`;
  }

  if (tab === "favorites" && viewerId) {
    const favWhere = q
      ? sql`${schema.templateFavorites.userId} = ${viewerId} AND ${schema.templates.name} LIKE ${`%${q}%`}`
      : sql`${schema.templateFavorites.userId} = ${viewerId}`;

    const [{ c: favTotalRaw }] = await db
      .select({ c: sql<number>`COUNT(*)` })
      .from(schema.templateFavorites)
      .innerJoin(schema.templates, eq(schema.templateFavorites.templateId, schema.templates.id))
      .where(favWhere)
      .then((r) => r as unknown as [{ c: number | string }]);
    const favTotal = Number(favTotalRaw ?? 0);

    const favOrderBy =
      sort === "popular"
        ? [desc(schema.templates.useCount), desc(schema.templates.createdAt)]
        : [desc(schema.templateFavorites.createdAt)];

    const favRows = await db
      .select({
        id: schema.templates.id,
        slug: schema.templates.slug,
        name: schema.templates.name,
        thumbnailUrl: schema.templates.thumbnailUrl,
        isPublic: schema.templates.isPublic,
        useCount: schema.templates.useCount,
        createdAt: schema.templates.createdAt,
        creatorId: schema.templates.userId,
      })
      .from(schema.templateFavorites)
      .innerJoin(schema.templates, eq(schema.templateFavorites.templateId, schema.templates.id))
      .where(favWhere)
      .orderBy(...favOrderBy)
      .limit(limit)
      .offset(offset);

    const creatorIdsF = [...new Set(favRows.map((r) => r.creatorId).filter(Boolean) as number[])];
    const creatorMapF = new Map<number, string>();
    if (creatorIdsF.length) {
      const usersRows = await db.select({ id: schema.users.id, username: schema.users.username }).from(schema.users).where(sql`${schema.users.id} IN ${creatorIdsF}`);
      for (const u of usersRows) creatorMapF.set(u.id, u.username);
    }

    const favCountMap = await getFavoriteCounts(favRows.map((r) => r.id));

    const favItems: TemplateListItem[] = favRows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      thumbnailUrl: r.thumbnailUrl ?? null,
      isPublic: Boolean(r.isPublic),
      useCount: Number(r.useCount ?? 0),
      favoriteCount: favCountMap.get(r.id) ?? 0,
      createdAt: r.createdAt ? new Date(r.createdAt as unknown as string).toISOString() : new Date().toISOString(),
      creatorId: r.creatorId ?? null,
      creatorUsername: r.creatorId ? (creatorMapF.get(r.creatorId) ?? null) : null,
      favorited: true,
    }));

    return { items: favItems, total: favTotal };
  }

  const [{ c: totalRaw }] = await db
    .select({ c: sql<number>`COUNT(*)` })
    .from(schema.templates)
    .where(baseWhere)
    .then((r) => r as unknown as [{ c: number | string }]);

  const total = Number(totalRaw ?? 0);

  const orderBy =
    sort === "popular"
      ? [desc(schema.templates.useCount), desc(schema.templates.createdAt)]
      : [desc(schema.templates.createdAt)];

  const drizzleRows = await db
    .select({
      id: schema.templates.id,
      slug: schema.templates.slug,
      name: schema.templates.name,
      thumbnailUrl: schema.templates.thumbnailUrl,
      isPublic: schema.templates.isPublic,
      useCount: schema.templates.useCount,
      createdAt: schema.templates.createdAt,
      creatorId: schema.templates.userId,
    })
    .from(schema.templates)
    .where(baseWhere)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  const creatorIds = [...new Set(drizzleRows.map((r) => r.creatorId).filter(Boolean) as number[])];
  const creatorMap = new Map<number, string>();
  if (creatorIds.length) {
    const usersRows = await db
      .select({ id: schema.users.id, username: schema.users.username })
      .from(schema.users)
      .where(sql`${schema.users.id} IN ${creatorIds}`);
    for (const u of usersRows) creatorMap.set(u.id, u.username);
  }

  const favSet = new Set<number>();
  const idList = drizzleRows.map((r) => r.id);
  if (idList.length) {
    const vid = await getSessionUserId().catch(() => undefined);
    if (vid) {
      const favRows = await db
        .select({ templateId: schema.templateFavorites.templateId })
        .from(schema.templateFavorites)
        .where(sql`${schema.templateFavorites.userId} = ${vid} AND ${schema.templateFavorites.templateId} IN ${idList}`);
      for (const f of favRows) favSet.add(f.templateId);
    }
  }

  const favCountMap = await getFavoriteCounts(idList);

  const items: TemplateListItem[] = drizzleRows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    thumbnailUrl: r.thumbnailUrl ?? null,
    isPublic: Boolean(r.isPublic),
    useCount: Number(r.useCount ?? 0),
    favoriteCount: favCountMap.get(r.id) ?? 0,
    createdAt: r.createdAt ? new Date(r.createdAt as unknown as string).toISOString() : new Date().toISOString(),
    creatorId: r.creatorId ?? null,
    creatorUsername: r.creatorId ? (creatorMap.get(r.creatorId) ?? null) : null,
    favorited: favSet.has(r.id),
  }));

  return { items, total };
}
