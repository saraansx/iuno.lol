import { db, schema } from '@/lib/db'
import { addMinutes } from 'date-fns'
import { eq, and, gt, lt } from 'drizzle-orm'
import { randomBytes, createHash } from 'crypto'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createVerificationToken(email: string): Promise<string> {
  const token     = randomBytes(32).toString('hex')
  const expiresAt = addMinutes(new Date(), 4)
  const hashed    = hashToken(token)

  await db.delete(schema.verificationTokens).where(lt(schema.verificationTokens.expiresAt, new Date()))

  await db.transaction(async (tx) => {
    const existingRows = await tx
      .select()
      .from(schema.verificationTokens)
      .where(eq(schema.verificationTokens.email, email))
      .for("update")

    if (existingRows.length > 0) {
      const timePassed = (Date.now() - existingRows[0].createdAt.getTime()) / 1000
      if (timePassed < 60) {
        throw new Error(`Please wait ${Math.ceil(60 - timePassed)} seconds before requesting another email.`)
      }
    }

    await tx.delete(schema.verificationTokens).where(eq(schema.verificationTokens.email, email))
    await tx.insert(schema.verificationTokens).values({ email, token: hashed, expiresAt })
  })

  return token
}

export async function deleteVerificationTokens(email: string) {
  await db.delete(schema.verificationTokens).where(eq(schema.verificationTokens.email, email))
}

export async function consumeVerificationToken(token: string): Promise<string | null> {
  const now    = new Date()
  const hashed = hashToken(token)

  const row = await db.query.verificationTokens.findFirst({
    where: and(
      eq(schema.verificationTokens.token, hashed),
      gt(schema.verificationTokens.expiresAt, now)
    ),
  })

  if (!row) return null

  await db.delete(schema.verificationTokens).where(eq(schema.verificationTokens.id, row.id))

  return row.email
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const token     = randomBytes(32).toString('hex')
  const expiresAt = addMinutes(new Date(), 5)
  const hashed    = hashToken(token)

  await db.delete(schema.passwordResetTokens).where(lt(schema.passwordResetTokens.expiresAt, new Date()))

  await db.transaction(async (tx) => {
    const existingRows = await tx
      .select()
      .from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.email, email))
      .for("update")

    if (existingRows.length > 0) {
      const timePassed = (Date.now() - existingRows[0].createdAt.getTime()) / 1000
      if (timePassed < 60) {
        throw new Error(`Please wait ${Math.ceil(60 - timePassed)} seconds before requesting another email.`)
      }
    }

    await tx.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.email, email))
    await tx.insert(schema.passwordResetTokens).values({ email, token: hashed, expiresAt })
  })

  return token
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const now    = new Date()
  const hashed = hashToken(token)

  const row = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(schema.passwordResetTokens.token, hashed),
      gt(schema.passwordResetTokens.expiresAt, now)
    ),
  })

  if (!row) return null

  await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.id, row.id))

  return row.email
}
