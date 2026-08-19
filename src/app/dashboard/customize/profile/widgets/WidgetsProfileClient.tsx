"use client";

import { useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import WidgetsCustomization, { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { useCustomizeProfile } from "../CustomizeProfileProvider";
import { updateProfileWidgets } from "@/actions/profile";
import { toast } from "sonner";

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
      JSON.stringify(item.badgeOrder || []) === JSON.stringify(target.badgeOrder || []) &&
      JSON.stringify(item.hiddenBadges || []) === JSON.stringify(target.hiddenBadges || [])
    );
  });
}

export default function WidgetsProfileClient({ user }: { user: FullUser | null }) {
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

  const hasChanges = useMemo(() => {
    if (overrides.widgets === undefined) return false;
    return !areWidgetsEqual(currentWidgets, userSavedWidgets);
  }, [overrides.widgets, currentWidgets, userSavedWidgets]);

  const handleWidgetsChange = (newWidgets: WidgetItem[]) => {
    if (areWidgetsEqual(newWidgets, userSavedWidgets)) {
      updateOverrides({ widgets: undefined });
    } else {
      updateOverrides({ widgets: newWidgets });
    }
  };

  const handleSave = () => {
    if (!user?.username) return;
    startTransition(async () => {
      try {
        const res = await updateProfileWidgets({
          username: user.username,
          widgets: currentWidgets,
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
      {/* Settings Content */}
      <div className="flex-1 flex flex-col gap-6 pr-[calc(var(--preview-width,380px)+2rem)] pb-20">
        <WidgetsCustomization
          initialWidgets={currentWidgets}
          linkedDiscordId={user?.discordId}
          linkedDiscordUsername={user?.discordUsername}
          onWidgetsChange={handleWidgetsChange}
        />
      </div>

      <DashboardProfilePreview user={user} overrides={overrides} />

      <SaveBar
        show={hasChanges}
        onSave={handleSave}
        onRevert={handleRevert}
      />
    </>
  );
}
