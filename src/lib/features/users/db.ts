import { db, schema } from '@/lib/db'
import { hashPassword } from '@/lib/server/security/bcrypt'
import { UserFacingError } from '@/lib/errors'
import { eq, sql, and, lt, asc, like } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { cache } from 'react'
import { redis } from '@/lib/redis'
import { resolveEffectConfig, type EffectConfig } from '@/lib/effect-config'
import type { CustomBadge } from '@/components/profile/layouts/ProfileBadges'

const userColumns = {
  id: schema.users.id,
  username: schema.users.username,
  needsUsername: schema.users.needsUsername,
  email: schema.users.email,
  ip: schema.users.ip,
  role: schema.users.role,
  emailVerified: schema.users.emailVerified,
  isPremium: schema.users.isPremium,
  hasImageHost: schema.users.hasImageHost,
  hasVerified: schema.users.hasVerified,
  hasDonator: schema.users.hasDonator,
  badgeTokens: schema.users.badgeTokens,
  aliasTokens: schema.users.aliasTokens,
  usernameLoginEnabled: schema.users.usernameLoginEnabled,
  discordId: schema.users.discordId,
  discordUsername: schema.users.discordUsername,
  views: schema.users.views,
  likesCount: schema.users.likesCount,
  dislikesCount: schema.users.dislikesCount,
  passwordChangedAt: schema.users.passwordChangedAt,
  twoFactorEnabledAt: schema.users.twoFactorEnabledAt,
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
  bannerBackgroundShuffle: schema.userSettings.bannerBackgroundShuffle,
  bannerBackgroundAutoplay: schema.userSettings.bannerBackgroundAutoplay,
  bannerBackgroundSound: schema.userSettings.bannerBackgroundSound,
  pageBgColor: schema.userSettings.pageBgColor,
  backgroundEffect: schema.userSettings.backgroundEffect,
  backgroundEffectIntensity: schema.userSettings.backgroundEffectIntensity,
  backgroundEffectColor: schema.userSettings.backgroundEffectColor,
  backgroundEffectAboveContainer: schema.userSettings.backgroundEffectAboveContainer,
  effectConfig: schema.userSettings.effectConfig,
  borderEffect: schema.userSettings.borderEffect,
  borderEffectColor: schema.userSettings.borderEffectColor,
  cardEffect: schema.userSettings.cardEffect,
  cardTransition: schema.userSettings.cardTransition,
  usernameEffect: schema.userSettings.usernameEffect,
  usernameGlowEnabled: schema.userSettings.usernameGlowEnabled,
  cursorTrail: schema.userSettings.cursorTrail,
  cursorTrailColor: schema.userSettings.cursorTrailColor,
  clickEffect: schema.userSettings.clickEffect,
  clickSound: schema.userSettings.clickSound,
  badgeGlowEnabled: schema.userSettings.badgeGlowEnabled,
  badgeGlowStrength: schema.userSettings.badgeGlowStrength,
  badgeSize: schema.userSettings.badgeSize,
  badgeMonochromeEnabled: schema.userSettings.badgeMonochromeEnabled,
  badgeMonochromeColor: schema.userSettings.badgeMonochromeColor,
  badgeContainerStyle: schema.userSettings.badgeContainerStyle,
  badgeSpacing: schema.userSettings.badgeSpacing,
  badgeScrollStyle: schema.userSettings.badgeScrollStyle,
  badgeScrollSpeed: schema.userSettings.badgeScrollSpeed,
  badgeVisibleCount: schema.userSettings.badgeVisibleCount,
  badgeShimmerEnabled: schema.userSettings.badgeShimmerEnabled,
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
  descriptionGlowEnabled: schema.userSettings.descriptionGlowEnabled,
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
  widgetSecondaryFont: schema.userSettings.widgetSecondaryFont,
  widgetSecondaryFontSize: schema.userSettings.widgetSecondaryFontSize,
  widgetSecondaryFontWeight: schema.userSettings.widgetSecondaryFontWeight,
  widgetSecondaryLetterSpacing: schema.userSettings.widgetSecondaryLetterSpacing,
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
  viewsAnimationStyle: schema.userSettings.viewsAnimationStyle,
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
  sectionTitleFont: schema.userSettings.sectionTitleFont,
  sectionTitleFontSize: schema.userSettings.sectionTitleFontSize,
  sectionTitleFontWeight: schema.userSettings.sectionTitleFontWeight,
  sectionTitleLetterSpacing: schema.userSettings.sectionTitleLetterSpacing,
  sectionDescFont: schema.userSettings.sectionDescFont,
  sectionDescFontSize: schema.userSettings.sectionDescFontSize,
  sectionDescFontWeight: schema.userSettings.sectionDescFontWeight,
  sectionDescLetterSpacing: schema.userSettings.sectionDescLetterSpacing,
  sectionTitleColor: schema.userSettings.sectionTitleColor,
  sectionDescColor: schema.userSettings.sectionDescColor,
  musicPrimaryFont: schema.userSettings.musicPrimaryFont,
  musicPrimaryFontSize: schema.userSettings.musicPrimaryFontSize,
  musicPrimaryFontWeight: schema.userSettings.musicPrimaryFontWeight,
  musicPrimaryLetterSpacing: schema.userSettings.musicPrimaryLetterSpacing,
  musicSecondaryFont: schema.userSettings.musicSecondaryFont,
  musicSecondaryFontSize: schema.userSettings.musicSecondaryFontSize,
  musicSecondaryFontWeight: schema.userSettings.musicSecondaryFontWeight,
  musicSecondaryLetterSpacing: schema.userSettings.musicSecondaryLetterSpacing,
  musicLyricsFont: schema.userSettings.musicLyricsFont,
  musicLyricsFontSize: schema.userSettings.musicLyricsFontSize,
  musicLyricsFontWeight: schema.userSettings.musicLyricsFontWeight,
  musicLyricsLetterSpacing: schema.userSettings.musicLyricsLetterSpacing,
  musicPrimaryColor: schema.userSettings.musicPrimaryColor,
  musicSecondaryColor: schema.userSettings.musicSecondaryColor,
  musicLyricsColor: schema.userSettings.musicLyricsColor,
  musicTracks: schema.userSettings.musicTracks,
  musicPlayerStyle: schema.userSettings.musicPlayerStyle,
  musicPlayerVolume: schema.userSettings.musicPlayerVolume,
  musicPlayerShuffle: schema.userSettings.musicPlayerShuffle,
  musicPlayerArtBg: schema.userSettings.musicPlayerArtBg,
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
  showLinksTooltip: schema.userSettings.showLinksTooltip,
  showBadgesTooltip: schema.userSettings.showBadgesTooltip,
  iconsGlowEnabled: schema.userSettings.iconsGlowEnabled,
  joinDateIconGlow: schema.userSettings.joinDateIconGlow,
  locationIconGlow: schema.userSettings.locationIconGlow,
  occupationIconGlow: schema.userSettings.occupationIconGlow,
  uidIconGlow: schema.userSettings.uidIconGlow,
  viewsIconGlow: schema.userSettings.viewsIconGlow,
  feedbackIconGlow: schema.userSettings.feedbackIconGlow,
  linksSectionEnabled: schema.userSettings.linksSectionEnabled,
  linksSectionTitle: schema.userSettings.linksSectionTitle,
  linksSectionDescription: schema.userSettings.linksSectionDescription,
  linksSectionPosition: schema.userSettings.linksSectionPosition,
  linksFont: schema.userSettings.linksFont,
  linksFontSize: schema.userSettings.linksFontSize,
  linksFontWeight: schema.userSettings.linksFontWeight,
  linksLetterSpacing: schema.userSettings.linksLetterSpacing,
  linksAlignment: schema.userSettings.linksAlignment,
  linksSocialBackground: schema.userSettings.linksSocialBackground,
  linksBorderRadius: schema.userSettings.linksBorderRadius,
  linksIconSize: schema.userSettings.linksIconSize,
  widgets: schema.userSettings.widgets,
  links: schema.userSettings.links,
} as const

