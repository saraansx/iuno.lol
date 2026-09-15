import { db } from '@/lib/db'
import { users, userSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { Metadata, Viewport } from 'next'
import Layout1 from '@/components/profile/layouts/Layout1'
import ProfileViewTracker from '@/components/profile/ProfileViewTracker'
import TabTitleTypewriter from '@/components/profile/TabTitleTypewriter'
import effects from '@/effects.json'
import { ProfileEffect } from '@/components/dashboard/EffectsPicker'
import { SITE_CONFIG } from '@/lib/config'
import { CURSOR_HOTSPOT } from '@/lib/cursor'
import { buildOgImageUrl, OG_WIDTH, OG_HEIGHT, normalizeEmbedColor, formatTabTitle, isAllowedOgImage } from '@/lib/og'

export const revalidate = 2592000;

export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateViewport(
  { params }: { params: Promise<{ username: string }> }
): Promise<Viewport> {
  const { username: rawUsername } = await params
  const username = rawUsername.toLowerCase().trim()

  const rows = await db
    .select({ embedColor: userSettings.embedColor })
    .from(users)
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(eq(users.username, username))
    .limit(1)

  return { themeColor: normalizeEmbedColor(rows[0]?.embedColor) }
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username: rawUsername } = await params
  const username = rawUsername.toLowerCase().trim()

  const rows = await db
    .select({
      username: users.username,
      embedTitle: userSettings.embedTitle,
      embedDescription: userSettings.embedDescription,
      displayName: userSettings.displayName,
      embedBackgroundUrl: userSettings.embedBackgroundUrl,
      embedIconUrl: userSettings.embedIconUrl,
      faviconUrl: userSettings.faviconUrl,
      tabTitle: userSettings.tabTitle,
    })
    .from(users)
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(eq(users.username, username))
    .limit(1)

  if (rows.length === 0) {
    return { title: { absolute: SITE_CONFIG.name } }
  }

  const row = rows[0]
  const title = row.embedTitle?.trim() || `@${row.username}`
  const description = row.embedDescription?.trim() || undefined
  const image = buildOgImageUrl(row.username, row)
  return {
    title: { absolute: formatTabTitle(row.tabTitle, row.username) },
    description,
    icons: { icon: row.faviconUrl || '/logo.png' },
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/${row.username}`,
      siteName: SITE_CONFIG.name,
      images: [{ url: image, width: OG_WIDTH, height: OG_HEIGHT }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params
  const username = rawUsername.toLowerCase().trim()

  const userListPromise = db
    .select({
      id: users.id,
      username: users.username,
      displayName: userSettings.displayName,
      bio: userSettings.bio,
      location: userSettings.location,
      occupation: userSettings.occupation,
      avatarUrl: userSettings.avatarUrl,
      avatarShape: userSettings.avatarShape,
      avatarDecorationUrl: userSettings.avatarDecorationUrl,
      avatarDecorationHue: userSettings.avatarDecorationHue,
      profileEffectUrl: userSettings.profileEffectUrl,
      profileEffectHue: userSettings.profileEffectHue,
      bannerImageUrl: userSettings.bannerImageUrl,
      bannerBlend: userSettings.bannerBlend,
      bannerBackgroundUrl: userSettings.bannerBackgroundUrl,
      bannerBackgroundSound: userSettings.bannerBackgroundSound,
      profileBgColor: userSettings.profileBgColor,
      profileBgOpacity: userSettings.profileBgOpacity,
      profileBorderColor: userSettings.profileBorderColor,
      profileBorderOpacity: userSettings.profileBorderOpacity,
      profileBorderWidth: userSettings.profileBorderWidth,
      profileBorderRadius: userSettings.profileBorderRadius,
      profileCardBlur: userSettings.profileCardBlur,
      profileBackgroundBlur: userSettings.profileBackgroundBlur,
      profileShadowColor: userSettings.profileShadowColor,
      profileShadowOpacity: userSettings.profileShadowOpacity,
      profileOpacity: userSettings.profileOpacity,
      views: users.views,
      usernameFont: userSettings.usernameFont,
      usernameFontSize: userSettings.usernameFontSize,
      usernameFontWeight: userSettings.usernameFontWeight,
      usernameLetterSpacing: userSettings.usernameLetterSpacing,
      usernameColor: userSettings.usernameColor,
      bioFont: userSettings.bioFont,
      bioFontSize: userSettings.bioFontSize,
      bioFontWeight: userSettings.bioFontWeight,
      bioLetterSpacing: userSettings.bioLetterSpacing,
      bioColor: userSettings.bioColor,
      otherFont: userSettings.otherFont,
      otherFontSize: userSettings.otherFontSize,
      otherFontWeight: userSettings.otherFontWeight,
      otherLetterSpacing: userSettings.otherLetterSpacing,
      otherColor: userSettings.otherColor,
      joinDateEnabled: userSettings.joinDateEnabled,
      joinDateFormat: userSettings.joinDateFormat,
      viewsEnabled: userSettings.viewsEnabled,
      viewsAnimationEnabled: userSettings.viewsAnimationEnabled,
      viewsAnimationDuration: userSettings.viewsAnimationDuration,
      commentsEnabled: userSettings.commentsEnabled,
      showCommentsPublicly: userSettings.showCommentsPublicly,
      allowNewComments: userSettings.allowNewComments,
      feedbackEnabled: userSettings.feedbackEnabled,
      showFeedbackPublicly: userSettings.showFeedbackPublicly,
      showUidTooltip: userSettings.showUidTooltip,
      showLocationTooltip: userSettings.showLocationTooltip,
      showOccupationTooltip: userSettings.showOccupationTooltip,
      showLikesTooltip: userSettings.showLikesTooltip,
      showDislikesTooltip: userSettings.showDislikesTooltip,
      showJoinDateTooltip: userSettings.showJoinDateTooltip,
      showViewsTooltip: userSettings.showViewsTooltip,
      likesCount: users.likesCount,
      dislikesCount: users.dislikesCount,
      createdAt: users.createdAt,
      highlightFont: userSettings.highlightFont,
      highlightFontSize: userSettings.highlightFontSize,
      highlightFontWeight: userSettings.highlightFontWeight,
      highlightLetterSpacing: userSettings.highlightLetterSpacing,
      widgetPrimaryTextColor: userSettings.widgetPrimaryTextColor,
      widgetSecondaryTextColor: userSettings.widgetSecondaryTextColor,
      widgetBorderColor: userSettings.widgetBorderColor,
      widgetBorderOpacity: userSettings.widgetBorderOpacity,
      widgetBorderWidth: userSettings.widgetBorderWidth,
      widgetBorderRadius: userSettings.widgetBorderRadius,
      widgetFont: userSettings.widgetFont,
      widgetFontSize: userSettings.widgetFontSize,
      widgetFontWeight: userSettings.widgetFontWeight,
      widgetLetterSpacing: userSettings.widgetLetterSpacing,
      wrapInCard: userSettings.wrapInCard,
      contentWidth: userSettings.contentWidth,
      profilePreset: userSettings.profilePreset,
      profileStructure: userSettings.profileStructure,
      cursorUrl: userSettings.cursorUrl,
      tabTitle: userSettings.tabTitle,
      tabTitleAnimated: userSettings.tabTitleAnimated,
      aboutSectionEnabled: userSettings.aboutSectionEnabled,
      aboutSectionTitle: userSettings.aboutSectionTitle,
      aboutSectionDescription: userSettings.aboutSectionDescription,
      widgetsSectionEnabled: userSettings.widgetsSectionEnabled,
      contentAlignment: userSettings.contentAlignment,
      avatarPlacement: userSettings.avatarPlacement,
      joinDatePlacement: userSettings.joinDatePlacement,
      locationPlacement: userSettings.locationPlacement,
      occupationPlacement: userSettings.occupationPlacement,
      uidPlacement: userSettings.uidPlacement,
      viewsPlacement: userSettings.viewsPlacement,
      feedbackPlacement: userSettings.feedbackPlacement,
      pageBgColor: userSettings.pageBgColor,
      backgroundEffect: userSettings.backgroundEffect,
      backgroundEffectIntensity: userSettings.backgroundEffectIntensity,
      backgroundEffectColor: userSettings.backgroundEffectColor,
      backgroundEffectAboveContainer: userSettings.backgroundEffectAboveContainer,
      borderEffect: userSettings.borderEffect,
      borderEffectColor: userSettings.borderEffectColor,
      cardEffect: userSettings.cardEffect,
      cardTransition: userSettings.cardTransition,
      usernameEffect: userSettings.usernameEffect,
      descriptionEffect: userSettings.descriptionEffect,
      cursorTrail: userSettings.cursorTrail,
      cursorTrailColor: userSettings.cursorTrailColor,
      entryTransition: userSettings.entryTransition,
      enterScreenEnabled: userSettings.enterScreenEnabled,
      enterScreenText: userSettings.enterScreenText,
      enterScreenFont: userSettings.enterScreenFont,
      enterScreenFontSize: userSettings.enterScreenFontSize,
      enterScreenFontWeight: userSettings.enterScreenFontWeight,
      enterScreenLetterSpacing: userSettings.enterScreenLetterSpacing,
      enterScreenColor: userSettings.enterScreenColor,
      enterScreenOpacity: userSettings.enterScreenOpacity,
      enterScreenBlur: userSettings.enterScreenBlur,
      enterScreenBlurColor: userSettings.enterScreenBlurColor,
      widgets: userSettings.widgets,
      sectionTitleColor: userSettings.sectionTitleColor,
      sectionDescColor: userSettings.sectionDescColor,
      musicTracks: userSettings.musicTracks,
      musicPlayerStyle: userSettings.musicPlayerStyle,
      musicPlayerVolume: userSettings.musicPlayerVolume,
      sectionTitleFont: userSettings.sectionTitleFont,
      sectionTitleFontSize: userSettings.sectionTitleFontSize,
      sectionTitleFontWeight: userSettings.sectionTitleFontWeight,
      sectionTitleLetterSpacing: userSettings.sectionTitleLetterSpacing,
      sectionDescFont: userSettings.sectionDescFont,
      sectionDescFontSize: userSettings.sectionDescFontSize,
      sectionDescFontWeight: userSettings.sectionDescFontWeight,
      sectionDescLetterSpacing: userSettings.sectionDescLetterSpacing,
      musicPlayerArtBg: userSettings.musicPlayerArtBg,
    })
    .from(users)
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(eq(users.username, username))
    .limit(1);

  const userList = await userListPromise;

  if (userList.length === 0) {
    notFound()
  }

  const user = userList[0]

  const selectedEffect = user.profileEffectUrl ? (effects as ProfileEffect[]).find(e => e.sku_id === user.profileEffectUrl!.split("effect:")[1]) : null;

  // Buttons and links carry their own `cursor-pointer`, which beats a cursor
  // inherited from an ancestor, so the rule in tailwind.css has to match
  // descendants too. It reads the URL from this variable rather than injected
  // CSS, so a stored value can never escape into a stylesheet. The trailing
  // coordinates are the hotspot — see CURSOR_HOTSPOT.
  const cursorUrl = isAllowedOgImage(user.cursorUrl) ? user.cursorUrl : null
  const cursorValue = cursorUrl
    ? `url(${JSON.stringify(cursorUrl)}) ${CURSOR_HOTSPOT} ${CURSOR_HOTSPOT}`
    : null

  return (
    <div
      className="min-h-screen relative overflow-x-clip"
      data-custom-cursor={cursorValue ? '' : undefined}
      style={{
        backgroundColor: user.pageBgColor || '#050505',
        ...(cursorValue ? ({ '--profile-cursor': cursorValue } as React.CSSProperties) : {}),
      }}
    >
      <Layout1
        username={user.username}
        displayName={user.displayName ?? undefined}
        bio={user.bio ?? undefined}
        location={user.location ?? undefined}
        occupation={user.occupation ?? undefined}
        avatarUrl={user.avatarUrl ?? undefined}
        avatarShape={(user.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "rounded"}
        selectedDecoration={user.avatarDecorationUrl ? { id: "custom", name: "Decoration", url: user.avatarDecorationUrl } : null}
        selectedEffect={selectedEffect}
        decorationHue={user.avatarDecorationHue ?? 0}
        effectHue={user.profileEffectHue ?? 0}
        bannerImageUrl={user.bannerImageUrl ?? undefined}
        bannerBlend={user.bannerBlend ?? false}
        bannerBackgroundUrl={user.bannerBackgroundUrl ?? undefined}
        bannerBackgroundSound={user.bannerBackgroundSound ?? false}
        backgroundEffect={user.backgroundEffect ?? undefined}
        backgroundEffectIntensity={user.backgroundEffectIntensity ?? undefined}
        backgroundEffectColor={user.backgroundEffectColor ?? undefined}
        backgroundEffectAboveContainer={user.backgroundEffectAboveContainer ?? undefined}
        borderEffect={user.borderEffect ?? undefined}
        borderEffectColor={user.borderEffectColor ?? undefined}
        cardEffect={user.cardEffect ?? undefined}
        cardTransition={user.cardTransition ?? undefined}
        usernameEffect={user.usernameEffect ?? undefined}
        descriptionEffect={user.descriptionEffect ?? undefined}
        cursorTrail={user.cursorTrail ?? undefined}
        cursorTrailColor={user.cursorTrailColor ?? undefined}
        entryTransition={user.entryTransition ?? undefined}
        enterScreenEnabled={user.enterScreenEnabled ?? undefined}
        enterScreenText={user.enterScreenText ?? undefined}
        enterScreenFont={user.enterScreenFont ?? undefined}
        enterScreenFontSize={user.enterScreenFontSize ?? undefined}
        enterScreenFontWeight={user.enterScreenFontWeight ?? undefined}
        enterScreenLetterSpacing={user.enterScreenLetterSpacing ?? undefined}
        enterScreenColor={user.enterScreenColor ?? undefined}
        enterScreenOpacity={user.enterScreenOpacity ?? undefined}
        enterScreenBlur={user.enterScreenBlur ?? undefined}
        enterScreenBlurColor={user.enterScreenBlurColor ?? undefined}
        profileBgColor={user.profileBgColor ?? undefined}
        profileBgOpacity={user.profileBgOpacity ?? undefined}
        profileBorderColor={user.profileBorderColor ?? undefined}
        profileBorderOpacity={user.profileBorderOpacity ?? undefined}
        profileBorderWidth={user.profileBorderWidth ?? undefined}
        profileBorderRadius={user.profileBorderRadius ?? undefined}
        profileCardBlur={user.profileCardBlur ?? undefined}
        profileBackgroundBlur={user.profileBackgroundBlur ?? undefined}
        profileShadowColor={user.profileShadowColor ?? undefined}
        profileShadowOpacity={user.profileShadowOpacity ?? undefined}
        profileOpacity={user.profileOpacity ?? undefined}
        views={user.views}
        usernameFont={user.usernameFont ?? undefined}
        usernameFontSize={user.usernameFontSize ?? undefined}
        usernameFontWeight={user.usernameFontWeight ?? undefined}
        usernameLetterSpacing={user.usernameLetterSpacing ?? undefined}
        usernameColor={user.usernameColor ?? undefined}
        bioFont={user.bioFont ?? undefined}
        bioFontSize={user.bioFontSize ?? undefined}
        bioFontWeight={user.bioFontWeight ?? undefined}
        bioLetterSpacing={user.bioLetterSpacing ?? undefined}
        bioColor={user.bioColor ?? undefined}
        sectionTitleColor={user.sectionTitleColor ?? undefined}
        sectionDescColor={user.sectionDescColor ?? undefined}
        sectionTitleFont={user.sectionTitleFont ?? undefined}
        sectionTitleFontSize={user.sectionTitleFontSize ?? undefined}
        sectionTitleFontWeight={user.sectionTitleFontWeight ?? undefined}
        sectionTitleLetterSpacing={user.sectionTitleLetterSpacing ?? undefined}
        sectionDescFont={user.sectionDescFont ?? undefined}
        sectionDescFontSize={user.sectionDescFontSize ?? undefined}
        sectionDescFontWeight={user.sectionDescFontWeight ?? undefined}
        sectionDescLetterSpacing={user.sectionDescLetterSpacing ?? undefined}
        otherFont={user.otherFont ?? undefined}
        otherFontSize={user.otherFontSize ?? undefined}
        otherFontWeight={user.otherFontWeight ?? undefined}
        otherLetterSpacing={user.otherLetterSpacing ?? undefined}
        otherColor={user.otherColor ?? undefined}
        joinDateEnabled={user.joinDateEnabled ?? undefined}
        joinDateFormat={user.joinDateFormat ?? undefined}
        viewsEnabled={user.viewsEnabled ?? undefined}
        viewsAnimationEnabled={user.viewsAnimationEnabled ?? undefined}
        viewsAnimationDuration={user.viewsAnimationDuration ?? undefined}
        commentsEnabled={user.commentsEnabled ?? undefined}
        showCommentsPublicly={user.showCommentsPublicly ?? true}
        allowNewComments={user.allowNewComments ?? true}
        feedbackEnabled={user.feedbackEnabled ?? false}
        showFeedbackPublicly={user.showFeedbackPublicly ?? false}
        showUidTooltip={user.showUidTooltip ?? true}
        showLocationTooltip={user.showLocationTooltip ?? true}
        showOccupationTooltip={user.showOccupationTooltip ?? true}
        showLikesTooltip={user.showLikesTooltip ?? true}
        showDislikesTooltip={user.showDislikesTooltip ?? true}
        showJoinDateTooltip={user.showJoinDateTooltip ?? true}
        showViewsTooltip={user.showViewsTooltip ?? true}
        initialLikes={user.likesCount ?? 0}
        initialDislikes={user.dislikesCount ?? 0}
        createdAt={user.createdAt}
        profileId={user.id}
        viewerId={null}
        highlightFont={user.highlightFont ?? undefined}
        highlightFontSize={user.highlightFontSize ?? undefined}
        highlightFontWeight={user.highlightFontWeight ?? undefined}
        highlightLetterSpacing={user.highlightLetterSpacing ?? undefined}
        widgetPrimaryTextColor={user.widgetPrimaryTextColor ?? undefined}
        widgetSecondaryTextColor={user.widgetSecondaryTextColor ?? undefined}
        widgetBorderColor={user.widgetBorderColor ?? undefined}
        widgetBorderOpacity={user.widgetBorderOpacity ?? undefined}
        widgetBorderWidth={user.widgetBorderWidth ?? undefined}
        widgetBorderRadius={user.widgetBorderRadius ?? undefined}
        widgetFont={user.widgetFont ?? undefined}
        widgetFontSize={user.widgetFontSize ?? undefined}
        widgetFontWeight={user.widgetFontWeight ?? undefined}
        widgetLetterSpacing={user.widgetLetterSpacing ?? undefined}
        wrapInCard={user.wrapInCard ?? undefined}
        contentWidth={user.contentWidth ?? undefined}
        profilePreset={user.profilePreset ?? undefined}
        profileStructure={user.profileStructure ?? undefined}
        aboutSectionEnabled={user.aboutSectionEnabled ?? undefined}
        aboutSectionTitle={user.aboutSectionTitle ?? undefined}
        aboutSectionDescription={user.aboutSectionDescription ?? undefined}
        widgetsSectionEnabled={user.widgetsSectionEnabled ?? undefined}
        contentAlignment={user.contentAlignment ?? undefined}
        avatarPlacement={user.avatarPlacement ?? undefined}
        joinDatePlacement={user.joinDatePlacement ?? undefined}
        locationPlacement={user.locationPlacement ?? undefined}
        occupationPlacement={user.occupationPlacement ?? undefined}
        uidPlacement={user.uidPlacement ?? undefined}
        viewsPlacement={user.viewsPlacement ?? undefined}
        feedbackPlacement={user.feedbackPlacement ?? undefined}
        widgets={user.widgets ?? undefined}
        musicTracks={(user.musicTracks as import("@/lib/music").MusicTrack[] | null) ?? undefined}
        musicPlayerStyle={user.musicPlayerStyle ?? undefined}
        musicPlayerArtBg={user.musicPlayerArtBg ?? true}
        musicPlayerVolume={user.musicPlayerVolume ?? false}
      />
      <ProfileViewTracker profileId={user.id} />
      {user.tabTitleAnimated && (
        <TabTitleTypewriter text={formatTabTitle(user.tabTitle, user.username)} />
      )}
    </div>
  )
}
