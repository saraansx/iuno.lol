"use client";

import { useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import WidgetsCustomization, { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import WidgetBorderCustomization from "@/components/dashboard/customize/widgets/WidgetBorderCustomization";
import { useCustomizeProfile } from "../CustomizeProfileProvider";
import { updateProfileWidgets } from "@/actions/profile";
import { toast } from "sonner";
import PremiumLock from "@/components/ui/premium-lock";
import { isPremiumActive } from "@/lib/premium";

const FREE_WIDGETS = 3;
const PREMIUM_WIDGETS = 10;

function areWidgetsEqual(a: WidgetItem[], b: WidgetItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, idx) => {
    const target = b[idx];
    return (
      item.id === target.id &&
      item.platform === target.platform &&
      item.type === target.type &&
      item.targetId === target.targetId &&
      item.useLinked === target.useLinked &&
      item.enabled === target.enabled &&
      item.imageShape === target.imageShape &&
      item.showActivity === target.showActivity &&
      item.showActivityImage === target.showActivityImage &&
      item.activityImageShape === target.activityImageShape &&
      item.showAvatarDecoration === target.showAvatarDecoration &&
      item.showGuildTag === target.showGuildTag &&
      item.showBadges === target.showBadges &&
      item.showLastSeen === target.showLastSeen &&
      item.fallbackText === target.fallbackText &&
      item.showMemberCount === target.showMemberCount &&
      item.showOnlineCount === target.showOnlineCount &&
      item.showBanner === target.showBanner &&
      item.placement === target.placement &&
      item.showFollowers === target.showFollowers &&
      item.showFollowing === target.showFollowing &&
      item.showPublicRepos === target.showPublicRepos &&
      item.showViewButton === target.showViewButton &&
      item.showBackgroundOverlay === target.showBackgroundOverlay &&
      item.showContributionHeatmap === target.showContributionHeatmap &&
      item.showStars === target.showStars &&
      item.showForks === target.showForks &&
      item.showWatchers === target.showWatchers &&
      item.showOpenIssues === target.showOpenIssues &&
      item.showPrimaryLanguage === target.showPrimaryLanguage &&
      item.showPinCount === target.showPinCount &&
      item.imageBackground === target.imageBackground &&
      item.valorantRankMode === target.valorantRankMode &&
      item.valorantAvatar === target.valorantAvatar &&
      item.valorantBackground === target.valorantBackground &&
      item.valorantMatchSource === target.valorantMatchSource &&
      item.showRank === target.showRank &&
      item.valorantRankStyle === target.valorantRankStyle &&
      item.showRR === target.showRR &&
      item.showLevel === target.showLevel &&
      item.steamShowLevel === target.steamShowLevel &&
      item.steamShowGames === target.steamShowGames &&
      item.steamShowMemberSince === target.steamShowMemberSince &&
      item.steamShowAvatarFrame === target.steamShowAvatarFrame &&
      item.steamShowAnimatedAvatar === target.steamShowAnimatedAvatar &&
      item.steamBackground === target.steamBackground &&
      item.steamShowBackgroundImage === target.steamShowBackgroundImage &&
      item.genshinShowAr === target.genshinShowAr &&
      item.genshinShowWorldLevel === target.genshinShowWorldLevel &&
      item.genshinShowAchievements === target.genshinShowAchievements &&
      item.genshinShowRegion === target.genshinShowRegion &&
      item.genshinShowBackground === target.genshinShowBackground &&
      item.genshinShowBackgroundImage === target.genshinShowBackgroundImage &&
      item.twitchShowLiveStatus === target.twitchShowLiveStatus &&
      item.twitchShowFollowers === target.twitchShowFollowers &&
      item.twitchShowPartnerBadge === target.twitchShowPartnerBadge &&
      item.twitchShowBackground === target.twitchShowBackground &&
      item.spotifyShowArtist === target.spotifyShowArtist &&
      item.spotifyShowAlbum === target.spotifyShowAlbum &&
      item.spotifyShowTrackCount === target.spotifyShowTrackCount &&
      item.spotifyShowReleaseYear === target.spotifyShowReleaseYear &&
      item.spotifyShowOwner === target.spotifyShowOwner &&
      item.spotifyShowMonthlyListeners === target.spotifyShowMonthlyListeners &&
      item.spotifyShowFollowers === target.spotifyShowFollowers &&
      item.spotifyShowBackground === target.spotifyShowBackground &&
      item.tiktokShowFollowers === target.tiktokShowFollowers &&
      item.tiktokShowFollowing === target.tiktokShowFollowing &&
      item.tiktokShowLikes === target.tiktokShowLikes &&
      item.tiktokShowVideos === target.tiktokShowVideos &&
      item.tiktokShowVerifiedBadge === target.tiktokShowVerifiedBadge &&
      item.tiktokShowBackground === target.tiktokShowBackground &&
      item.youtubeMode === target.youtubeMode &&
      item.youtubeImageSource === target.youtubeImageSource &&
      item.youtubeShowSubscribers === target.youtubeShowSubscribers &&
      item.youtubeShowVideoCount === target.youtubeShowVideoCount &&
      item.youtubeShowTotalViews === target.youtubeShowTotalViews &&
      item.youtubeShowVideoViews === target.youtubeShowVideoViews &&
      item.youtubeShowVideoLikes === target.youtubeShowVideoLikes &&
      item.youtubeShowUploadDate === target.youtubeShowUploadDate &&
      item.youtubeShowBackground === target.youtubeShowBackground &&
      item.youtubeShowBanner === target.youtubeShowBanner &&
      JSON.stringify(item.badgeOrder || []) === JSON.stringify(target.badgeOrder || []) &&
      JSON.stringify(item.hiddenBadges || []) === JSON.stringify(target.hiddenBadges || [])
    );
  });
}

