import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

const TURNSTILE_PASS_COOKIE = 'discord_turnstile_pass'
const PASS_TTL_SECONDS = 5 * 60

function passKey(passId: string) {
  return `discord_turnstile_pass:${passId}`
}

export async function issueTurnstilePass(token: string, ip: string | null): Promise<string | null> {
  const { verifyTurnstileToken } = await import('@/lib/server/security/turnstile')
  const valid = await verifyTurnstileToken(token, ip ?? undefined)
  if (!valid) return null

  const passId = randomUUID()
  const { redis } = await import('@/lib/redis')
  await redis.set(passKey(passId), ip ?? '', 'EX', PASS_TTL_SECONDS)

  const cookieStore = await cookies()
  cookieStore.set(TURNSTILE_PASS_COOKIE, passId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PASS_TTL_SECONDS,
    path: '/',
  })
  return passId
}

export async function consumeTurnstilePass(ip: string | null): Promise<boolean> {
  const cookieStore = await cookies()
  const passId = cookieStore.get(TURNSTILE_PASS_COOKIE)?.value
  if (!passId || !/^[0-9a-f-]{36}$/i.test(passId)) return false

  const { redis } = await import('@/lib/redis')
  const key = passKey(passId)
  const storedIp = await redis.get(key)
  await redis.del(key)
  cookieStore.set(TURNSTILE_PASS_COOKIE, '', { maxAge: 0, path: '/' })

  if (storedIp === null) return false

  if (storedIp === '' || ip === null) return true
  return storedIp === ip
}