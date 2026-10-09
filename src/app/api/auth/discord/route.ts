import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { getClientIp } from '@/lib/server/security/ip'
import { discordOAuthRateLimit } from '@/lib/rate-limit'
import { sanitizeNextPath, DISCORD_NEXT_COOKIE } from '@/lib/auth/redirect'

export async function GET(req: NextRequest) {
  const clientId    = process.env.DISCORD_CLIENT_ID!
  const redirectUri = process.env.DISCORD_REDIRECT_URI!

  const rateIp = getClientIp(req.headers)
  const rate = await discordOAuthRateLimit(rateIp)
  if (!rate.ok) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL!}/signin?error=discord_rate_limited`
    )
  }

  const state = randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('discord_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'identify email guilds.join',
    state,
  })

  const next = sanitizeNextPath(req.nextUrl.searchParams.get('next'))
  if (next !== '/dashboard') {
    cookieStore.set(DISCORD_NEXT_COOKIE, next, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    })
  }

  return NextResponse.redirect(
    `https://discord.com/oauth2/authorize?${params.toString()}`
  )
}
