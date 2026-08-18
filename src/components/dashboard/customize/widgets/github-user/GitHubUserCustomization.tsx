"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import ShowFollowersSetting from "./settings/ShowFollowersSetting";
import ShowFollowingSetting from "./settings/ShowFollowingSetting";
import ShowPublicReposSetting from "./settings/ShowPublicReposSetting";
import ShowViewButtonSetting from "./settings/ShowViewButtonSetting";
import ShowBackgroundOverlaySetting from "./settings/ShowBackgroundOverlaySetting";
import ShowContributionHeatmapSetting from "./settings/ShowContributionHeatmapSetting";

interface GitHubUserCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showFollowers: boolean;
  onShowFollowersChange: (val: boolean) => void;
  showFollowing: boolean;
  onShowFollowingChange: (val: boolean) => void;
  showPublicRepos: boolean;
  onShowPublicReposChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
  showBackgroundOverlay: boolean;
  onShowBackgroundOverlayChange: (val: boolean) => void;
  showContributionHeatmap: boolean;
  onShowContributionHeatmapChange: (val: boolean) => void;
}

export default function GitHubUserCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showFollowers,
  onShowFollowersChange,
  showFollowing,
  onShowFollowingChange,
  showPublicRepos,
  onShowPublicReposChange,
  showViewButton,
  onShowViewButtonChange,
  showBackgroundOverlay,
  onShowBackgroundOverlayChange,
  showContributionHeatmap,
  onShowContributionHeatmapChange,
}: GitHubUserCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">User Customization</h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize how your GitHub profile widget appears on your page.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />
        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />
        <ShowFollowersSetting value={showFollowers} onChange={onShowFollowersChange} />
        <ShowFollowingSetting value={showFollowing} onChange={onShowFollowingChange} />
        <ShowPublicReposSetting value={showPublicRepos} onChange={onShowPublicReposChange} />
        <ShowViewButtonSetting value={showViewButton} onChange={onShowViewButtonChange} />
        <ShowBackgroundOverlaySetting value={showBackgroundOverlay} onChange={onShowBackgroundOverlayChange} />
        <ShowContributionHeatmapSetting value={showContributionHeatmap} onChange={onShowContributionHeatmapChange} />
      </div>
    </div>
  );
}
