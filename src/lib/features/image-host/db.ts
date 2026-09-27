import { db, schema } from '@/lib/db'
import { and, desc, eq, gte, sql, count } from 'drizzle-orm'
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
