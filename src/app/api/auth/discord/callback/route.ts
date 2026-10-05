import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSession, getSessionUserId } from '@/lib/auth/session'
import { getClientIp } from '@/lib/server/security/ip'
import { upsertDiscordUser, getUserByDiscordId } from '@/lib/features/users/db'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { FETCH_TIMEOUT_MS } from '@/lib/widget-image-proxy'
import { createLoginTicket } from '@/lib/auth/two-factor'
import { discordOAuthRateLimit } from '@/lib/rate-limit'

const DISCORD_API = 'https://discord.com/api/v10'

const GUILD_JOIN_TIMEOUT_MS = 10_000

async function exchangeCode(code: string): Promise<string> {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.DISCORD_REDIRECT_URI!,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Discord token exchange failed: ${err}`)
  }

  const data = await res.json()
  return data.access_token as string
}

async function fetchDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error('Failed to fetch Discord user info.')

  const data = await res.json()
  return {
    id:       data.id as string,
    username: data.username as string,
    email:    (data.email ?? undefined) as string | undefined,
    verified: (data.verified ?? false) as boolean,
  }
}

async function addUserToGuild(discordUserId: string, accessToken: string) {
  const guildId  = process.env.DISCORD_GUILD_ID!
  const botToken = process.env.DISCORD_BOT_TOKEN!

  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${discordUserId}`, {
      signal: AbortSignal.timeout(GUILD_JOIN_TIMEOUT_MS),
      method: 'PUT',
      headers: {
        Authorization:  `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    })

    if (res.status !== 201 && res.status !== 204) {
      const err = await res.text()
      console.error(`[Discord] Guild join failed (${res.status}): ${err}`)
    }
  } catch (err) {
    console.error('[Discord] Guild join failed:', err)
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const rate = await discordOAuthRateLimit(getClientIp(req.headers))
  if (!rate.ok) return NextResponse.redirect(`${appUrl}/signin?error=rate_limited`)

  if (error) {
    return NextResponse.redirect(`${appUrl}/signin?error=discord_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/signin?error=discord_invalid`)
  }

  const cookieStore = await cookies()
  const savedState  = cookieStore.get('discord_oauth_state')?.value
  cookieStore.delete('discord_oauth_state')

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${appUrl}/signin?error=discord_state_mismatch`)
  }

  try {
    const accessToken = await exchangeCode(code)

    const discordUser = await fetchDiscordUser(accessToken)

    if (!discordUser.email || !discordUser.verified) {
      return NextResponse.redirect(
        `${appUrl}/signin?error=discord_email_unverified`
      )
    }

    const loggedInUserId = await getSessionUserId()
    const ip = getClientIp(req.headers) ?? undefined

    let userId: number

    if (loggedInUserId) {
      const existingUser = await getUserByDiscordId(discordUser.id);
      if (existingUser && existingUser.id !== loggedInUserId) {
        return NextResponse.redirect(
          `${appUrl}/dashboard/customize/profile/widgets?error=discord_already_linked`
        );
      }

      await db
        .update(schema.users)
        .set({
          discordId: discordUser.id,
          discordUsername: discordUser.username,
        })
        .where(eq(schema.users.id, loggedInUserId))
      userId = loggedInUserId
    } else {
      userId = await upsertDiscordUser({
        discordId:       discordUser.id,
        discordUsername: discordUser.username,
        email:           discordUser.email,
        emailVerified:   discordUser.verified,
        ip,
      })
    }

    await addUserToGuild(discordUser.id, accessToken)

    if (!loggedInUserId) {
      const [row] = await db
        .select({ twoFactorEnabledAt: schema.users.twoFactorEnabledAt })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1)
      if (row?.twoFactorEnabledAt) {
        const ticket = await createLoginTicket(userId)
        return NextResponse.redirect(`${appUrl}/signin?2fa=${encodeURIComponent(ticket)}`)
      }
      await createSession(userId)
    }

    return NextResponse.redirect(`${appUrl}/dashboard`)
  } catch (err) {
    console.error('[Discord OAuth]', err)
    return NextResponse.redirect(`${appUrl}/signin?error=discord_failed`)
  }
}
