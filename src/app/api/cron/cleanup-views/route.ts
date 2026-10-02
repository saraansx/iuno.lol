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
      WHERE view_date <= DATE_SUB(UTC_DATE(), INTERVAL 30 DAY)
    `)
    await db.execute(sql`
      DELETE FROM profile_views_hourly
      WHERE view_hour < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 25 HOUR)
    `)

    return NextResponse.json({ success: true, message: 'Cleaned up daily views older than 30 days and hourly views older than 25 hours.' })
  } catch (error) {
    console.error('[cron] failed to run profile views daily cleanup:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
