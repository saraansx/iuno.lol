import { db, schema } from '@/lib/db'
import { hashPassword } from '@/lib/server/security/bcrypt'
import { validateUsername } from '@/lib/server/security/validation'
import { UserFacingError } from '@/lib/errors'
import { eq, sql, and, lt } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { cache } from 'react'

const userColumns = {
  id: schema.users.id,
  username: schema.users.username,
  email: schema.users.email,
  ip: schema.users.ip,
  role: schema.users.role,
  emailVerified: schema.users.emailVerified,
  discordId: schema.users.discordId,
  discordUsername: schema.users.discordUsername,
  views: schema.users.views,
  likesCount: schema.users.likesCount,
  dislikesCount: schema.users.dislikesCount,
  passwordChangedAt: schema.users.passwordChangedAt,
  createdAt: schema.users.createdAt,
  updatedAt: schema.users.updatedAt,
  displayName: schema.userSettings.displayName,
  location: schema.userSettings.location,
  timezone: schema.userSettings.timezone,
  occupation: schema.userSettings.occupation,
  bio: schema.userSettings.bio,
  avatarUrl: schema.userSettings.avatarUrl,
  avatarDecorationUrl: schema.userSettings.avatarDecorationUrl,
  avatarDecorationHue: schema.userSettings.avatarDecorationHue,
  profileEffectUrl: schema.userSettings.profileEffectUrl,
  profileEffectHue: schema.userSettings.profileEffectHue,
  avatarShape: schema.userSettings.avatarShape,
  bannerImageUrl: schema.userSettings.bannerImageUrl,
  bannerBlend: schema.userSettings.bannerBlend,
  bannerBackgroundUrl: schema.userSettings.bannerBackgroundUrl,
  bannerBackgroundSound: schema.userSettings.bannerBackgroundSound,
  pageBgColor: schema.userSettings.pageBgColor,
  backgroundEffect: schema.userSettings.backgroundEffect,
  backgroundEffectIntensity: schema.userSettings.backgroundEffectIntensity,
  backgroundEffectColor: schema.userSettings.backgroundEffectColor,
  backgroundEffectAboveContainer: schema.userSettings.backgroundEffectAboveContainer,
  borderEffect: schema.userSettings.borderEffect,
  borderEffectColor: schema.userSettings.borderEffectColor,
  cardEffect: schema.userSettings.cardEffect,
  cardTransition: schema.userSettings.cardTransition,
  usernameEffect: schema.userSettings.usernameEffect,
  cursorTrail: schema.userSettings.cursorTrail,
  cursorTrailColor: schema.userSettings.cursorTrailColor,
  entryTransition: schema.userSettings.entryTransition,
  enterScreenEnabled: schema.userSettings.enterScreenEnabled,
  enterScreenText: schema.userSettings.enterScreenText,
  enterScreenFont: schema.userSettings.enterScreenFont,
  enterScreenFontSize: schema.userSettings.enterScreenFontSize,
  enterScreenFontWeight: schema.userSettings.enterScreenFontWeight,
  enterScreenLetterSpacing: schema.userSettings.enterScreenLetterSpacing,
  enterScreenColor: schema.userSettings.enterScreenColor,
  enterScreenOpacity: schema.userSettings.enterScreenOpacity,
  enterScreenBlur: schema.userSettings.enterScreenBlur,
  enterScreenBlurColor: schema.userSettings.enterScreenBlurColor,
  descriptionEffect: schema.userSettings.descriptionEffect,
  profileBgColor: schema.userSettings.profileBgColor,
  profileBgOpacity: schema.userSettings.profileBgOpacity,
  profileBorderColor: schema.userSettings.profileBorderColor,
  profileBorderOpacity: schema.userSettings.profileBorderOpacity,
  profileBorderWidth: schema.userSettings.profileBorderWidth,
  profileBorderRadius: schema.userSettings.profileBorderRadius,
  profileCardBlur: schema.userSettings.profileCardBlur,
  profileBackgroundBlur: schema.userSettings.profileBackgroundBlur,
  profileShadowColor: schema.userSettings.profileShadowColor,
  profileShadowOpacity: schema.userSettings.profileShadowOpacity,
  profileOpacity: schema.userSettings.profileOpacity,
  usernameFont: schema.userSettings.usernameFont,
  usernameFontSize: schema.userSettings.usernameFontSize,
  usernameFontWeight: schema.userSettings.usernameFontWeight,
  usernameLetterSpacing: schema.userSettings.usernameLetterSpacing,
  usernameColor: schema.userSettings.usernameColor,
  usernameMarginBottom: schema.userSettings.usernameMarginBottom,
  bioFont: schema.userSettings.bioFont,
  bioFontSize: schema.userSettings.bioFontSize,
  bioFontWeight: schema.userSettings.bioFontWeight,
  bioLetterSpacing: schema.userSettings.bioLetterSpacing,
  bioColor: schema.userSettings.bioColor,
  otherFont: schema.userSettings.otherFont,
  otherFontSize: schema.userSettings.otherFontSize,
  otherFontWeight: schema.userSettings.otherFontWeight,
  otherLetterSpacing: schema.userSettings.otherLetterSpacing,
  otherColor: schema.userSettings.otherColor,
  highlightFont: schema.userSettings.highlightFont,
  highlightFontSize: schema.userSettings.highlightFontSize,
  highlightFontWeight: schema.userSettings.highlightFontWeight,
  highlightLetterSpacing: schema.userSettings.highlightLetterSpacing,
  widgetPrimaryTextColor: schema.userSettings.widgetPrimaryTextColor,
  widgetFont: schema.userSettings.widgetFont,
  widgetFontSize: schema.userSettings.widgetFontSize,
  widgetFontWeight: schema.userSettings.widgetFontWeight,
  widgetLetterSpacing: schema.userSettings.widgetLetterSpacing,
  widgetSecondaryTextColor: schema.userSettings.widgetSecondaryTextColor,
  widgetBorderColor: schema.userSettings.widgetBorderColor,
  widgetBorderOpacity: schema.userSettings.widgetBorderOpacity,
  widgetBorderWidth: schema.userSettings.widgetBorderWidth,
  widgetBorderRadius: schema.userSettings.widgetBorderRadius,
  profileStructure: schema.userSettings.profileStructure,
  aboutSectionEnabled: schema.userSettings.aboutSectionEnabled,
  aboutSectionTitle: schema.userSettings.aboutSectionTitle,
  aboutSectionDescription: schema.userSettings.aboutSectionDescription,
  widgetsSectionEnabled: schema.userSettings.widgetsSectionEnabled,
  profilePreset: schema.userSettings.profilePreset,
  wrapInCard: schema.userSettings.wrapInCard,
  contentWidth: schema.userSettings.contentWidth,
  contentAlignment: schema.userSettings.contentAlignment,
  avatarPlacement: schema.userSettings.avatarPlacement,
  joinDatePlacement: schema.userSettings.joinDatePlacement,
  locationPlacement: schema.userSettings.locationPlacement,
  occupationPlacement: schema.userSettings.occupationPlacement,
  uidPlacement: schema.userSettings.uidPlacement,
  viewsPlacement: schema.userSettings.viewsPlacement,
  feedbackPlacement: schema.userSettings.feedbackPlacement,
  joinDateEnabled: schema.userSettings.joinDateEnabled,
  joinDateFormat: schema.userSettings.joinDateFormat,
  viewsEnabled: schema.userSettings.viewsEnabled,
  viewsAnimationEnabled: schema.userSettings.viewsAnimationEnabled,
  embedTitle: schema.userSettings.embedTitle,
  embedDescription: schema.userSettings.embedDescription,
  embedColor: schema.userSettings.embedColor,
  embedBackgroundUrl: schema.userSettings.embedBackgroundUrl,
  embedIconUrl: schema.userSettings.embedIconUrl,
  faviconUrl: schema.userSettings.faviconUrl,
  cursorUrl: schema.userSettings.cursorUrl,
  tabTitle: schema.userSettings.tabTitle,
  tabTitleAnimated: schema.userSettings.tabTitleAnimated,
  viewsAnimationDuration: schema.userSettings.viewsAnimationDuration,
  commentsEnabled: schema.userSettings.commentsEnabled,
  showCommentsPublicly: schema.userSettings.showCommentsPublicly,
  allowNewComments: schema.userSettings.allowNewComments,
  feedbackEnabled: schema.userSettings.feedbackEnabled,
  showFeedbackPublicly: schema.userSettings.showFeedbackPublicly,
  showUidTooltip: schema.userSettings.showUidTooltip,
  showLocationTooltip: schema.userSettings.showLocationTooltip,
  showOccupationTooltip: schema.userSettings.showOccupationTooltip,
  showLikesTooltip: schema.userSettings.showLikesTooltip,
  showDislikesTooltip: schema.userSettings.showDislikesTooltip,
  showJoinDateTooltip: schema.userSettings.showJoinDateTooltip,
  showViewsTooltip: schema.userSettings.showViewsTooltip,
  widgets: schema.userSettings.widgets,
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
    const userId = await db.transaction(async (tx) => {
      const [result] = await tx.insert(schema.users).values({
        username,
        email,
        password: passwordHash,
        ip: input.ip ?? null,
      })

      const insertedId = (result as { insertId: number }).insertId

      await tx.insert(schema.userSettings).values({ userId: insertedId })

      return insertedId
    })

    return { userId, username }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
      const e = err as { code: string; message: string }
      if (e.code === 'ER_DUP_ENTRY') {
        if (e.message.includes('email')) throw new UserFacingError('An account with that email already exists.')
        if (e.message.includes('username')) throw new UserFacingError('That username is already taken.')
      }
    }
    throw err
  }
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .leftJoin(schema.userSettings, eq(schema.users.id, schema.userSettings.userId))
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1)
  return result[0] || null
}

