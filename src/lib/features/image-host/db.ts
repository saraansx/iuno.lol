import { db, schema } from '@/lib/db'
import { and, asc, desc, eq, gte, inArray, like, ne, sql, count } from 'drizzle-orm'
import type { ImageHostKind } from '@/lib/image-host'

export interface RecordImageHostFileInput {
  userId: number
  url: string
  name: string
  size: number
  kind: ImageHostKind
  mime: string
}

/**
 * Insert an image-host file row. If the same user re-uploads byte-identical
 * content (Catbox dedups it to the same URL, hitting the (user_id, url) unique
 * key) we just refresh the name — no new row, no extra quota.
 */
export async function recordImageHostFile(input: RecordImageHostFileInput): Promise<void> {
  await db
    .insert(schema.imageHostFiles)
    .values(input)
    .onDuplicateKeyUpdate({ set: { name: input.name } })
}

/** Total bytes this user is currently storing. */
export async function getImageHostUsedBytes(userId: number): Promise<number> {
  const [row] = await db
    .select({ used: sql<number>`coalesce(sum(${schema.imageHostFiles.size}), 0)` })
    .from(schema.imageHostFiles)
    .where(eq(schema.imageHostFiles.userId, userId))
  return Number(row?.used ?? 0)
}

export interface ImageHostStats {
  totalUploads: number
  storageUsedBytes: number
  favorites: number
  byKind: { kind: string; count: number }[]
  recent: number[] // upload timestamps (epoch ms) within the last 30 days (chart range window)
  recentFiles: { url: string; name: string; size: number; kind: string; createdAt: number }[] // newest first, capped
}

/** Aggregates powering the overview dashboard, all scoped to one user. */
export async function getImageHostStats(userId: number): Promise<ImageHostStats> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const owned = eq(schema.imageHostFiles.userId, userId)

  const [totalsRows, byKindRows, recentRows, recentFileRows] = await Promise.all([
    db
      .select({
        total: count(),
        used: sql<number>`coalesce(sum(${schema.imageHostFiles.size}), 0)`,
        favorites: sql<number>`coalesce(sum(${schema.imageHostFiles.favorite}), 0)`,
      })
      .from(schema.imageHostFiles)
      .where(owned),
    db
      .select({ kind: schema.imageHostFiles.kind, kindCount: count() })
      .from(schema.imageHostFiles)
      .where(owned)
      .groupBy(schema.imageHostFiles.kind),
    db
      .select({ createdAt: schema.imageHostFiles.createdAt })
      .from(schema.imageHostFiles)
      .where(and(owned, gte(schema.imageHostFiles.createdAt, thirtyDaysAgo))),
    db
      .select({
        url: schema.imageHostFiles.url,
        name: schema.imageHostFiles.name,
        size: schema.imageHostFiles.size,
        kind: schema.imageHostFiles.kind,
        createdAt: schema.imageHostFiles.createdAt,
      })
      .from(schema.imageHostFiles)
      .where(owned)
      .orderBy(desc(schema.imageHostFiles.createdAt))
      .limit(6),
  ])

  const totals = totalsRows[0]
  return {
    totalUploads: Number(totals?.total ?? 0),
    storageUsedBytes: Number(totals?.used ?? 0),
    favorites: Number(totals?.favorites ?? 0),
    byKind: byKindRows.map((r) => ({ kind: r.kind, count: Number(r.kindCount) })),
    recent: recentRows.map((r) => r.createdAt.getTime()),
    recentFiles: recentFileRows.map((r) => ({
      url: r.url,
      name: r.name,
      size: Number(r.size),
      kind: r.kind,
      createdAt: r.createdAt.getTime(),
    })),
  }
}

// ---------------------------------------------------------------------------
// Gallery: paginated listing + per-file management (favorite / delete). All
// scoped to one user; the userId clause is what enforces ownership on every
// read and write below.
// ---------------------------------------------------------------------------

export type ImageHostSort = 'newest' | 'oldest' | 'largest' | 'smallest'

export interface ImageHostFileRow {
  id: number
  url: string
  name: string
  size: number
  kind: string
  mime: string
  favorite: boolean
  createdAt: number
}

export interface ListImageHostFilesInput {
  userId: number
  page: number
  pageSize: number
  sort: ImageHostSort
  q?: string
  favoritesOnly?: boolean
}

export interface ListImageHostFilesResult {
  files: ImageHostFileRow[]
  total: number
  page: number
  pageSize: number
}

// Escape LIKE wildcards so a name search treats `%` and `_` literally.
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`)
}
// __GALLERY_DB_APPEND__
