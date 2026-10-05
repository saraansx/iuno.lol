import 'server-only'

import { decrypt, encrypt } from '@/lib/server/security/jwt'
import { addDays } from 'date-fns'
import { cookies, headers } from 'next/headers'
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

async function getRequestMeta(): Promise<{ ua: string; ip: string | null }> {
  try {
    const h = await headers()
    const ua = h.get('user-agent')?.slice(0, 400) ?? 'Unknown device'
    const ipRaw = h.get('cf-connecting-ip')?.split(',')[0]?.trim() || h.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const ip = ipRaw && ipRaw.length <= 45 ? ipRaw : null
    return { ua: ua || 'Unknown device', ip }
  } catch {
    return { ua: 'Unknown device', ip: null }
  }
}

export async function createSession(userId: number) {
  const expiresAt = addDays(new Date(), 7)
  const jti = randomUUID()
  const payload: SessionPayload = { userId, jti }
  const session = await encrypt(payload, expiresAt)
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  const meta = await getRequestMeta()
  const storeValue = JSON.stringify({ ua: meta.ua, ip: meta.ip, createdAt: new Date().toISOString() })
  try {
    await redis.set(sessionKey(userId, jti), storeValue, 'EX', SESSION_TTL_SECONDS)
  } catch {}
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

export async function revokeSession(userId: number, jti: string): Promise<boolean> {
  if (!/^[A-Za-z0-9-]{36}$/.test(jti) && !/^[0-9a-f-]{36}$/i.test(jti)) {
    if (!/^[A-Za-z0-9_-]{10,64}$/.test(jti)) return false
  }
  const key = sessionKey(userId, jti)
  try {
    const n = await redis.del(key)
    return n > 0
  } catch { return false }
}

export async function revokeOtherSessions(userId: number, currentJti: string): Promise<number> {
  let deleted = 0
  try {
    let cursor = '0'
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `sess:${userId}:*`, 'COUNT', 100)
      cursor = nextCursor
      const toDelete = keys.filter((k) => !k.endsWith(`:${currentJti}`))
      if (toDelete.length) deleted += await redis.del(...toDelete)
    } while (cursor !== '0')
  } catch {}
  return deleted
}

export type ActiveSession = {
  jti: string
  ua: string
  ip: string | null
  createdAt: string | null
  current: boolean
  expiresAt: string | null
}

export async function getActiveSessionsForUser(userId: number): Promise<ActiveSession[]> {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  let currentJti: string | null = null
  if (cookie) {
    try {
      const decoded = await decrypt(cookie)
      const parsed = decryptedSessionSchema.safeParse(decoded)
      if (parsed.success) currentJti = parsed.data.jti
    } catch {}
  }
  const sessions: ActiveSession[] = []
  try {
    let cursor = '0'
    const keys: string[] = []
    do {
      const [nextCursor, batch] = await redis.scan(cursor, 'MATCH', `sess:${userId}:*`, 'COUNT', 100)
      cursor = nextCursor
      keys.push(...batch)
    } while (cursor !== '0')
    if (keys.length === 0) return []
    const values = keys.length ? await redis.mget(...keys) : []
    const now = Date.now()
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const raw = values[i] as string | null
      const jti = key.split(':').pop() ?? ''
      let ua = 'Unknown device'
      let ip: string | null = null
      let createdAt: string | null = null
      if (raw) {
        if (raw === '1') {
          ua = 'Unknown device'
        } else {
          try {
            const parsed = JSON.parse(raw)
            if (typeof parsed.ua === 'string') ua = parsed.ua
            if (typeof parsed.ip === 'string') ip = parsed.ip
            if (typeof parsed.createdAt === 'string') createdAt = parsed.createdAt
          } catch { ua = raw.slice(0, 400) }
        }
      }
      let ttl: number | null = null
      try { ttl = await redis.ttl(key) } catch {}
      const expiresAt = ttl && ttl > 0 ? new Date(now + ttl * 1000).toISOString() : null
      sessions.push({ jti, ua, ip, createdAt, current: jti === currentJti, expiresAt })
    }
  } catch {}
  sessions.sort((a, b) => (a.current ? -1 : b.current ? 1 : 0))
  return sessions
}

const decryptedSessionSchema = z.object({
  userId: z.number(),
  jti: z.string(),
  iat: z.number(),
  exp: z.number(),
})

type Session = { userId: number }

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
  } catch {}
  const user = await getUserForSession(parsed.data.userId)
  if (!user) return undefined
  if (user.passwordChangedAt) {
    const sessionIssuedAt = new Date(parsed.data.iat * 1000)
    if (user.passwordChangedAt >= sessionIssuedAt) return undefined
  }
  return { userId: parsed.data.userId }
})

export async function deleteSession() {
  try {
    const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
    if (cookie) {
      const decoded = await decrypt(cookie)
      const parsed = decryptedSessionSchema.safeParse(decoded as unknown)
      if (parsed.success) await redis.del(sessionKey(parsed.data.userId, parsed.data.jti))
    }
  } catch {}
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    maxAge: 0, path: '/', httpOnly: true, secure: isProduction, sameSite: 'lax',
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

export async function getCurrentJti(): Promise<string | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  if (!cookie) return null
  const decoded = await decrypt(cookie)
  const parsed = decryptedSessionSchema.safeParse(decoded)
  return parsed.success ? parsed.data.jti : null
}