export async function getUserByEmailWithPassword(email: string) {
  const result = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      password: schema.users.password,
      emailVerified: schema.users.emailVerified,
    })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1)
  return result[0] || null
}

async function getUserByUsername(username: string) {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .leftJoin(schema.userSettings, eq(schema.users.id, schema.userSettings.userId))
    .where(eq(schema.users.username, username.toLowerCase().trim()))
    .limit(1)
  return result[0] || null
}

export const getUserById = cache(async (id: number) => {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .leftJoin(schema.userSettings, eq(schema.users.id, schema.userSettings.userId))
    .where(eq(schema.users.id, id))
    .limit(1)

  return result[0] || null
})

export async function getUserForSession(id: number) {
  const result = await db
    .select({
      id: schema.users.id,
      passwordChangedAt: schema.users.passwordChangedAt,
    })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1)

  return result[0] || null
}

export type FullUser = NonNullable<Awaited<ReturnType<typeof getUserById>>>;

export const UNVERIFIED_GRACE_MS = 10 * 60 * 1000

export async function assertEmailAvailable(email: string) {
  const existing = await getUserByEmail(email)
  if (!existing) return

  if (!existing.emailVerified) {
    const cutoff = new Date(Date.now() - UNVERIFIED_GRACE_MS)
    if (existing.createdAt < cutoff) return
  }

  throw new UserFacingError('An account with that email already exists.')
}

