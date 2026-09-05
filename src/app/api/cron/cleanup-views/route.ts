import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { isAuthorizedCron } from '@/lib/cron-auth'

export async function GET(request: Request) {
  return handleCleanup(request);
}

export async function POST(request: Request) {
  return handleCleanup(request);
}

async function handleCleanup(request: Request) {
  if (!isAuthorizedCron(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await db.execute(sql`
      DELETE FROM profile_views
      WHERE view_date <= DATE_SUB(UTC_DATE(), INTERVAL 7 DAY)
    `)

    return NextResponse.json({ success: true, message: 'Cleaned up profile views older than 7 days.' })
  } catch (error) {
    console.error('[cron] failed to run profile views daily cleanup:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