type CreateUserInput = {
  username: string
  email: string
  password: string
  ip?: string
}

async function clearProfileExistsCache(userId: number) {
  await redis.del(`profile_exists:${userId}`).catch(() => {})
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

    await clearProfileExistsCache(userId)
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

function hydrateUser<T extends { effectConfig?: EffectConfig | null }>(
  row: T | undefined,
): (T & EffectConfig) | null {
  if (!row) return null;
  Object.assign(row, resolveEffectConfig(row.effectConfig));
  return row as T & EffectConfig;
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .leftJoin(schema.userSettings, eq(schema.users.id, schema.userSettings.userId))
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1)
  return hydrateUser(result[0])
}

export async function getUserByEmailWithPassword(email: string) {
  const result = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      password: schema.users.password,
      emailVerified: schema.users.emailVerified,
      twoFactorEnabledAt: schema.users.twoFactorEnabledAt,
      usernameLoginEnabled: schema.users.usernameLoginEnabled,
    })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1)
  return result[0] || null
}

export async function getUserByUsernameWithPassword(username: string) {
  const result = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      password: schema.users.password,
      emailVerified: schema.users.emailVerified,
      twoFactorEnabledAt: schema.users.twoFactorEnabledAt,
      usernameLoginEnabled: schema.users.usernameLoginEnabled,
    })
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase().trim()))
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
  return hydrateUser(result[0])
}

export const getUserById = cache(async (id: number) => {
  const result = await db
    .select(userColumns)
    .from(schema.users)
    .leftJoin(schema.userSettings, eq(schema.users.id, schema.userSettings.userId))
    .where(eq(schema.users.id, id))
    .limit(1)

  return hydrateUser(result[0])
})