export default function WidgetsProfileClient({ user, backgrounds }: { user: FullUser | null; backgrounds?: string[] }) {
  const router = useRouter();
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();
  const [, startTransition] = useTransition();

  const userSavedWidgets: WidgetItem[] = useMemo(
    () => (user?.widgets as WidgetItem[]) || [],
    [user?.widgets]
  );

  const currentWidgets: WidgetItem[] = useMemo(() => {
    return overrides.widgets !== undefined
      ? (overrides.widgets || [])
      : userSavedWidgets;
  }, [overrides.widgets, userSavedWidgets]);

  const isPremium = isPremiumActive(user);
  const maxWidgets = isPremium ? PREMIUM_WIDGETS : FREE_WIDGETS;

  const initialBorderWidth = user?.widgetBorderWidth ?? 1;
  const initialBorderRadius = user?.widgetBorderRadius ?? 24;
  const initialBorderOpacity = user?.widgetBorderOpacity ?? 10;

  const borderWidth = overrides.widgetBorderWidth ?? initialBorderWidth;
  const setBorderWidth = (val: number) =>
    updateOverrides({ widgetBorderWidth: val === initialBorderWidth ? undefined : val });
  const borderRadius = overrides.widgetBorderRadius ?? initialBorderRadius;
  const setBorderRadius = (val: number) =>
    updateOverrides({ widgetBorderRadius: val === initialBorderRadius ? undefined : val });
  const borderOpacity = overrides.widgetBorderOpacity ?? initialBorderOpacity;
  const setBorderOpacity = (val: number) =>
    updateOverrides({ widgetBorderOpacity: val === initialBorderOpacity ? undefined : val });

  const hasChanges = useMemo(() => {
    const borderChanged =
      overrides.widgetBorderWidth !== undefined ||
      overrides.widgetBorderRadius !== undefined ||
      overrides.widgetBorderOpacity !== undefined;
    if (borderChanged) return true;
    if (overrides.widgets === undefined) return false;
    return !areWidgetsEqual(currentWidgets, userSavedWidgets);
  }, [
    overrides.widgets,
    overrides.widgetBorderWidth,
    overrides.widgetBorderRadius,
    overrides.widgetBorderOpacity,
    currentWidgets,
    userSavedWidgets,
  ]);

  const handleWidgetsChange = (newWidgets: WidgetItem[]) => {
    if (areWidgetsEqual(newWidgets, userSavedWidgets)) {
      updateOverrides({ widgets: undefined });
    } else {
      updateOverrides({ widgets: newWidgets });
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await updateProfileWidgets({
          widgets: currentWidgets,
          widgetBorderWidth: borderWidth,
          widgetBorderRadius: borderRadius,
          widgetBorderOpacity: borderOpacity,
        });
        if (res.success) {
          toast.success("Widgets updated successfully");
          scheduleClear();
          router.refresh();
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update widgets");
      }
    });
  };

  const handleRevert = () => {
    clearOverrides();
  };

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 pr-[calc(var(--preview-width,380px)+2rem)] pb-20">
        <WidgetsCustomization
          initialWidgets={currentWidgets}
          maxWidgets={maxWidgets}
          linkedDiscordId={user?.discordId}
          linkedDiscordUsername={user?.discordUsername}
          onWidgetsChange={handleWidgetsChange}
        />

        <WidgetBorderCustomization
          borderWidth={borderWidth}
          setBorderWidth={setBorderWidth}
          borderRadius={borderRadius}
          setBorderRadius={setBorderRadius}
          borderOpacity={borderOpacity}
          setBorderOpacity={setBorderOpacity}
        />

        {!isPremium && (
          <div className="flex gap-3 bg-[#0c0c0c] border border-white/5 rounded-[16px] px-4 py-3.5 relative overflow-hidden">
            <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-[#5b6cf5]/70" />
            <PremiumLock size={16} className="mt-0.5" />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-[14px] font-medium text-white/90 tracking-tight">
                Need more widgets?
              </span>
              <p className="text-[12.5px] text-white/40">
                Get{" "}
                <span className="inline-flex items-center gap-1 text-white font-medium">
                  <svg width="11" height="11" viewBox="0 0 512 512" fill="#c084fc" aria-hidden="true">
                    <path d="M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z" />
                  </svg>
                  Premium
                </span>{" "}
                to add {PREMIUM_WIDGETS - FREE_WIDGETS} more.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="shrink-0 self-center bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white text-[12.5px] font-normal rounded-xl px-3.5 py-2 transition-colors cursor-pointer"
            >
              Get Premium
            </button>
          </div>
        )}
      </div>

      <DashboardProfilePreview user={user} backgrounds={backgrounds} overrides={overrides} />

      <SaveBar
        show={hasChanges}
        onSave={handleSave}
        onRevert={handleRevert}
      />
    </>
  );
}
