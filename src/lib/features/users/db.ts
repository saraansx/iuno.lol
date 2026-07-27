import { db, schema } from '@/lib/db'
import { hashPassword } from '@/lib/server/security/bcrypt'
import { eq, sql } from 'drizzle-orm'
import { randomBytes } from 'crypto'

const userColumns = {
  id: schema.users.id,
  username: schema.users.username,
  displayName: schema.users.displayName,
  location: schema.users.location,
  timezone: schema.users.timezone,
  occupation: schema.users.occupation,
  bio: schema.users.bio,
  email: schema.users.email,
  ip: schema.users.ip,
  avatarUrl: schema.users.avatarUrl,
  avatarDecorationUrl: schema.users.avatarDecorationUrl,
  avatarDecorationHue: schema.users.avatarDecorationHue,
  avatarShape: schema.users.avatarShape,
  bannerImageUrl: schema.users.bannerImageUrl,
  bannerBackgroundUrl: schema.users.bannerBackgroundUrl,
  profileBgColor: schema.users.profileBgColor,
  pageBgColor: schema.users.pageBgColor,
  profileBgOpacity: schema.users.profileBgOpacity,
  profileBorderColor: schema.users.profileBorderColor,
  profileBorderOpacity: schema.users.profileBorderOpacity,
  profileBorderWidth: schema.users.profileBorderWidth,
  profileBorderRadius: schema.users.profileBorderRadius,
  profileCardBlur: schema.users.profileCardBlur,
  profileBackgroundBlur: schema.users.profileBackgroundBlur,
  profileShadowColor: schema.users.profileShadowColor,
  profileShadowOpacity: schema.users.profileShadowOpacity,
  profileOpacity: schema.users.profileOpacity,
  usernameFont: schema.users.usernameFont,
  usernameFontSize: schema.users.usernameFontSize,
  usernameFontWeight: schema.users.usernameFontWeight,
  usernameLetterSpacing: schema.users.usernameLetterSpacing,
  usernameColor: schema.users.usernameColor,
  usernameMarginBottom: schema.users.usernameMarginBottom,
  bioFont: schema.users.bioFont,
  bioFontSize: schema.users.bioFontSize,
  bioFontWeight: schema.users.bioFontWeight,
  bioLetterSpacing: schema.users.bioLetterSpacing,
  bioColor: schema.users.bioColor,
  otherFont: schema.users.otherFont,
  otherFontSize: schema.users.otherFontSize,
  otherFontWeight: schema.users.otherFontWeight,
  otherLetterSpacing: schema.users.otherLetterSpacing,
  otherColor: schema.users.otherColor,
  highlightFont: schema.users.highlightFont,
  highlightFontSize: schema.users.highlightFontSize,
  highlightFontWeight: schema.users.highlightFontWeight,
  highlightLetterSpacing: schema.users.highlightLetterSpacing,
  highlightColor: schema.users.highlightColor,
  role: schema.users.role,
  emailVerified: schema.users.emailVerified,
  discordId: schema.users.discordId,
  discordUsername: schema.users.discordUsername,
  views: schema.users.views,
  passwordChangedAt: schema.users.passwordChangedAt,
  joinDateEnabled: schema.users.joinDateEnabled,
  joinDateFormat: schema.users.joinDateFormat,
  viewsEnabled: schema.users.viewsEnabled,
  viewsAnimationEnabled: schema.users.viewsAnimationEnabled,
  viewsAnimationDuration: schema.users.viewsAnimationDuration,
  commentsEnabled: schema.users.commentsEnabled,
  showCommentsPublicly: schema.users.showCommentsPublicly,
  allowNewComments: schema.users.allowNewComments,
  feedbackEnabled: schema.users.feedbackEnabled,
  showFeedbackPublicly: schema.users.showFeedbackPublicly,
  showUidTooltip: schema.users.showUidTooltip,
  showLocationTooltip: schema.users.showLocationTooltip,
  showOccupationTooltip: schema.users.showOccupationTooltip,
  showLikesTooltip: schema.users.showLikesTooltip,
  showDislikesTooltip: schema.users.showDislikesTooltip,
  showJoinDateTooltip: schema.users.showJoinDateTooltip,
  showViewsTooltip: schema.users.showViewsTooltip,
  likesCount: schema.users.likesCount,
  dislikesCount: schema.users.dislikesCount,
  createdAt: schema.users.createdAt,
  updatedAt: schema.users.updatedAt,
} as const

type CreateUserInput = {
  username: string
  email: string
  password: string
  ip?: string
  affiliateCode?: string
}

export async function createUser(input: CreateUserInput) {
  const username = input.username.toLowerCase().trim()
  const email = input.email.toLowerCase().trim()
  const passwordHash = await hashPassword(input.password)

  try {
    const [result] = await db.insert(schema.users).values({
      username,
      email,
      password: passwordHash,
      ip: input.ip ?? null,
    })

    const userId = (result as { insertId: number }).insertId

    return { userId, username }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
      const e = err as { code: string; message: string }
      if (e.code === 'ER_DUP_ENTRY') {
        if (e.message.includes('email')) throw new Error('An account with that email already exists.')
        if (e.message.includes('username')) throw new Error('That username is already taken.')
      }
    }
    throw err
  }
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1)
  return result[0] || null
}

export async function getUserByEmailWithPassword(email: string) {
  const result = await db
    .select({ ...userColumns, password: schema.users.password })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1)
  return result[0] || null
}

async function getUserByUsername(username: string) {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase().trim()))
    .limit(1)
  return result[0] || null
}

