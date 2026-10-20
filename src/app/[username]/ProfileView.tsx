import { notFound, redirect } from 'next/navigation'
import Layout1 from '@/components/profile/layouts/Layout1'
import ProfileViewTracker from '@/components/profile/ProfileViewTracker'
import TabTitleTypewriter from '@/components/profile/TabTitleTypewriter'
import { getEffectByUrl } from '@/lib/collectibles'
import { getEquippedBadgeIds, getUserBackgrounds, getCustomBadges, getAliasOwner } from '@/lib/features/users/db'
import { resolveEffectConfig } from '@/lib/effect-config'
import { applyTemplateStyle } from '@/lib/template-style'
import { CURSOR_HOTSPOT } from '@/lib/cursor'
import { formatTabTitle, isAllowedOgImage } from '@/lib/og'
import { getProfileRows } from './profile-data'

export default async function ProfileView({
  username: rawUsername,
  isScreenshot = false,
  isPreview = false,
  styleOverrides = null,
  backgroundOverride = null,
}: {
  username: string
  isScreenshot?: boolean
  isPreview?: boolean
  styleOverrides?: Record<string, unknown> | null
  backgroundOverride?: string[] | null
}) {
  const username = rawUsername.toLowerCase().trim()

  const userList = await getProfileRows(username)

  if (userList.length === 0) {
    const owner = await getAliasOwner(username)
    if (owner) redirect(`/${owner.username}`)
    notFound()
  }

  const baseRow = styleOverrides
    ? applyTemplateStyle(userList[0], styleOverrides)
    : userList[0]

  const user = { ...baseRow, ...resolveEffectConfig(baseRow.effectConfig) }

  const isStatic = isScreenshot || isPreview

  const selectedEffect = getEffectByUrl(user.profileEffectUrl);

  const [equippedBadges, storedBackgrounds, customBadges] = await Promise.all([
    getEquippedBadgeIds(user.id),
    getUserBackgrounds(user.id),
    getCustomBadges(user.id),
  ]);

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
        isScreenshot={isStatic}
        username={user.username}
        displayName={user.displayName ?? undefined}
        bio={user.bio ?? undefined}
        location={user.location ?? undefined}
        occupation={user.occupation ?? undefined}
        avatarUrl={user.avatarUrl ?? undefined}
        avatarShape={(user.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "circle"}
        selectedDecoration={user.avatarDecorationUrl ? { id: "custom", name: "Decoration", url: user.avatarDecorationUrl } : null}
        selectedEffect={selectedEffect}
        decorationHue={user.avatarDecorationHue ?? 0}
        effectHue={user.profileEffectHue ?? 0}
        bannerImageUrl={user.bannerImageUrl ?? undefined}
        bannerBlend={user.bannerBlend ?? false}
        backgrounds={backgroundOverride ?? storedBackgrounds}
        bannerBackgroundShuffle={user.bannerBackgroundShuffle ?? undefined}
        bannerBackgroundAutoplay={user.bannerBackgroundAutoplay ?? undefined}
        bannerBackgroundSound={user.bannerBackgroundSound ?? false}
        auroraColor1={user.auroraColor1 ?? undefined}
        auroraColor2={user.auroraColor2 ?? undefined}
        auroraColor3={user.auroraColor3 ?? undefined}
        auroraSpeed={user.auroraSpeed ?? undefined}
        auroraBlend={user.auroraBlend ?? undefined}
        darkveilSpeed={user.darkveilSpeed ?? undefined}
        darkveilHueShift={user.darkveilHueShift ?? undefined}
        darkveilNoise={user.darkveilNoise ?? undefined}
        darkveilScanFreq={user.darkveilScanFreq ?? undefined}
        darkveilScan={user.darkveilScan ?? undefined}
        darkveilWarp={user.darkveilWarp ?? undefined}
        pixelblastColor={user.pixelblastColor ?? undefined}
        pixelblastVariant={user.pixelblastVariant ?? undefined}
        pixelblastPixelSize={user.pixelblastPixelSize ?? undefined}
        pixelblastPatternScale={user.pixelblastPatternScale ?? undefined}
        pixelblastPatternDensity={user.pixelblastPatternDensity ?? undefined}
        pixelblastPixelJitter={user.pixelblastPixelJitter ?? undefined}
        pixelblastSpeed={user.pixelblastSpeed ?? undefined}
        pixelblastEdgeFade={user.pixelblastEdgeFade ?? undefined}
        pixelblastRipples={user.pixelblastRipples ?? undefined}
        pixelblastLiquid={user.pixelblastLiquid ?? undefined}
        colorbendsColor={user.colorbendsColor ?? undefined}
        colorbendsRotation={user.colorbendsRotation ?? undefined}
        colorbendsAutoRotate={user.colorbendsAutoRotate ?? undefined}
        colorbendsSpeed={user.colorbendsSpeed ?? undefined}
        colorbendsScale={user.colorbendsScale ?? undefined}
        colorbendsFrequency={user.colorbendsFrequency ?? undefined}
        colorbendsWarp={user.colorbendsWarp ?? undefined}
        colorbendsMouse={user.colorbendsMouse ?? undefined}
        colorbendsParallax={user.colorbendsParallax ?? undefined}
        colorbendsNoise={user.colorbendsNoise ?? undefined}
        colorbendsIterations={user.colorbendsIterations ?? undefined}
        colorbendsIntensity={user.colorbendsIntensity ?? undefined}
        colorbendsBandWidth={user.colorbendsBandWidth ?? undefined}
        liquidchromeColor={user.liquidchromeColor ?? undefined}
        liquidchromeSpeed={user.liquidchromeSpeed ?? undefined}
        liquidchromeAmplitude={user.liquidchromeAmplitude ?? undefined}
        liquidchromeInteractive={user.liquidchromeInteractive ?? undefined}
        crtwarpColor={user.crtwarpColor ?? undefined}
        crtwarpBackground={user.crtwarpBackground ?? undefined}
        crtwarpSpeed={user.crtwarpSpeed ?? undefined}
        crtwarpCurvature={user.crtwarpCurvature ?? undefined}
        crtwarpWaveAmount={user.crtwarpWaveAmount ?? undefined}
        crtwarpWaveDensity={user.crtwarpWaveDensity ?? undefined}
        crtwarpScanStrength={user.crtwarpScanStrength ?? undefined}
        crtwarpScanDensity={user.crtwarpScanDensity ?? undefined}
        crtwarpBloom={user.crtwarpBloom ?? undefined}
        crtwarpBloomRadius={user.crtwarpBloomRadius ?? undefined}
        crtwarpNoise={user.crtwarpNoise ?? undefined}
        crtwarpVignette={user.crtwarpVignette ?? undefined}
        crtwarpBrightness={user.crtwarpBrightness ?? undefined}
        crtwarpRgbShift={user.crtwarpRgbShift ?? undefined}
        crtwarpPixelSize={user.crtwarpPixelSize ?? undefined}
        crtwarpRenderQuality={user.crtwarpRenderQuality ?? undefined}
        crtwarpFrameRate={user.crtwarpFrameRate ?? undefined}
        crtwarpPointerWarp={user.crtwarpPointerWarp ?? undefined}
        crtwarpPointerStrength={user.crtwarpPointerStrength ?? undefined}
        crtwarpPaused={user.crtwarpPaused ?? undefined}
        backgroundEffect={user.backgroundEffect ?? undefined}
        backgroundEffectIntensity={user.backgroundEffectIntensity ?? undefined}
        backgroundEffectColor={user.backgroundEffectColor ?? undefined}
        backgroundEffectAboveContainer={user.backgroundEffectAboveContainer ?? undefined}
        borderEffect={user.borderEffect ?? undefined}
        borderEffectColor={user.borderEffectColor ?? undefined}
        cardEffect={user.cardEffect ?? undefined}
        cardTransition={user.cardTransition ?? undefined}
        usernameEffect={user.usernameEffect ?? undefined}
        usernameGlowEnabled={user.usernameGlowEnabled ?? false}
        equippedBadges={equippedBadges}
        customBadges={customBadges}
        badgeGlowEnabled={user.badgeGlowEnabled ?? true}
        badgeGlowStrength={user.badgeGlowStrength ?? undefined}
        badgeSize={user.badgeSize ?? undefined}
        badgeMonochromeEnabled={user.badgeMonochromeEnabled ?? false}
        badgeMonochromeColor={user.badgeMonochromeColor ?? undefined}
        badgeContainerStyle={user.badgeContainerStyle ?? undefined}
        badgeSpacing={user.badgeSpacing ?? undefined}
        badgeScrollStyle={user.badgeScrollStyle ?? undefined}
        badgeScrollSpeed={user.badgeScrollSpeed ?? undefined}
        badgeVisibleCount={user.badgeVisibleCount ?? undefined}
        badgeShimmerEnabled={user.badgeShimmerEnabled ?? false}
        descriptionEffect={user.descriptionEffect ?? undefined}
        descriptionGlowEnabled={user.descriptionGlowEnabled ?? false}
        cursorTrail={user.cursorTrail ?? undefined}
        cursorTrailColor={user.cursorTrailColor ?? undefined}
        clickEffect={user.clickEffect ?? undefined}
        clickSound={user.clickSound ?? undefined}
        entryTransition={user.entryTransition ?? undefined}
        enterScreenEnabled={isStatic ? false : (user.enterScreenEnabled ?? undefined)}
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
        views={user.viewsEnabled === false ? 0 : user.views}
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
        musicPrimaryFont={user.musicPrimaryFont ?? undefined}
        musicPrimaryFontSize={user.musicPrimaryFontSize ?? undefined}
        musicPrimaryFontWeight={user.musicPrimaryFontWeight ?? undefined}
        musicPrimaryLetterSpacing={user.musicPrimaryLetterSpacing ?? undefined}
        musicSecondaryFont={user.musicSecondaryFont ?? undefined}
        musicSecondaryFontSize={user.musicSecondaryFontSize ?? undefined}
        musicSecondaryFontWeight={user.musicSecondaryFontWeight ?? undefined}
        musicSecondaryLetterSpacing={user.musicSecondaryLetterSpacing ?? undefined}
        musicLyricsFont={user.musicLyricsFont ?? undefined}
        musicLyricsFontSize={user.musicLyricsFontSize ?? undefined}
        musicLyricsFontWeight={user.musicLyricsFontWeight ?? undefined}
        musicLyricsLetterSpacing={user.musicLyricsLetterSpacing ?? undefined}
        musicPrimaryColor={user.musicPrimaryColor ?? undefined}
        musicSecondaryColor={user.musicSecondaryColor ?? undefined}
        musicLyricsColor={user.musicLyricsColor ?? undefined}
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
        viewsAnimationStyle={user.viewsAnimationStyle ?? undefined}
        commentsEnabled={user.commentsEnabled ?? undefined}
        showCommentsPublicly={user.showCommentsPublicly ?? false}
        allowNewComments={user.allowNewComments ?? false}
        feedbackEnabled={user.feedbackEnabled ?? true}
        showFeedbackPublicly={user.showFeedbackPublicly ?? true}
        showUidTooltip={user.showUidTooltip ?? false}
        showLocationTooltip={user.showLocationTooltip ?? false}
        showOccupationTooltip={user.showOccupationTooltip ?? false}
        showLikesTooltip={user.showLikesTooltip ?? false}
        showDislikesTooltip={user.showDislikesTooltip ?? false}
        showJoinDateTooltip={user.showJoinDateTooltip ?? false}
        showViewsTooltip={user.showViewsTooltip ?? false}
        showLinksTooltip={user.showLinksTooltip ?? false}
        showBadgesTooltip={user.showBadgesTooltip ?? false}
        iconsGlowEnabled={user.iconsGlowEnabled ?? false}
        joinDateIconGlow={user.joinDateIconGlow ?? false}
        locationIconGlow={user.locationIconGlow ?? false}
        occupationIconGlow={user.occupationIconGlow ?? false}
        uidIconGlow={user.uidIconGlow ?? false}
        viewsIconGlow={user.viewsIconGlow ?? false}
        feedbackIconGlow={user.feedbackIconGlow ?? false}
        initialLikes={user.feedbackEnabled === false ? 0 : user.likesCount ?? 0}
        initialDislikes={user.feedbackEnabled === false ? 0 : user.dislikesCount ?? 0}
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
        widgetSecondaryFont={user.widgetSecondaryFont ?? undefined}
        widgetSecondaryFontSize={user.widgetSecondaryFontSize ?? undefined}
        widgetSecondaryFontWeight={user.widgetSecondaryFontWeight ?? undefined}
        widgetSecondaryLetterSpacing={user.widgetSecondaryLetterSpacing ?? undefined}
        wrapInCard={user.wrapInCard ?? undefined}
        contentWidth={user.contentWidth ?? undefined}
        profilePreset={user.profilePreset ?? undefined}
        profileStructure={user.profileStructure ?? undefined}
        aboutSectionEnabled={user.aboutSectionEnabled ?? undefined}
        aboutSectionTitle={user.aboutSectionTitle ?? undefined}
        aboutSectionDescription={user.aboutSectionDescription ?? undefined}
        linksSectionEnabled={user.linksSectionEnabled ?? undefined}
        linksSectionTitle={user.linksSectionTitle ?? undefined}
        linksSectionDescription={user.linksSectionDescription ?? undefined}
        linksSectionPosition={user.linksSectionPosition ?? undefined}
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
        links={(user.links as import("@/lib/links").ProfileLink[] | null) ?? undefined}
        linksAlignment={user.linksAlignment ?? undefined}
        linksSocialBackground={user.linksSocialBackground ?? undefined}
        linksBorderRadius={user.linksBorderRadius ?? undefined}
        linksIconSize={user.linksIconSize ?? undefined}
        linksIconGap={user.linksIconGap ?? undefined}
        linksFont={user.linksFont ?? undefined}
        linksFontSize={user.linksFontSize ?? undefined}
        linksFontWeight={user.linksFontWeight ?? undefined}
        linksLetterSpacing={user.linksLetterSpacing ?? undefined}
        musicTracks={(user.musicTracks as import("@/lib/music").MusicTrack[] | null) ?? undefined}
        musicPlayerStyle={user.musicPlayerStyle ?? undefined}
        musicPlayerArtBg={user.musicPlayerArtBg ?? false}
        musicPlayerVolume={user.musicPlayerVolume ?? true}
        musicPlayerDefaultVolume={user.musicPlayerDefaultVolume ?? 100}
        musicPlayerShuffle={user.musicPlayerShuffle ?? false}
      />
      {!isStatic && <ProfileViewTracker profileId={user.id} />}
      {!isStatic && user.tabTitleAnimated && (
        <TabTitleTypewriter text={formatTabTitle(user.tabTitle, user.username)} />
      )}
    </div>
  )
}
