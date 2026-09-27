import { db, schema } from '@/lib/db'
import { and, desc, eq, gte, inArray, sql, count } from 'drizzle-orm'
import { imageHostFileId } from '@/lib/cdn'
import type { ImageHostKind } from '@/lib/image-host'

export interface RecordImageHostFileInput {
  userId: number
  url: string
  name: string
  size: number
  kind: ImageHostKind
  mime: string
}

export async function recordImageHostFile(input: RecordImageHostFileInput): Promise<void> {
  await db
    .insert(schema.imageHostFiles)
    .values(input)
    .onDuplicateKeyUpdate({ set: { name: input.name } })
}

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
  recent: number[]
  recentFiles: { url: string; name: string; size: number; kind: string; createdAt: number }[]
}

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

export type ImageHostFilter = 'all' | 'image' | 'video' | 'favorite'

export interface ImageHostFile {
  id: number
  url: string
  name: string
  size: number
  kind: string
  favorite: boolean
  createdAt: number
}

export interface ListImageHostFilesResult {
  files: ImageHostFile[]
  total: number
}

export async function listImageHostFiles(
  userId: number,
  { limit, offset, filter }: { limit: number; offset: number; filter: ImageHostFilter },
): Promise<ListImageHostFilesResult> {
  const conditions = [eq(schema.imageHostFiles.userId, userId)]
  if (filter === 'image' || filter === 'video') {
    conditions.push(eq(schema.imageHostFiles.kind, filter))
  } else if (filter === 'favorite') {
    conditions.push(eq(schema.imageHostFiles.favorite, true))
  }
  const where = and(...conditions)

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: schema.imageHostFiles.id,
        url: schema.imageHostFiles.url,
        name: schema.imageHostFiles.name,
        size: schema.imageHostFiles.size,
        kind: schema.imageHostFiles.kind,
        favorite: schema.imageHostFiles.favorite,
        createdAt: schema.imageHostFiles.createdAt,
      })
      .from(schema.imageHostFiles)
      .where(where)
      .orderBy(desc(schema.imageHostFiles.createdAt), desc(schema.imageHostFiles.id))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(schema.imageHostFiles).where(where),
  ])

  return {
    files: rows.map((r) => ({
      id: r.id,
      url: r.url,
      name: r.name,
      size: Number(r.size),
      kind: r.kind,
      favorite: Boolean(r.favorite),
      createdAt: r.createdAt.getTime(),
    })),
    total: Number(totalRows[0]?.total ?? 0),
  }
}

export async function setImageHostFavorite(
  userId: number,
  ids: number[],
  favorite: boolean,
): Promise<number[]> {
  if (ids.length === 0) return []
  const owned = and(
    eq(schema.imageHostFiles.userId, userId),
    inArray(schema.imageHostFiles.id, ids),
  )
  const rows = await db
    .select({ id: schema.imageHostFiles.id })
    .from(schema.imageHostFiles)
    .where(owned)
  const ownedIds = rows.map((r) => r.id)
  if (ownedIds.length === 0) return []
  await db.update(schema.imageHostFiles).set({ favorite }).where(owned)
  return ownedIds
}

export interface DeleteImageHostFilesResult {
  deletedIds: number[]
  orphanedFileIds: string[]
  usedBytes: number
}

export async function deleteImageHostFiles(
  userId: number,
  ids: number[],
): Promise<DeleteImageHostFilesResult> {
  if (ids.length === 0) {
    return { deletedIds: [], orphanedFileIds: [], usedBytes: await getImageHostUsedBytes(userId) }
  }

  return db.transaction(async (tx) => {
    const owned = and(
      eq(schema.imageHostFiles.userId, userId),
      inArray(schema.imageHostFiles.id, ids),
    )
    const rows = await tx
      .select({ id: schema.imageHostFiles.id, url: schema.imageHostFiles.url })
      .from(schema.imageHostFiles)
      .where(owned)

    if (rows.length === 0) {
      const [usedRow] = await tx
        .select({ used: sql<number>`coalesce(sum(${schema.imageHostFiles.size}), 0)` })
        .from(schema.imageHostFiles)
        .where(eq(schema.imageHostFiles.userId, userId))
      return { deletedIds: [], orphanedFileIds: [], usedBytes: Number(usedRow?.used ?? 0) }
    }

    const deletedIds = rows.map((r) => r.id)
    const urls = [...new Set(rows.map((r) => r.url))]

    await tx.delete(schema.imageHostFiles).where(owned)

    const stillReferenced = await tx
      .select({ url: schema.imageHostFiles.url })
      .from(schema.imageHostFiles)
      .where(inArray(schema.imageHostFiles.url, urls))
    const referenced = new Set(stillReferenced.map((r) => r.url))
    const orphanedFileIds = urls
      .filter((u) => !referenced.has(u))
      .map((u) => imageHostFileId(u))
      .filter((id): id is string => id !== null)

    const [usedRow] = await tx
      .select({ used: sql<number>`coalesce(sum(${schema.imageHostFiles.size}), 0)` })
      .from(schema.imageHostFiles)
      .where(eq(schema.imageHostFiles.userId, userId))

    return { deletedIds, orphanedFileIds, usedBytes: Number(usedRow?.used ?? 0) }
  })
}
