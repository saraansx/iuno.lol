import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSession, getSessionUserId } from '@/lib/auth/session'
import { upsertDiscordUser, getUserByDiscordId } from '@/lib/features/users/db'
import { getClientIp } from '@/lib/server/security/ip'
import { discordOAuthRateLimit } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const DISCORD_API = 'https://discord.com/api/v10'

// ── Exchange code for access token ─────────────────────────────────────────
async function exchangeCode(code: string): Promise<string> {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
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

// ── Fetch Discord user info ────────────────────────────────────────────────
async function fetchDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
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

// ── Add user to guild via bot ──────────────────────────────────────────────
async function addUserToGuild(discordUserId: string, accessToken: string) {
  const guildId  = process.env.DISCORD_GUILD_ID!
  const botToken = process.env.DISCORD_BOT_TOKEN!

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${discordUserId}`, {
    method: 'PUT',
    headers: {
      Authorization:  `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ access_token: accessToken }),
  })

  // 201 = added, 204 = already a member — both are fine
  if (res.status !== 201 && res.status !== 204) {
    const err = await res.text()
    console.error(`[Discord] Guild join failed (${res.status}): ${err}`)
    // Non-fatal — user still signs in even if guild join fails
  }
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // ── Rate limit: 10 Discord logins per 10 minutes per IP ──────────────────
  const rateIp = getClientIp(req.headers)
  const rate = await discordOAuthRateLimit(rateIp)
  if (!rate.ok) {
    return NextResponse.redirect(`${appUrl}/signin?error=discord_rate_limited`)
  }

  // User denied access
  if (error) {
    return NextResponse.redirect(`${appUrl}/signin?error=discord_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/signin?error=discord_invalid`)
  }

  // Validate CSRF state
  const cookieStore = await cookies()
  const savedState  = cookieStore.get('discord_oauth_state')?.value
  cookieStore.delete('discord_oauth_state')

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${appUrl}/signin?error=discord_state_mismatch`)
  }

  try {
    // 1. Exchange code → access token
    const accessToken = await exchangeCode(code)

    // 2. Get Discord user info
    const discordUser = await fetchDiscordUser(accessToken)

    // 3. Block if Discord has no email or it's unverified
    if (!discordUser.email || !discordUser.verified) {
      return NextResponse.redirect(
        `${appUrl}/signin?error=discord_email_unverified`
      )
    }

    // 4. Upsert or link Discord to current logged-in user or account
    const loggedInUserId = await getSessionUserId()
    const ip = getClientIp(req.headers) ?? undefined

    let userId: number

    if (loggedInUserId) {
      // User is already logged in — verify discord ID is not claimed by another user
      const existingUser = await getUserByDiscordId(discordUser.id);
      if (existingUser && existingUser.id !== loggedInUserId) {
        return NextResponse.redirect(
          `${appUrl}/dashboard/customize/profile/widgets?error=discord_already_linked`
        );
      }

      // Link Discord directly to this session's account
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

    // 5. Add user to Discord guild (non-fatal if it fails)
    await addUserToGuild(discordUser.id, accessToken)

    // 6. Create session if not logged in
    if (!loggedInUserId) {
      await createSession(userId)
    }

    return NextResponse.redirect(`${appUrl}/dashboard/customize/profile/widgets`)
  } catch (err) {
    console.error('[Discord OAuth]', err)
    return NextResponse.redirect(`${appUrl}/signin?error=discord_failed`)
  }
}
