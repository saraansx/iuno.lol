"use client";

import { useDeferredValue, useEffect, useState } from "react";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { DEFAULT_DETAILS, DEFAULT_FRAME, DEFAULT_PRESET } from "@/components/profile/layouts/ProfilePresetLayout";
import { type FullUser } from "@/lib/features/users/db";
import type { Decoration } from "@/components/dashboard/DecorationPicker";
import type { ProfileEffect } from "@/components/dashboard/EffectsPicker";
import { getMyBadges } from "@/actions/badges";
import { effectSkuFromUrl, useProfileEffect } from "@/lib/collectibles-client";

import type { CustomBadge } from "@/components/profile/layouts/ProfileBadges";

let lastEquippedBadges: string[] | null = null;
let lastCustomBadges: CustomBadge[] = [];

interface DashboardProfilePreviewProps {
  user: FullUser | null;
  overrides?: Partial<FullUser>;
  equippedBadges?: string[];
  customBadges?: CustomBadge[];
  backgrounds?: string[];
  bgPreviewUrl?: string | null;
}

export default function DashboardProfilePreview({ user, overrides = {}, equippedBadges: equippedBadgesProp, customBadges: customBadgesProp, backgrounds, bgPreviewUrl }: DashboardProfilePreviewProps) {
  const deferredOverrides = useDeferredValue(overrides);
  const [fetchedBadges, setFetchedBadges] = useState<string[] | null>(lastEquippedBadges);
  const [fetchedCustom, setFetchedCustom] = useState<CustomBadge[]>(lastCustomBadges);

  useEffect(() => {
    if (equippedBadgesProp !== undefined) return;
    let cancelled = false;
    getMyBadges()
      .then((res) => {
        lastEquippedBadges = res.equipped;
        lastCustomBadges = res.custom;
        if (!cancelled) {
          setFetchedBadges(res.equipped);
          setFetchedCustom(res.custom);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [equippedBadgesProp]);

  const equippedBadges = equippedBadgesProp ?? fetchedBadges ?? [];
  const customBadges = customBadgesProp ?? fetchedCustom;

  const effectUrl = deferredOverrides.profileEffectUrl !== undefined
    ? deferredOverrides.profileEffectUrl
    : user?.profileEffectUrl ?? null;
  const selectedEffect: ProfileEffect | null = useProfileEffect(effectSkuFromUrl(effectUrl)) ?? null;

  return (
    <ProfilePreview
      userId={user?.id}
      username={user?.username ?? undefined}
      displayName={deferredOverrides.displayName ?? user?.displayName ?? undefined}
      bio={deferredOverrides.bio ?? user?.bio ?? undefined}
      location={deferredOverrides.location ?? user?.location ?? undefined}
      occupation={deferredOverrides.occupation ?? user?.occupation ?? undefined}
      avatarUrl={deferredOverrides.avatarUrl ?? user?.avatarUrl ?? undefined}
      avatarShape={deferredOverrides.avatarShape ?? (user?.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "circle"}
      selectedDecoration={deferredOverrides.avatarDecorationUrl !== undefined
        ? (deferredOverrides.avatarDecorationUrl ? { id: "custom", name: "Custom Decoration", url: deferredOverrides.avatarDecorationUrl } as Decoration : null)
        : user?.avatarDecorationUrl
        ? ({ id: "custom", name: "Custom Decoration", url: user.avatarDecorationUrl } as Decoration)
        : null}
      selectedEffect={selectedEffect}
      decorationHue={deferredOverrides.avatarDecorationHue ?? user?.avatarDecorationHue ?? 0}
      effectHue={deferredOverrides.profileEffectHue ?? user?.profileEffectHue ?? 0}
      bannerImageUrl={deferredOverrides.bannerImageUrl ?? user?.bannerImageUrl ?? undefined}
      bannerBlend={deferredOverrides.bannerBlend ?? user?.bannerBlend ?? false}
      backgrounds={backgrounds}
      bannerBackgroundShuffle={deferredOverrides.bannerBackgroundShuffle ?? user?.bannerBackgroundShuffle ?? undefined}
      bannerBackgroundAutoplay={deferredOverrides.bannerBackgroundAutoplay ?? user?.bannerBackgroundAutoplay ?? undefined}
      bgPreviewUrl={bgPreviewUrl}
      auroraColor1={deferredOverrides.auroraColor1 ?? user?.auroraColor1 ?? undefined}
      auroraColor2={deferredOverrides.auroraColor2 ?? user?.auroraColor2 ?? undefined}
      auroraColor3={deferredOverrides.auroraColor3 ?? user?.auroraColor3 ?? undefined}
      auroraSpeed={deferredOverrides.auroraSpeed ?? user?.auroraSpeed ?? undefined}
      auroraBlend={deferredOverrides.auroraBlend ?? user?.auroraBlend ?? undefined}
      darkveilSpeed={deferredOverrides.darkveilSpeed ?? user?.darkveilSpeed ?? undefined}
      darkveilHueShift={deferredOverrides.darkveilHueShift ?? user?.darkveilHueShift ?? undefined}
      darkveilNoise={deferredOverrides.darkveilNoise ?? user?.darkveilNoise ?? undefined}
      darkveilScanFreq={deferredOverrides.darkveilScanFreq ?? user?.darkveilScanFreq ?? undefined}
      darkveilScan={deferredOverrides.darkveilScan ?? user?.darkveilScan ?? undefined}
      darkveilWarp={deferredOverrides.darkveilWarp ?? user?.darkveilWarp ?? undefined}
      pixelblastColor={deferredOverrides.pixelblastColor ?? user?.pixelblastColor ?? undefined}
      pixelblastVariant={deferredOverrides.pixelblastVariant ?? user?.pixelblastVariant ?? undefined}
      pixelblastPixelSize={deferredOverrides.pixelblastPixelSize ?? user?.pixelblastPixelSize ?? undefined}
      pixelblastPatternScale={deferredOverrides.pixelblastPatternScale ?? user?.pixelblastPatternScale ?? undefined}
      pixelblastPatternDensity={deferredOverrides.pixelblastPatternDensity ?? user?.pixelblastPatternDensity ?? undefined}
      pixelblastPixelJitter={deferredOverrides.pixelblastPixelJitter ?? user?.pixelblastPixelJitter ?? undefined}
      pixelblastSpeed={deferredOverrides.pixelblastSpeed ?? user?.pixelblastSpeed ?? undefined}
      pixelblastEdgeFade={deferredOverrides.pixelblastEdgeFade ?? user?.pixelblastEdgeFade ?? undefined}
      pixelblastRipples={deferredOverrides.pixelblastRipples ?? user?.pixelblastRipples ?? undefined}
      pixelblastLiquid={deferredOverrides.pixelblastLiquid ?? user?.pixelblastLiquid ?? undefined}
      colorbendsColor={deferredOverrides.colorbendsColor ?? user?.colorbendsColor ?? undefined}
      colorbendsRotation={deferredOverrides.colorbendsRotation ?? user?.colorbendsRotation ?? undefined}
      colorbendsAutoRotate={deferredOverrides.colorbendsAutoRotate ?? user?.colorbendsAutoRotate ?? undefined}
      colorbendsSpeed={deferredOverrides.colorbendsSpeed ?? user?.colorbendsSpeed ?? undefined}
      colorbendsScale={deferredOverrides.colorbendsScale ?? user?.colorbendsScale ?? undefined}
      colorbendsFrequency={deferredOverrides.colorbendsFrequency ?? user?.colorbendsFrequency ?? undefined}
      colorbendsWarp={deferredOverrides.colorbendsWarp ?? user?.colorbendsWarp ?? undefined}
      colorbendsMouse={deferredOverrides.colorbendsMouse ?? user?.colorbendsMouse ?? undefined}
      colorbendsParallax={deferredOverrides.colorbendsParallax ?? user?.colorbendsParallax ?? undefined}
      colorbendsNoise={deferredOverrides.colorbendsNoise ?? user?.colorbendsNoise ?? undefined}
      colorbendsIterations={deferredOverrides.colorbendsIterations ?? user?.colorbendsIterations ?? undefined}
      colorbendsIntensity={deferredOverrides.colorbendsIntensity ?? user?.colorbendsIntensity ?? undefined}
      colorbendsBandWidth={deferredOverrides.colorbendsBandWidth ?? user?.colorbendsBandWidth ?? undefined}
      liquidchromeColor={deferredOverrides.liquidchromeColor ?? user?.liquidchromeColor ?? undefined}
      liquidchromeSpeed={deferredOverrides.liquidchromeSpeed ?? user?.liquidchromeSpeed ?? undefined}
      liquidchromeAmplitude={deferredOverrides.liquidchromeAmplitude ?? user?.liquidchromeAmplitude ?? undefined}
      liquidchromeInteractive={deferredOverrides.liquidchromeInteractive ?? user?.liquidchromeInteractive ?? undefined}
      crtwarpColor={deferredOverrides.crtwarpColor ?? user?.crtwarpColor ?? undefined}
      crtwarpBackground={deferredOverrides.crtwarpBackground ?? user?.crtwarpBackground ?? undefined}
      crtwarpSpeed={deferredOverrides.crtwarpSpeed ?? user?.crtwarpSpeed ?? undefined}
      crtwarpCurvature={deferredOverrides.crtwarpCurvature ?? user?.crtwarpCurvature ?? undefined}
      crtwarpWaveAmount={deferredOverrides.crtwarpWaveAmount ?? user?.crtwarpWaveAmount ?? undefined}
      crtwarpWaveDensity={deferredOverrides.crtwarpWaveDensity ?? user?.crtwarpWaveDensity ?? undefined}
      crtwarpScanStrength={deferredOverrides.crtwarpScanStrength ?? user?.crtwarpScanStrength ?? undefined}
      crtwarpScanDensity={deferredOverrides.crtwarpScanDensity ?? user?.crtwarpScanDensity ?? undefined}
      crtwarpBloom={deferredOverrides.crtwarpBloom ?? user?.crtwarpBloom ?? undefined}
      crtwarpBloomRadius={deferredOverrides.crtwarpBloomRadius ?? user?.crtwarpBloomRadius ?? undefined}
      crtwarpNoise={deferredOverrides.crtwarpNoise ?? user?.crtwarpNoise ?? undefined}
      crtwarpVignette={deferredOverrides.crtwarpVignette ?? user?.crtwarpVignette ?? undefined}
      crtwarpBrightness={deferredOverrides.crtwarpBrightness ?? user?.crtwarpBrightness ?? undefined}
      crtwarpRgbShift={deferredOverrides.crtwarpRgbShift ?? user?.crtwarpRgbShift ?? undefined}
      crtwarpPixelSize={deferredOverrides.crtwarpPixelSize ?? user?.crtwarpPixelSize ?? undefined}
      crtwarpRenderQuality={deferredOverrides.crtwarpRenderQuality ?? user?.crtwarpRenderQuality ?? undefined}
      crtwarpFrameRate={deferredOverrides.crtwarpFrameRate ?? user?.crtwarpFrameRate ?? undefined}
      crtwarpPointerWarp={deferredOverrides.crtwarpPointerWarp ?? user?.crtwarpPointerWarp ?? undefined}
      crtwarpPointerStrength={deferredOverrides.crtwarpPointerStrength ?? user?.crtwarpPointerStrength ?? undefined}
      crtwarpPaused={deferredOverrides.crtwarpPaused ?? user?.crtwarpPaused ?? undefined}
      backgroundEffect={deferredOverrides.backgroundEffect ?? user?.backgroundEffect ?? "none"}
      backgroundEffectIntensity={deferredOverrides.backgroundEffectIntensity ?? user?.backgroundEffectIntensity ?? 50}
      backgroundEffectColor={deferredOverrides.backgroundEffectColor ?? user?.backgroundEffectColor ?? "#ffffff"}
      backgroundEffectAboveContainer={deferredOverrides.backgroundEffectAboveContainer ?? user?.backgroundEffectAboveContainer ?? false}
      borderEffect={deferredOverrides.borderEffect ?? user?.borderEffect ?? "none"}
      borderEffectColor={deferredOverrides.borderEffectColor ?? user?.borderEffectColor ?? "#ffffff"}
      cardEffect={deferredOverrides.cardEffect ?? user?.cardEffect ?? "none"}
      cardTransition={deferredOverrides.cardTransition ?? user?.cardTransition ?? "none"}
      usernameEffect={deferredOverrides.usernameEffect ?? user?.usernameEffect ?? "none"}
      usernameGlowEnabled={deferredOverrides.usernameGlowEnabled ?? user?.usernameGlowEnabled ?? false}
      equippedBadges={equippedBadges}
      customBadges={customBadges}
      descriptionEffect={deferredOverrides.descriptionEffect ?? user?.descriptionEffect ?? "none"}
      descriptionGlowEnabled={deferredOverrides.descriptionGlowEnabled ?? user?.descriptionGlowEnabled ?? false}
      cursorTrail={deferredOverrides.cursorTrail ?? user?.cursorTrail ?? "none"}
      cursorTrailColor={deferredOverrides.cursorTrailColor ?? user?.cursorTrailColor ?? "#ffffff"}
      clickEffect={deferredOverrides.clickEffect ?? user?.clickEffect ?? "none"}
      clickSound={deferredOverrides.clickSound ?? user?.clickSound ?? "none"}
      entryTransition={deferredOverrides.entryTransition ?? user?.entryTransition ?? "none"}
      pageBgColor={deferredOverrides.pageBgColor ?? user?.pageBgColor ?? "#050505"}
      profileBgColor={deferredOverrides.profileBgColor ?? user?.profileBgColor ?? "#050505"}
      profileBgOpacity={deferredOverrides.profileBgOpacity ?? user?.profileBgOpacity ?? 10}
      profileBorderColor={deferredOverrides.profileBorderColor ?? user?.profileBorderColor ?? "#ffffff"}
      profileBorderOpacity={deferredOverrides.profileBorderOpacity ?? user?.profileBorderOpacity ?? 10}
      profileBorderWidth={deferredOverrides.profileBorderWidth ?? user?.profileBorderWidth ?? 0}
      profileBorderRadius={deferredOverrides.profileBorderRadius ?? user?.profileBorderRadius ?? 24}
      profileCardBlur={deferredOverrides.profileCardBlur ?? user?.profileCardBlur ?? 0}
      profileBackgroundBlur={deferredOverrides.profileBackgroundBlur ?? user?.profileBackgroundBlur ?? 0}
      profileShadowColor={deferredOverrides.profileShadowColor ?? user?.profileShadowColor ?? "#000000"}
      profileShadowOpacity={deferredOverrides.profileShadowOpacity ?? user?.profileShadowOpacity ?? 0}
      profileOpacity={deferredOverrides.profileOpacity ?? user?.profileOpacity ?? 100}
      views={deferredOverrides.views ?? user?.views ?? 0}
      usernameFont={deferredOverrides.usernameFont ?? user?.usernameFont ?? "inter"}
      usernameFontSize={deferredOverrides.usernameFontSize ?? user?.usernameFontSize ?? 24}
      usernameFontWeight={deferredOverrides.usernameFontWeight ?? user?.usernameFontWeight ?? 700}
      usernameLetterSpacing={deferredOverrides.usernameLetterSpacing ?? user?.usernameLetterSpacing ?? 0}
      usernameColor={deferredOverrides.usernameColor ?? user?.usernameColor ?? "#ffffff"}
      sectionTitleFont={deferredOverrides.sectionTitleFont ?? user?.sectionTitleFont ?? "Inter"}
      sectionTitleFontSize={deferredOverrides.sectionTitleFontSize ?? user?.sectionTitleFontSize ?? 15}
      sectionTitleFontWeight={deferredOverrides.sectionTitleFontWeight ?? user?.sectionTitleFontWeight ?? 500}
      sectionTitleLetterSpacing={deferredOverrides.sectionTitleLetterSpacing ?? user?.sectionTitleLetterSpacing ?? 0}
      sectionDescFont={deferredOverrides.sectionDescFont ?? user?.sectionDescFont ?? "Inter"}
      sectionDescFontSize={deferredOverrides.sectionDescFontSize ?? user?.sectionDescFontSize ?? 12.5}
      sectionDescFontWeight={deferredOverrides.sectionDescFontWeight ?? user?.sectionDescFontWeight ?? 400}
      sectionDescLetterSpacing={deferredOverrides.sectionDescLetterSpacing ?? user?.sectionDescLetterSpacing ?? 0}
      sectionTitleColor={deferredOverrides.sectionTitleColor ?? user?.sectionTitleColor ?? "#FFFFFF"}
      sectionDescColor={deferredOverrides.sectionDescColor ?? user?.sectionDescColor ?? "#FFFFFF"}
      musicPrimaryFont={deferredOverrides.musicPrimaryFont ?? user?.musicPrimaryFont ?? "Inter"}
      musicPrimaryFontSize={deferredOverrides.musicPrimaryFontSize ?? user?.musicPrimaryFontSize ?? 15}
      musicPrimaryFontWeight={deferredOverrides.musicPrimaryFontWeight ?? user?.musicPrimaryFontWeight ?? 400}
      musicPrimaryLetterSpacing={deferredOverrides.musicPrimaryLetterSpacing ?? user?.musicPrimaryLetterSpacing ?? 0}
      musicSecondaryFont={deferredOverrides.musicSecondaryFont ?? user?.musicSecondaryFont ?? "Inter"}
      musicSecondaryFontSize={deferredOverrides.musicSecondaryFontSize ?? user?.musicSecondaryFontSize ?? 12.5}
      musicSecondaryFontWeight={deferredOverrides.musicSecondaryFontWeight ?? user?.musicSecondaryFontWeight ?? 400}
      musicSecondaryLetterSpacing={deferredOverrides.musicSecondaryLetterSpacing ?? user?.musicSecondaryLetterSpacing ?? 0}
      musicLyricsFont={deferredOverrides.musicLyricsFont ?? user?.musicLyricsFont ?? "Inter"}
      musicLyricsFontSize={deferredOverrides.musicLyricsFontSize ?? user?.musicLyricsFontSize ?? 14}
      musicLyricsFontWeight={deferredOverrides.musicLyricsFontWeight ?? user?.musicLyricsFontWeight ?? 400}
      musicLyricsLetterSpacing={deferredOverrides.musicLyricsLetterSpacing ?? user?.musicLyricsLetterSpacing ?? 0}
      musicPrimaryColor={deferredOverrides.musicPrimaryColor ?? user?.musicPrimaryColor ?? "#FFFFFF"}
      musicSecondaryColor={deferredOverrides.musicSecondaryColor ?? user?.musicSecondaryColor ?? "#FFFFFF"}
      musicLyricsColor={deferredOverrides.musicLyricsColor ?? user?.musicLyricsColor ?? "#FFFFFF"}
      bioFont={deferredOverrides.bioFont ?? user?.bioFont ?? "inter"}
      bioFontSize={deferredOverrides.bioFontSize ?? user?.bioFontSize ?? 15}
      bioFontWeight={deferredOverrides.bioFontWeight ?? user?.bioFontWeight ?? 400}
      bioLetterSpacing={deferredOverrides.bioLetterSpacing ?? user?.bioLetterSpacing ?? 0}
      bioColor={deferredOverrides.bioColor ?? user?.bioColor ?? "#ffffff"}
      otherFont={deferredOverrides.otherFont ?? user?.otherFont ?? "inter"}
      otherFontSize={deferredOverrides.otherFontSize ?? user?.otherFontSize ?? 13}
      otherFontWeight={deferredOverrides.otherFontWeight ?? user?.otherFontWeight ?? 400}
      otherLetterSpacing={deferredOverrides.otherLetterSpacing ?? user?.otherLetterSpacing ?? 0}
      otherColor={deferredOverrides.otherColor ?? user?.otherColor ?? "#5b6cf5"}
      highlightFont={deferredOverrides.highlightFont ?? user?.highlightFont ?? "Inter"}
      highlightFontSize={deferredOverrides.highlightFontSize ?? user?.highlightFontSize ?? 11}
      highlightFontWeight={deferredOverrides.highlightFontWeight ?? user?.highlightFontWeight ?? 500}
      highlightLetterSpacing={deferredOverrides.highlightLetterSpacing ?? user?.highlightLetterSpacing ?? 0}
      widgetPrimaryTextColor={deferredOverrides.widgetPrimaryTextColor ?? user?.widgetPrimaryTextColor ?? "#FFFFFF"}
      widgetSecondaryTextColor={deferredOverrides.widgetSecondaryTextColor ?? user?.widgetSecondaryTextColor ?? "#FFFFFF"}
      widgetBorderColor={deferredOverrides.widgetBorderColor ?? user?.widgetBorderColor ?? "#FFFFFF"}
      widgetBorderOpacity={deferredOverrides.widgetBorderOpacity ?? user?.widgetBorderOpacity ?? 10}
      widgetBorderWidth={deferredOverrides.widgetBorderWidth ?? user?.widgetBorderWidth ?? 1}
      widgetBorderRadius={deferredOverrides.widgetBorderRadius ?? user?.widgetBorderRadius ?? 24}
      widgetFont={deferredOverrides.widgetFont ?? user?.widgetFont ?? "Inter"}
      widgetFontSize={deferredOverrides.widgetFontSize ?? user?.widgetFontSize ?? 12.5}
      widgetFontWeight={deferredOverrides.widgetFontWeight ?? user?.widgetFontWeight ?? 400}
      widgetLetterSpacing={deferredOverrides.widgetLetterSpacing ?? user?.widgetLetterSpacing ?? 0}
      widgetSecondaryFont={deferredOverrides.widgetSecondaryFont ?? user?.widgetSecondaryFont ?? undefined}
      widgetSecondaryFontSize={deferredOverrides.widgetSecondaryFontSize ?? user?.widgetSecondaryFontSize ?? undefined}
      widgetSecondaryFontWeight={deferredOverrides.widgetSecondaryFontWeight ?? user?.widgetSecondaryFontWeight ?? undefined}
      widgetSecondaryLetterSpacing={deferredOverrides.widgetSecondaryLetterSpacing ?? user?.widgetSecondaryLetterSpacing ?? undefined}
      wrapInCard={deferredOverrides.wrapInCard ?? user?.wrapInCard ?? DEFAULT_FRAME.wrapInCard}
      contentWidth={deferredOverrides.contentWidth ?? user?.contentWidth ?? DEFAULT_FRAME.contentWidth}
      profilePreset={deferredOverrides.profilePreset ?? user?.profilePreset ?? DEFAULT_PRESET}
      profileStructure={deferredOverrides.profileStructure ?? user?.profileStructure ?? "standard"}
      aboutSectionEnabled={deferredOverrides.aboutSectionEnabled ?? user?.aboutSectionEnabled ?? true}
      aboutSectionTitle={deferredOverrides.aboutSectionTitle ?? user?.aboutSectionTitle ?? undefined}
      aboutSectionDescription={deferredOverrides.aboutSectionDescription ?? user?.aboutSectionDescription ?? undefined}
      linksSectionEnabled={deferredOverrides.linksSectionEnabled ?? user?.linksSectionEnabled ?? true}
      linksSectionTitle={deferredOverrides.linksSectionTitle ?? user?.linksSectionTitle ?? undefined}
      linksSectionDescription={deferredOverrides.linksSectionDescription ?? user?.linksSectionDescription ?? undefined}
      linksSectionPosition={deferredOverrides.linksSectionPosition ?? user?.linksSectionPosition ?? "below"}
      widgetsSectionEnabled={deferredOverrides.widgetsSectionEnabled ?? user?.widgetsSectionEnabled ?? true}
      contentAlignment={deferredOverrides.contentAlignment ?? user?.contentAlignment ?? DEFAULT_FRAME.contentAlignment}
      avatarPlacement={deferredOverrides.avatarPlacement ?? user?.avatarPlacement ?? DEFAULT_FRAME.avatarPlacement}
      joinDatePlacement={deferredOverrides.joinDatePlacement ?? user?.joinDatePlacement ?? DEFAULT_DETAILS.joinDate}
      locationPlacement={deferredOverrides.locationPlacement ?? user?.locationPlacement ?? DEFAULT_DETAILS.location}
      occupationPlacement={deferredOverrides.occupationPlacement ?? user?.occupationPlacement ?? DEFAULT_DETAILS.occupation}
      uidPlacement={deferredOverrides.uidPlacement ?? user?.uidPlacement ?? DEFAULT_DETAILS.uid}
      viewsPlacement={deferredOverrides.viewsPlacement ?? user?.viewsPlacement ?? DEFAULT_DETAILS.views}
      feedbackPlacement={deferredOverrides.feedbackPlacement ?? user?.feedbackPlacement ?? DEFAULT_DETAILS.feedback}
      joinDateEnabled={deferredOverrides.joinDateEnabled ?? user?.joinDateEnabled ?? true}
      joinDateFormat={deferredOverrides.joinDateFormat ?? user?.joinDateFormat ?? "standard"}
      viewsEnabled={deferredOverrides.viewsEnabled ?? user?.viewsEnabled ?? true}
      viewsAnimationEnabled={deferredOverrides.viewsAnimationEnabled ?? user?.viewsAnimationEnabled ?? true}
      viewsAnimationDuration={deferredOverrides.viewsAnimationDuration ?? user?.viewsAnimationDuration ?? 1000}
      viewsAnimationStyle={deferredOverrides.viewsAnimationStyle ?? user?.viewsAnimationStyle ?? "none"}
      commentsEnabled={deferredOverrides.commentsEnabled ?? user?.commentsEnabled ?? false}
      feedbackEnabled={deferredOverrides.feedbackEnabled ?? user?.feedbackEnabled ?? true}
      showFeedbackPublicly={deferredOverrides.showFeedbackPublicly ?? user?.showFeedbackPublicly ?? true}
      showUidTooltip={deferredOverrides.showUidTooltip ?? user?.showUidTooltip ?? false}
      showLocationTooltip={deferredOverrides.showLocationTooltip ?? user?.showLocationTooltip ?? false}
      showOccupationTooltip={deferredOverrides.showOccupationTooltip ?? user?.showOccupationTooltip ?? false}
      showLikesTooltip={deferredOverrides.showLikesTooltip ?? user?.showLikesTooltip ?? false}
      showDislikesTooltip={deferredOverrides.showDislikesTooltip ?? user?.showDislikesTooltip ?? false}
      showJoinDateTooltip={deferredOverrides.showJoinDateTooltip ?? user?.showJoinDateTooltip ?? false}
      showViewsTooltip={deferredOverrides.showViewsTooltip ?? user?.showViewsTooltip ?? false}
      showLinksTooltip={deferredOverrides.showLinksTooltip ?? user?.showLinksTooltip ?? false}
      showBadgesTooltip={deferredOverrides.showBadgesTooltip ?? user?.showBadgesTooltip ?? false}
      iconsGlowEnabled={deferredOverrides.iconsGlowEnabled ?? user?.iconsGlowEnabled ?? false}
      joinDateIconGlow={deferredOverrides.joinDateIconGlow ?? user?.joinDateIconGlow ?? false}
      locationIconGlow={deferredOverrides.locationIconGlow ?? user?.locationIconGlow ?? false}
      occupationIconGlow={deferredOverrides.occupationIconGlow ?? user?.occupationIconGlow ?? false}
      uidIconGlow={deferredOverrides.uidIconGlow ?? user?.uidIconGlow ?? false}
      viewsIconGlow={deferredOverrides.viewsIconGlow ?? user?.viewsIconGlow ?? false}
      feedbackIconGlow={deferredOverrides.feedbackIconGlow ?? user?.feedbackIconGlow ?? false}
      badgeGlowEnabled={deferredOverrides.badgeGlowEnabled ?? user?.badgeGlowEnabled ?? true}
      badgeGlowStrength={deferredOverrides.badgeGlowStrength ?? user?.badgeGlowStrength ?? 50}
      badgeSize={deferredOverrides.badgeSize ?? user?.badgeSize ?? 18}
      badgeMonochromeEnabled={deferredOverrides.badgeMonochromeEnabled ?? user?.badgeMonochromeEnabled ?? false}
      badgeMonochromeColor={deferredOverrides.badgeMonochromeColor ?? user?.badgeMonochromeColor ?? null}
      badgeContainerStyle={deferredOverrides.badgeContainerStyle ?? user?.badgeContainerStyle ?? "pill"}
      badgeSpacing={deferredOverrides.badgeSpacing ?? user?.badgeSpacing ?? 6}
      badgeScrollStyle={deferredOverrides.badgeScrollStyle ?? user?.badgeScrollStyle ?? "none"}
      badgeScrollSpeed={deferredOverrides.badgeScrollSpeed ?? user?.badgeScrollSpeed ?? 40}
      badgeVisibleCount={deferredOverrides.badgeVisibleCount ?? user?.badgeVisibleCount ?? 5}
      badgeShimmerEnabled={deferredOverrides.badgeShimmerEnabled ?? user?.badgeShimmerEnabled ?? false}
      createdAt={deferredOverrides.createdAt ?? user?.createdAt}
      widgets={(deferredOverrides.widgets as import("@/components/dashboard/customize/widgets/WidgetsCustomization").WidgetItem[]) ?? (user?.widgets as import("@/components/dashboard/customize/widgets/WidgetsCustomization").WidgetItem[]) ?? []}
      musicTracks={(deferredOverrides.musicTracks as import("@/lib/music").MusicTrack[]) ?? (user?.musicTracks as import("@/lib/music").MusicTrack[] | undefined) ?? []}
      musicPlayerStyle={deferredOverrides.musicPlayerStyle ?? user?.musicPlayerStyle ?? "compact"}
      musicPlayerArtBg={deferredOverrides.musicPlayerArtBg ?? user?.musicPlayerArtBg ?? false}
      musicPlayerVolume={deferredOverrides.musicPlayerVolume ?? user?.musicPlayerVolume ?? true}
      musicPlayerDefaultVolume={deferredOverrides.musicPlayerDefaultVolume ?? user?.musicPlayerDefaultVolume ?? 100}
      musicPlayerVolumeFixed={true}
      musicPlayerShuffle={deferredOverrides.musicPlayerShuffle ?? user?.musicPlayerShuffle ?? false}
      links={(deferredOverrides.links as import("@/lib/links").ProfileLink[] | undefined) ?? (user?.links as import("@/lib/links").ProfileLink[] | undefined) ?? []}
      linksFont={deferredOverrides.linksFont ?? user?.linksFont ?? "Inter"}
      linksFontSize={deferredOverrides.linksFontSize ?? user?.linksFontSize ?? 13.5}
      linksFontWeight={deferredOverrides.linksFontWeight ?? user?.linksFontWeight ?? 400}
      linksLetterSpacing={deferredOverrides.linksLetterSpacing ?? user?.linksLetterSpacing ?? 0}
      linksAlignment={deferredOverrides.linksAlignment ?? user?.linksAlignment ?? "center"}
      linksSocialBackground={deferredOverrides.linksSocialBackground ?? user?.linksSocialBackground ?? true}
      linksBorderRadius={deferredOverrides.linksBorderRadius ?? user?.linksBorderRadius ?? 16}
      linksIconSize={deferredOverrides.linksIconSize ?? user?.linksIconSize ?? 17}
      linksIconGap={deferredOverrides.linksIconGap ?? user?.linksIconGap ?? 10}
    />
  );
}
