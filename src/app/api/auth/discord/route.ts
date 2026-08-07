import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { discordOAuthRateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const clientId    = process.env.DISCORD_CLIENT_ID!
  const redirectUri = process.env.DISCORD_REDIRECT_URI!

  const rateIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const rate = await discordOAuthRateLimit(rateIp)
  if (!rate.ok) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL!}/signin?error=discord_rate_limited`
    )
  }

  // CSRF state token
  const state = randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('discord_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'identify email guilds.join',
    state,
  })

  return NextResponse.redirect(
    `https://discord.com/oauth2/authorize?${params.toString()}`
  )
}
