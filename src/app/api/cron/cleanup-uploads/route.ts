import { NextResponse } from 'next/server'
import { eq, lt } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { isAuthorizedCron } from '@/lib/cron-auth'
import { storedFileId } from '@/lib/cdn'
import { deleteOwnedCatboxFiles } from '@/lib/catbox-ownership'

// Orphan uploads older than this get deleted. Grace period exists so an
// upload that isn't attached to a profile YET (user still editing) survives.
const GRACE_MS = 48 * 60 * 60 * 1000

export async function GET(request: Request) {
  return handleCleanup(request)
}

export async function POST(request: Request) {
  return handleCleanup(request)
}

async function handleCleanup(request: Request) {
  if (!isAuthorizedCron(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const cutoff = new Date(Date.now() - GRACE_MS)
    const old = await db.query.uploadedFiles.findMany({
      where: lt(schema.uploadedFiles.createdAt, cutoff),
    })

    if (old.length === 0) {
      return NextResponse.json({ success: true, checked: 0, deletedFiles: 0, deletedRows: 0 })
    }

    // Whole settings rows stringified: a referenced file id shows up anywhere,
    // including CDN rewrites (same id) and JSON blobs (music/links/widgets).
    const allSettings = await db.query.userSettings.findMany()
    const haystack = allSettings.map((s) => JSON.stringify(s))

    let deletedFiles = 0
    let deletedRows = 0
    for (const row of old) {
      const id = storedFileId(row.url)
      if (id !== null && haystack.some((h) => h.includes(id))) continue

      if (id === null) {
        // External URL (e.g. old jsdelivr avatar): no Catbox file, drop row only.
        await db.delete(schema.uploadedFiles).where(eq(schema.uploadedFiles.id, row.id))
        deletedRows++
        continue
      }

      // Ownership re-verified inside; deletes the Catbox file + the row.
      await deleteOwnedCatboxFiles(row.userId, [row.url])
      deletedFiles++
      deletedRows++
    }

    return NextResponse.json({ success: true, checked: old.length, deletedFiles, deletedRows })
  } catch (error) {
    console.error('[cron] failed to run uploads cleanup:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
