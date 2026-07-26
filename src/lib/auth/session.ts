'use server'

import { decrypt, encrypt } from '@/lib/server/security/jwt'
import { addDays } from 'date-fns'
import { cookies } from 'next/headers'
import * as z from 'zod'
import { getUserById } from '@/lib/features/users/db'

type SessionPayload = {
  userId: number
  expiresAt: Date
}

const SESSION_COOKIE_NAME = 'iuno_session'

export async function createSession(userId: number) {
  const expiresAt = addDays(new Date(), 7)

  const payload: SessionPayload = { userId, expiresAt }
  const session = await encrypt(payload)
  const cookieStore = await cookies()

  const isProduction = process.env.NODE_ENV === 'production'

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: isProduction,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
    ...(isProduction && { domain: '.iuno.lol' }),
  })
}

const decryptedSessionSchema = z.object({
  userId: z.number(),
  expiresAt: z.string(),
  iat: z.number(),
  exp: z.number(),
})

type Session = {
  userId: number
}

export async function verifySession(): Promise<Session | undefined> {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  if (!cookie) return undefined

  const decoded = await decrypt(cookie)
  if (!decoded) return undefined

  const parsed = decryptedSessionSchema.safeParse(decoded)
  if (!parsed.success) return undefined

  const user = await getUserById(parsed.data.userId)
  if (!user) return undefined
  if (user.passwordChangedAt) {
    const sessionIssuedAt = new Date(parsed.data.iat * 1000)
    if (user.passwordChangedAt > sessionIssuedAt) {
      return undefined 
    }
  }

  return { userId: parsed.data.userId }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSessionUserId(): Promise<number | undefined> {
  const session = await verifySession()
  return session?.userId
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await verifySession()
  return !!session
}
