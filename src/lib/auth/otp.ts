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

export async function createOTPToken(email: string): Promise<string> {
  const otp        = generateOTP()
  const expiresAt  = addMinutes(new Date(), 5)
  const hashedOTP  = await hashOTP(otp)

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

export async function verifyOTPToken(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const row = await db.query.otpTokens.findFirst({
    where: eq(schema.otpTokens.email, email),
    orderBy: (tokens, { desc }) => [desc(tokens.createdAt)]
  })

  if (!row || new Date() > row.expiresAt) {
    return { success: false, error: 'Invalid or expired OTP.' }
  }

  const attemptsKey = `otp_attempts:${email}:${row.id}`
  const attempts = await redis.incr(attemptsKey)
  if (attempts === 1) {
    await redis.expire(attemptsKey, 300)
  }

  const maxAttempts = 3
  if (attempts > maxAttempts) {
    await db.delete(schema.otpTokens).where(eq(schema.otpTokens.id, row.id))
    await redis.del(attemptsKey)
    return { success: false, error: 'Too many failed attempts. Please request a new OTP.' }
  }

  const isValid = await isOTPCorrect(otp, row.token)
  if (!isValid) {
    const remaining = maxAttempts - attempts
    if (remaining <= 0) {
      await db.delete(schema.otpTokens).where(eq(schema.otpTokens.id, row.id))
      await redis.del(attemptsKey)
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' }
    }

    return { success: false, error: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` }
  }

  await db.delete(schema.otpTokens).where(eq(schema.otpTokens.id, row.id))
  await redis.del(attemptsKey)

  return { success: true }
}