export async function userHasPassword(id: number): Promise<boolean> {
  const [row] = await db
    .select({ has: sql<number>`password IS NOT NULL AND password <> ''` })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1)
  return Boolean(Number(row?.has))
}

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

export async function getUserBackgrounds(userId: number): Promise<string[]> {
  const rows = await db
    .select({ url: schema.userBackgrounds.url })
    .from(schema.userBackgrounds)
    .where(eq(schema.userBackgrounds.userId, userId))
    .orderBy(asc(schema.userBackgrounds.position), asc(schema.userBackgrounds.id))
  return rows.map((r) => r.url)
}

export type FullUser = NonNullable<Awaited<ReturnType<typeof getUserById>>>;

const UNVERIFIED_GRACE_MS = 10 * 60 * 1000

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
  if (await getAliasOwner(username)) throw new UserFacingError('That username is already taken.')
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
  return hydrateUser(result[0])
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

  const placeholder = () => `user_${randomBytes(5).toString('hex')}`
  let username = placeholder()
  let attempt = 0

  while (true) {
    try {

      const insertId = await db.transaction(async (tx) => {
        const [result] = await tx.insert(schema.users).values({
          username,
          email: email ?? null,
          password: null,
          ip: ip ?? null,
          discordId,
          discordUsername,
          emailVerified: emailVerified ?? false,
          needsUsername: true,
        })
        const id = (result as { insertId: number }).insertId
        await tx.insert(schema.userSettings).values({ userId: id })
        return id
      })
      await clearProfileExistsCache(insertId)
      return insertId
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
        const e = err as { code: string, message: string }
        if (e.code === 'ER_DUP_ENTRY' && e.message.includes('username')) {
          username = placeholder()
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
  const emailClean = email.toLowerCase().trim()
  await db
    .update(schema.users)
    .set({ password: passwordHash, passwordChangedAt: new Date(Date.now() + 1000) })
    .where(eq(schema.users.email, emailClean))
  try {
    const { redis } = await import('@/lib/redis')
    const [row] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, emailClean)).limit(1)
    if (row) {
      let cursor = '0'
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `sess:${row.id}:*`, 'COUNT', 100)
        cursor = nextCursor
        if (keys.length) await redis.del(...keys)
      } while (cursor !== '0')
    }
  } catch {}
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
    WHERE user_id = ${userId} AND view_date >= DATE_SUB(UTC_DATE(), INTERVAL 29 DAY)
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

export async function getHourlyViews(userId: number): Promise<RawViewBin[]> {
  const rows = await db.execute(sql`
    SELECT DATE_FORMAT(view_hour, '%Y-%m-%dT%H') AS h, count
    FROM profile_views_hourly
    WHERE user_id = ${userId} AND view_hour > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
    ORDER BY view_hour ASC
  `)
  const resultRows = (rows as unknown as [{ h: string; count: string | number }[]])[0]
  if (!Array.isArray(resultRows)) return []
  return resultRows.map((r) => ({ d: String(r.h), c: Number(r.count) }))
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
    WHERE user_id = ${userId} AND view_date >= DATE_SUB(UTC_DATE(), INTERVAL 29 DAY)
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

export async function getCustomBadges(userId: number): Promise<CustomBadge[]> {
  const rows = await db
    .select({ id: schema.userBadges.badgeId, name: schema.userBadges.customName, iconUrl: schema.userBadges.customIconUrl })
    .from(schema.userBadges)
    .where(and(eq(schema.userBadges.userId, userId), like(schema.userBadges.badgeId, 'custom-%')))
    .orderBy(asc(schema.userBadges.createdAt), asc(schema.userBadges.id))
  return rows.map((r) => ({ id: r.id, name: r.name ?? 'Custom', iconUrl: r.iconUrl ?? '' }))
}

export async function getAliasOwner(alias: string): Promise<{ userId: number; username: string } | null> {
  const [row] = await db
    .select({ userId: schema.userAliases.userId, username: schema.users.username })
    .from(schema.userAliases)
    .innerJoin(schema.users, eq(schema.users.id, schema.userAliases.userId))
    .where(eq(schema.userAliases.alias, alias.toLowerCase().trim()))
    .limit(1)
  return row ?? null
}

export async function getUserAliases(userId: number) {
  return db
    .select({ id: schema.userAliases.id, alias: schema.userAliases.alias, createdAt: schema.userAliases.createdAt })
    .from(schema.userAliases)
    .where(eq(schema.userAliases.userId, userId))
    .orderBy(asc(schema.userAliases.createdAt), asc(schema.userAliases.id))
}

export async function getEquippedBadgeIds(userId: number): Promise<string[]> {
  const rows = await db
    .select({ badgeId: schema.userBadges.badgeId })
    .from(schema.userBadges)
    .where(and(eq(schema.userBadges.userId, userId), eq(schema.userBadges.equipped, true)))
    .orderBy(asc(schema.userBadges.sortOrder), asc(schema.userBadges.equippedAt), asc(schema.userBadges.id))
  return rows.map((r) => r.badgeId)
}

