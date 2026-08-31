import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { lt } from 'drizzle-orm'
import { cleanupExpiredUnverifiedUsers } from '@/lib/features/users/db'
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
    const now = new Date()

    const verification = await db
      .delete(schema.verificationTokens)
      .where(lt(schema.verificationTokens.expiresAt, now))

    const passwordReset = await db
      .delete(schema.passwordResetTokens)
      .where(lt(schema.passwordResetTokens.expiresAt, now))

    const otp = await db
      .delete(schema.otpTokens)
      .where(lt(schema.otpTokens.expiresAt, now))

    await cleanupExpiredUnverifiedUsers()

    return NextResponse.json({
      success: true,
      deleted: {
        verificationTokens: verification[0].affectedRows,
        passwordResetTokens: passwordReset[0].affectedRows,
        otpTokens: otp[0].affectedRows,
      },
    })
  } catch (error) {
    console.error('[cron] failed to run auth cleanup:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