export async function assertUsernameAvailable(username: string) {
  const existing = await getUserByUsername(username)
  if (!existing) return

  if (!existing.emailVerified) {
    const cutoff = new Date(Date.now() - UNVERIFIED_GRACE_MS)
    if (existing.createdAt < cutoff) return
  }

  throw new UserFacingError('That username is already taken.')
}

export async function deleteUnverifiedUserByEmail(email: string) {
  const cleanEmail = email.toLowerCase().trim()
  const user = await getUserByEmail(cleanEmail)
  if (!user || user.emailVerified) return

  await db
    .delete(schema.users)
    .where(and(eq(schema.users.email, cleanEmail), eq(schema.users.emailVerified, false)))
}

export async function cleanupExpiredUnverifiedUsers() {
  const cutoff = new Date(Date.now() - UNVERIFIED_GRACE_MS)
  await db
    .delete(schema.users)
    .where(
      and(
        eq(schema.users.emailVerified, false),
        lt(schema.users.createdAt, cutoff)
      )
    )
}

export async function markEmailVerified(email: string) {
  await db
    .update(schema.users)
    .set({ emailVerified: true })
    .where(eq(schema.users.email, email.toLowerCase().trim()))
}

export async function getUserByDiscordId(discordId: string) {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .leftJoin(schema.userSettings, eq(schema.users.id, schema.userSettings.userId))
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

export async function upsertDiscordUser(input: UpsertDiscordUserInput): Promise<number> {
  const { discordId, discordUsername, email, emailVerified, ip } = input

  const byDiscord = await getUserByDiscordId(discordId)
  if (byDiscord) {
    await db
      .update(schema.users)
      .set({ discordUsername })
      .where(eq(schema.users.id, byDiscord.id))
    return byDiscord.id
  }

  if (email) {
    const byEmail = await getUserByEmail(email)
    if (byEmail && byEmail.emailVerified) {
      await db
        .update(schema.users)
        .set({ discordId, discordUsername, emailVerified: emailVerified ?? true })
        .where(eq(schema.users.id, byEmail.id))
      return byEmail.id
    }
  }

  let cleaned = discordUsername.toLowerCase().replace(/[^a-z0-9_.]/g, '')
  cleaned = cleaned.replace(/^[^a-z0-9]+/, '')
  const base = cleaned.slice(0, 24) || 'user'
  let username = base
  let attempt = 0

  while (true) {
    try {
      if (validateUsername(username)) {
        username = `${base}${randomBytes(2).toString('hex')}`
        if (++attempt > 10) throw new Error('Could not generate a valid username.')
        continue
      }

      const insertId = await db.transaction(async (tx) => {
        const [result] = await tx.insert(schema.users).values({
          username,
          email: email ?? null,
          password: null,
          ip: ip ?? null,
          discordId,
          discordUsername,
          emailVerified: emailVerified ?? false,
        })
        const id = (result as { insertId: number }).insertId
        await tx.insert(schema.userSettings).values({ userId: id })
        return id
      })
      return insertId
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

interface AnalyticsRow { view_date?: string | Date; count: string | number; }

export interface RawViewBin {
  d: string;
  c: number;
}

export async function getAnalyticsData(userId: number): Promise<RawViewBin[]> {
  const rows = await db.execute(sql`
    SELECT view_date, count
    FROM profile_views
    WHERE user_id = ${userId} AND view_date >= DATE_SUB(UTC_DATE(), INTERVAL 7 DAY)
    ORDER BY view_date ASC
  `)

  const resultRows = (rows as unknown as [AnalyticsRow[]])[0]
  if (!Array.isArray(resultRows)) return []

  return resultRows.map(row => {
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
    WHERE user_id = ${userId} AND view_date >= DATE_SUB(UTC_DATE(), INTERVAL 7 DAY)
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