export async function getUserById(id: number) {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1)

  return result[0] || null
}

export async function assertEmailAvailable(email: string) {
  const existing = await getUserByEmail(email)
  if (existing) throw new Error('An account with that email already exists.')
}

export async function assertUsernameAvailable(username: string) {
  const existing = await getUserByUsername(username)
  if (existing) throw new Error('That username is already taken.')
}

export async function deleteUnverifiedUserByEmail(email: string) {
  const cleanEmail = email.toLowerCase().trim()
  const user = await getUserByEmail(cleanEmail)
  if (!user || user.emailVerified) return

  await db.delete(schema.users).where(eq(schema.users.email, cleanEmail))
}

export async function markEmailVerified(email: string) {
  await db
    .update(schema.users)
    .set({ emailVerified: true })
    .where(eq(schema.users.email, email.toLowerCase().trim()))
}

// ── Discord OAuth ──────────────────────────────────────────────────────────

export async function getUserByDiscordId(discordId: string) {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .where(eq(schema.users.discordId, discordId))
    .limit(1)
  return result[0] || null
}

type UpsertDiscordUserInput = {
  discordId: string
  discordUsername: string
  email?: string
  emailVerified?: boolean
  ip?: string
}

/**
 * Find existing user by discordId (or email if provided),
 * link discord to their account, or create a brand-new user.
 * Returns the user id.
 */
export async function upsertDiscordUser(input: UpsertDiscordUserInput): Promise<number> {
  const { discordId, discordUsername, email, emailVerified, ip } = input

  // 1. Already linked via discordId
  const byDiscord = await getUserByDiscordId(discordId)
  if (byDiscord) {
    // Refresh discord username in case it changed
    await db
      .update(schema.users)
      .set({ discordUsername })
      .where(eq(schema.users.id, byDiscord.id))
    return byDiscord.id
  }

  // 2. Email matches an existing account → link discord to it
  if (email) {
    const byEmail = await getUserByEmail(email)
    if (byEmail) {
      await db
        .update(schema.users)
        .set({ discordId, discordUsername, emailVerified: emailVerified ?? true })
        .where(eq(schema.users.id, byEmail.id))
      return byEmail.id
    }
  }

  // 3. New user — generate a unique username from discord handle
  const base = discordUsername.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || 'user'
  let username = base
  let attempt = 0

  while (true) {
    try {
      const [result] = await db.insert(schema.users).values({
        username,
        email: email ?? null,
        password: null,
        ip: ip ?? null,
        discordId,
        discordUsername,
        emailVerified: emailVerified ?? false,
      })
      return (result as { insertId: number }).insertId
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
        const e = err as { code: string, message: string }
        if (e.code === 'ER_DUP_ENTRY' && e.message.includes('username')) {
          username = `${base}${randomBytes(2).toString('hex')}`
          if (++attempt > 10) throw new Error('Could not generate a unique username.')
          continue
        }
      }
      throw err
    }
  }
}

export async function updatePassword(email: string, passwordUnhashed: string) {
  const passwordHash = await hashPassword(passwordUnhashed)
  await db
    .update(schema.users)
    .set({ password: passwordHash, passwordChangedAt: new Date() })
    .where(eq(schema.users.email, email.toLowerCase().trim()))
}

// ── Profile views analytics ───────────────────────────────────────────────

interface AnalyticsRow { view_hour?: number; view_date?: string | Date; m?: number; count: string | number; }

export interface RawViewBin {
  d: string; // YYYY-MM-DD
  c: number; // views count
}

export async function getAnalyticsData(userId: number): Promise<RawViewBin[]> {
  // Fetch all raw view bins for the user from the last 30 days.
  const rows = await db.execute(sql`
    SELECT view_date, count
    FROM profile_views
    WHERE user_id = ${userId} AND view_date >= DATE_SUB(UTC_DATE(), INTERVAL 30 DAY)
    ORDER BY view_date ASC
  `)

  const resultRows = (rows as unknown as [AnalyticsRow[]])[0]
  if (!Array.isArray(resultRows)) return []

  return resultRows.map(row => {
    // Sometimes MySQL driver returns Date objects, sometimes strings
    const dString = row.view_date instanceof Date
      ? row.view_date.toISOString().split('T')[0]
      : typeof row.view_date === 'string'
        ? row.view_date.split('T')[0]
        : String(row.view_date)

    return {
      d: dString,
      c: Number(row.count)
    }
  })
}

export interface DeviceStats {
  ios: number;
  android: number;
  windows: number;
  mac: number;
  other: number;
}

export async function getDeviceStats(userId: number): Promise<DeviceStats> {
  const rows = await db.execute(sql`
    SELECT 
      SUM(ios_count) as ios, 
      SUM(android_count) as android,
      SUM(windows_count) as windows,
      SUM(mac_count) as mac,
      SUM(other_count) as other
    FROM profile_views
    WHERE user_id = ${userId} AND view_date >= DATE_SUB(UTC_DATE(), INTERVAL 30 DAY)
  `)

  const resultRows = (rows as unknown as [{ ios: number | null, android: number | null, windows: number | null, mac: number | null, other: number | null }[]])[0]
  if (!Array.isArray(resultRows) || resultRows.length === 0) {
    return { ios: 0, android: 0, windows: 0, mac: 0, other: 0 }
  }

  return {
    ios: Number(resultRows[0].ios) || 0,
    android: Number(resultRows[0].android) || 0,
    windows: Number(resultRows[0].windows) || 0,
    mac: Number(resultRows[0].mac) || 0,
    other: Number(resultRows[0].other) || 0
  }
}



