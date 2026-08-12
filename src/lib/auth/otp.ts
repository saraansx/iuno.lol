import { db, schema } from '@/lib/db'
import { addMinutes } from 'date-fns'
import { eq, lt } from 'drizzle-orm'
import { randomInt } from 'crypto'
import bcrypt from 'bcrypt'

import { redis } from '@/lib/redis'

function generateOTP(): string {
  return randomInt(100000, 1000000).toString()
}

async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10)
}

async function isOTPCorrect(otp: string, hashedOTP: string): Promise<boolean> {
  return bcrypt.compare(otp, hashedOTP.replace('$2y$', '$2a$'))
}

/** Create or replace a 6-digit OTP for the given email (expires in 5 min) */
export async function createOTPToken(email: string): Promise<string> {
  const otp        = generateOTP()
  const expiresAt  = addMinutes(new Date(), 5)
  const hashedOTP  = await hashOTP(otp)

  // Cleanup all expired OTP tokens
  await db.delete(schema.otpTokens).where(lt(schema.otpTokens.expiresAt, new Date()))

  await db.transaction(async (tx) => {
    const existingRows = await tx
      .select()
      .from(schema.otpTokens)
      .where(eq(schema.otpTokens.email, email))
      .for("update")

    if (existingRows.length > 0) {
      const timePassed = (Date.now() - existingRows[0].createdAt.getTime()) / 1000
      if (timePassed < 60) {
        throw new Error(`Please wait ${Math.ceil(60 - timePassed)} seconds before requesting another OTP.`)
      }
    }

    await tx.delete(schema.otpTokens).where(eq(schema.otpTokens.email, email))
    await tx.insert(schema.otpTokens).values({ email, token: hashedOTP, expiresAt })
  })

  return otp
}

/** Verify an OTP — returns status and deletes the token if valid or max attempts reached */
export async function verifyOTPToken(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  // Find the hashed token by email (must still be valid)
  const row = await db.query.otpTokens.findFirst({
    where: eq(schema.otpTokens.email, email),
    orderBy: (tokens, { desc }) => [desc(tokens.createdAt)]
  })

  if (!row || new Date() > row.expiresAt) {
    return { success: false, error: 'Invalid or expired OTP.' }
  }

  const attemptsKey = `otp_attempts:${email}:${row.id}`

  const isValid = await isOTPCorrect(otp, row.token)
  if (!isValid) {
    const attempts = await redis.incr(attemptsKey)
    await redis.expire(attemptsKey, 300) // 5 min window

    const maxAttempts = 3
    const remaining = maxAttempts - attempts

    if (remaining <= 0) {
      // Too many failures, delete the OTP token completely
      await db.delete(schema.otpTokens).where(eq(schema.otpTokens.id, row.id))
      await redis.del(attemptsKey)
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' }
    }

    return { success: false, error: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` }
  }

  // Success, clean up database and Redis attempts tracker
  await db.delete(schema.otpTokens).where(eq(schema.otpTokens.id, row.id))
  await redis.del(attemptsKey)

  return { success: true }
}
