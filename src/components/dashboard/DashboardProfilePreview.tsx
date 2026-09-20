"use client";

import { useDeferredValue, useEffect, useState } from "react";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { DEFAULT_DETAILS, DEFAULT_FRAME, DEFAULT_PRESET } from "@/components/profile/layouts/ProfilePresetLayout";
import { type FullUser } from "@/lib/features/users/db";
import type { Decoration } from "@/components/dashboard/DecorationPicker";
import type { ProfileEffect } from "@/components/dashboard/EffectsPicker";
import { getMyBadges } from "@/actions/badges";
import effects from "@/effects.json";

interface DashboardProfilePreviewProps {
  user: FullUser | null;
  overrides?: Partial<FullUser>;
  equippedBadges?: string[];
}

export default function DashboardProfilePreview({ user, overrides = {}, equippedBadges: equippedBadgesProp }: DashboardProfilePreviewProps) {
  const deferredOverrides = useDeferredValue(overrides);
  const [equippedBadges, setEquippedBadges] = useState<string[]>(equippedBadgesProp ?? []);

  useEffect(() => {
    if (equippedBadgesProp !== undefined) {
      setEquippedBadges(equippedBadgesProp);
      return;
    }
    let cancelled = false;
    getMyBadges()
      .then((res) => {
        if (!cancelled) setEquippedBadges(res.equipped);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [equippedBadgesProp]);

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
      selectedEffect={(() => {
        if (deferredOverrides.profileEffectUrl !== undefined) {
          if (!deferredOverrides.profileEffectUrl) return null;
          return (effects as ProfileEffect[]).find(e => e.sku_id === deferredOverrides.profileEffectUrl!.split("effect:")[1]) || null;
        }
        if (user?.profileEffectUrl) {
          return (effects as ProfileEffect[]).find(e => e.sku_id === user.profileEffectUrl!.split("effect:")[1]) || null;
        }
        return null;
      })()}
      decorationHue={deferredOverrides.avatarDecorationHue ?? user?.avatarDecorationHue ?? 0}
      effectHue={deferredOverrides.profileEffectHue ?? user?.profileEffectHue ?? 0}
      bannerImageUrl={deferredOverrides.bannerImageUrl ?? user?.bannerImageUrl ?? undefined}
      bannerBlend={deferredOverrides.bannerBlend ?? user?.bannerBlend ?? false}
      bannerBackgroundUrl={deferredOverrides.bannerBackgroundUrl ?? user?.bannerBackgroundUrl ?? undefined}
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
      profileCardBlur={deferredOverrides.profileCardBlur ?? user?.profileCardBlur ?? 4}
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
      commentsEnabled={deferredOverrides.commentsEnabled ?? user?.commentsEnabled ?? true}
      feedbackEnabled={deferredOverrides.feedbackEnabled ?? user?.feedbackEnabled ?? false}
      showFeedbackPublicly={deferredOverrides.showFeedbackPublicly ?? user?.showFeedbackPublicly ?? false}
      showUidTooltip={deferredOverrides.showUidTooltip ?? user?.showUidTooltip ?? true}
      showLocationTooltip={deferredOverrides.showLocationTooltip ?? user?.showLocationTooltip ?? true}
      showOccupationTooltip={deferredOverrides.showOccupationTooltip ?? user?.showOccupationTooltip ?? true}
      showLikesTooltip={deferredOverrides.showLikesTooltip ?? user?.showLikesTooltip ?? true}
      showDislikesTooltip={deferredOverrides.showDislikesTooltip ?? user?.showDislikesTooltip ?? true}
      showJoinDateTooltip={deferredOverrides.showJoinDateTooltip ?? user?.showJoinDateTooltip ?? true}
      showViewsTooltip={deferredOverrides.showViewsTooltip ?? user?.showViewsTooltip ?? true}
      showLinksTooltip={deferredOverrides.showLinksTooltip ?? user?.showLinksTooltip ?? true}
      showBadgesTooltip={deferredOverrides.showBadgesTooltip ?? user?.showBadgesTooltip ?? true}
      badgeGlowEnabled={deferredOverrides.badgeGlowEnabled ?? user?.badgeGlowEnabled ?? true}
      badgeGlowStrength={deferredOverrides.badgeGlowStrength ?? user?.badgeGlowStrength ?? 50}
      badgeSize={deferredOverrides.badgeSize ?? user?.badgeSize ?? 18}
      badgeMonochromeEnabled={deferredOverrides.badgeMonochromeEnabled ?? user?.badgeMonochromeEnabled ?? false}
      badgeMonochromeColor={deferredOverrides.badgeMonochromeColor ?? user?.badgeMonochromeColor ?? null}
      badgeContainerStyle={deferredOverrides.badgeContainerStyle ?? user?.badgeContainerStyle ?? "pill"}
      badgeSpacing={deferredOverrides.badgeSpacing ?? user?.badgeSpacing ?? 6}
      createdAt={deferredOverrides.createdAt ?? user?.createdAt}
      widgets={(deferredOverrides.widgets as import("@/components/dashboard/customize/widgets/WidgetsCustomization").WidgetItem[]) ?? (user?.widgets as import("@/components/dashboard/customize/widgets/WidgetsCustomization").WidgetItem[]) ?? []}
      musicTracks={(deferredOverrides.musicTracks as import("@/lib/music").MusicTrack[]) ?? (user?.musicTracks as import("@/lib/music").MusicTrack[] | undefined) ?? []}
      musicPlayerStyle={deferredOverrides.musicPlayerStyle ?? user?.musicPlayerStyle ?? "compact"}
      musicPlayerArtBg={deferredOverrides.musicPlayerArtBg ?? user?.musicPlayerArtBg ?? true}
      musicPlayerVolume={deferredOverrides.musicPlayerVolume ?? user?.musicPlayerVolume ?? true}
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
    />
  );
}
