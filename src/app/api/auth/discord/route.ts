import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export async function GET() {
  const clientId    = process.env.DISCORD_CLIENT_ID!
  const redirectUri = process.env.DISCORD_REDIRECT_URI!

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
