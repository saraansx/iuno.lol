"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import ShowBackgroundOverlaySetting from "./settings/ShowBackgroundOverlaySetting";
import ShowStarsSetting from "./settings/ShowStarsSetting";
import ShowForksSetting from "./settings/ShowForksSetting";
import ShowWatchersSetting from "./settings/ShowWatchersSetting";
import ShowOpenIssuesSetting from "./settings/ShowOpenIssuesSetting";
import ShowPrimaryLanguageSetting from "./settings/ShowPrimaryLanguageSetting";
import ShowRepoViewButtonSetting from "./settings/ShowRepoViewButtonSetting";

interface GitHubRepoCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showBackgroundOverlay: boolean;
  onShowBackgroundOverlayChange: (val: boolean) => void;
  showStars: boolean;
  onShowStarsChange: (val: boolean) => void;
  showForks: boolean;
  onShowForksChange: (val: boolean) => void;
  showWatchers: boolean;
  onShowWatchersChange: (val: boolean) => void;
  showOpenIssues: boolean;
  onShowOpenIssuesChange: (val: boolean) => void;
  showPrimaryLanguage: boolean;
  onShowPrimaryLanguageChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function GitHubRepoCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showBackgroundOverlay,
  onShowBackgroundOverlayChange,
  showStars,
  onShowStarsChange,
  showForks,
  onShowForksChange,
  showWatchers,
  onShowWatchersChange,
  showOpenIssues,
  onShowOpenIssuesChange,
  showPrimaryLanguage,
  onShowPrimaryLanguageChange,
  showViewButton,
  onShowViewButtonChange,
}: GitHubRepoCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Repository Customization</h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize how your GitHub repository widget appears on your page.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />
        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />
        <ShowStarsSetting value={showStars} onChange={onShowStarsChange} />
        <ShowForksSetting value={showForks} onChange={onShowForksChange} />
        <ShowWatchersSetting value={showWatchers} onChange={onShowWatchersChange} />
        <ShowOpenIssuesSetting value={showOpenIssues} onChange={onShowOpenIssuesChange} />
        <ShowPrimaryLanguageSetting value={showPrimaryLanguage} onChange={onShowPrimaryLanguageChange} />
        <ShowRepoViewButtonSetting value={showViewButton} onChange={onShowViewButtonChange} />
        <ShowBackgroundOverlaySetting value={showBackgroundOverlay} onChange={onShowBackgroundOverlayChange} />
      </div>
    </div>
  );
}
