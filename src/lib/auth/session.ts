import 'server-only'

import { decrypt, encrypt } from '@/lib/server/security/jwt'
import { addDays } from 'date-fns'
import { cookies } from 'next/headers'
import { cache } from 'react'
import * as z from 'zod'
import { randomUUID } from 'crypto'
import { redis } from '@/lib/redis'
import { getUserForSession } from '@/lib/features/users/db'

type SessionPayload = {
  userId: number
  jti: string
}

const SESSION_COOKIE_NAME = 'iuno_session'
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

function sessionKey(userId: number, jti: string) {
  return `sess:${userId}:${jti}`
}

export async function createSession(userId: number) {
  const expiresAt = addDays(new Date(), 7)
  const jti = randomUUID()

  const payload: SessionPayload = { userId, jti }
  const session = await encrypt(payload, expiresAt)
  const cookieStore = await cookies()

  const isProduction = process.env.NODE_ENV === 'production'

  try {
    await redis.set(sessionKey(userId, jti), '1', 'EX', SESSION_TTL_SECONDS)
  } catch {
  }

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: isProduction,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
    ...(isProduction && { domain: '.iuno.lol' }),
  })
}

export async function revokeAllSessions(userId: number) {
  try {
    let cursor = '0'
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `sess:${userId}:*`, 'COUNT', 100)
      cursor = nextCursor
      if (keys.length) await redis.del(...keys)
    } while (cursor !== '0')
  } catch {}
}

const decryptedSessionSchema = z.object({
  userId: z.number(),
  jti: z.string(),
  iat: z.number(),
  exp: z.number(),
})

type Session = {
  userId: number
}

const verifySession = cache(async (): Promise<Session | undefined> => {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  if (!cookie) return undefined

  const decoded = await decrypt(cookie)
  if (!decoded) return undefined

  const parsed = decryptedSessionSchema.safeParse(decoded)
  if (!parsed.success) return undefined

  try {
    const exists = await redis.get(sessionKey(parsed.data.userId, parsed.data.jti))
    if (!exists) return undefined
  } catch {
  }

  const user = await getUserForSession(parsed.data.userId)
  if (!user) return undefined
  if (user.passwordChangedAt) {
    const sessionIssuedAt = new Date(parsed.data.iat * 1000)
    if (user.passwordChangedAt >= sessionIssuedAt) {
      return undefined
    }
  }

  return { userId: parsed.data.userId }
})

export async function deleteSession() {
  try {
    const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
    if (cookie) {
      const decoded = await decrypt(cookie)
      const parsed = decryptedSessionSchema.safeParse(decoded as unknown)
      if (parsed.success) {
        await redis.del(sessionKey(parsed.data.userId, parsed.data.jti))
      }
    }
  } catch {}

  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    ...(isProduction && { domain: '.iuno.lol' }),
  })
}

export async function getSessionUserId(): Promise<number | undefined> {
  const session = await verifySession()
  return session?.userId
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await verifySession()
  return !!session
}
