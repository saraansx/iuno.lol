"use client";

import ImageShapeSetting from "../discord-presence/settings/ImageShapeSetting";
import PlacementSetting from "../discord-presence/settings/PlacementSetting";
import ShowMemberCountSetting from "./settings/ShowMemberCountSetting";
import ShowOnlineCountSetting from "./settings/ShowOnlineCountSetting";
import ShowBannerSetting from "./settings/ShowBannerSetting";
import ShowBackgroundOverlaySetting from "./settings/ShowBackgroundOverlaySetting";
import ShowViewButtonSetting from "../discord-presence/settings/ShowViewButtonSetting";

interface ServerCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (shape: "circle" | "rounded" | "square") => void;
  showMemberCount: boolean;
  onShowMemberCountChange: (val: boolean) => void;
  showOnlineCount: boolean;
  onShowOnlineCountChange: (val: boolean) => void;
  showBanner: boolean;
  onShowBannerChange: (val: boolean) => void;
  showBackgroundOverlay: boolean;
  onShowBackgroundOverlayChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function ServerCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showMemberCount,
  onShowMemberCountChange,
  showOnlineCount,
  onShowOnlineCountChange,
  showBanner,
  onShowBannerChange,
  showBackgroundOverlay,
  onShowBackgroundOverlayChange,
  showViewButton,
  onShowViewButtonChange,
}: ServerCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Server customization
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Toggle and customize how this widget displays on your profile.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting
          value={placement}
          onChange={onPlacementChange}
        />
        <ImageShapeSetting
          value={imageShape}
          onChange={onImageShapeChange}
        />
        <ShowMemberCountSetting
          value={showMemberCount}
          onChange={onShowMemberCountChange}
        />
        <ShowOnlineCountSetting
          value={showOnlineCount}
          onChange={onShowOnlineCountChange}
        />
        <ShowBannerSetting
          value={showBanner}
          onChange={onShowBannerChange}
          disabled={showBackgroundOverlay}
        />
        <ShowBackgroundOverlaySetting
          value={showBackgroundOverlay}
          onChange={onShowBackgroundOverlayChange}
          disabled={showBanner}
        />
        <ShowViewButtonSetting
          value={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
