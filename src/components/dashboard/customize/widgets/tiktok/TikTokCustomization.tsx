"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import ShowFollowersSetting from "./settings/ShowFollowersSetting";
import ShowFollowingSetting from "./settings/ShowFollowingSetting";
import ShowLikesSetting from "./settings/ShowLikesSetting";
import ShowVideosSetting from "./settings/ShowVideosSetting";
import ShowVerifiedBadgeSetting from "./settings/ShowVerifiedBadgeSetting";
import ShowBackgroundSetting from "./settings/ShowBackgroundSetting";
import ShowViewButtonSetting from "./settings/ShowViewButtonSetting";

interface TikTokCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showFollowers: boolean;
  onShowFollowersChange: (val: boolean) => void;
  showFollowing: boolean;
  onShowFollowingChange: (val: boolean) => void;
  showLikes: boolean;
  onShowLikesChange: (val: boolean) => void;
  showVideos: boolean;
  onShowVideosChange: (val: boolean) => void;
  showVerifiedBadge: boolean;
  onShowVerifiedBadgeChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function TikTokCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showFollowers,
  onShowFollowersChange,
  showFollowing,
  onShowFollowingChange,
  showLikes,
  onShowLikesChange,
  showVideos,
  onShowVideosChange,
  showVerifiedBadge,
  onShowVerifiedBadgeChange,
  showBackground,
  onShowBackgroundChange,
  showViewButton,
  onShowViewButtonChange,
}: TikTokCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">TikTok Settings</h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize how your TikTok profile widget appears on your page.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />
        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />
        <ShowFollowersSetting value={showFollowers} onChange={onShowFollowersChange} />
        <ShowFollowingSetting value={showFollowing} onChange={onShowFollowingChange} />
        <ShowLikesSetting value={showLikes} onChange={onShowLikesChange} />
        <ShowVideosSetting value={showVideos} onChange={onShowVideosChange} />
        <ShowVerifiedBadgeSetting value={showVerifiedBadge} onChange={onShowVerifiedBadgeChange} />
        <ShowBackgroundSetting value={showBackground} onChange={onShowBackgroundChange} />
        <ShowViewButtonSetting value={showViewButton} onChange={onShowViewButtonChange} />
      </div>
    </div>
  );
}
