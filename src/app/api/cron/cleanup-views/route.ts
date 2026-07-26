import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await db.execute(sql`
      DELETE FROM profile_views 
      WHERE view_date < DATE_SUB(UTC_DATE(), INTERVAL 6 DAY)
    `)

    return NextResponse.json({ success: true, message: 'Cleaned up profile views older than 7 days.' })
  } catch (error: any) {
    console.error('[cron] failed to run profile views daily cleanup:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
