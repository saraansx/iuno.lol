"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import ShowPinCountSetting from "../pinterest-profile/settings/ShowPinCountSetting";
import ShowBackgroundOverlaySetting from "../pinterest-profile/settings/ShowBackgroundOverlaySetting";
import ShowViewButtonSetting from "../pinterest-profile/settings/ShowViewButtonSetting";

interface PinterestBoardCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showPinCount: boolean;
  onShowPinCountChange: (val: boolean) => void;
  showBackgroundOverlay: boolean;
  onShowBackgroundOverlayChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function PinterestBoardCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showPinCount,
  onShowPinCountChange,
  showBackgroundOverlay,
  onShowBackgroundOverlayChange,
  showViewButton,
  onShowViewButtonChange,
}: PinterestBoardCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Board Customization</h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Toggle and customize how this widget displays on your profile.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />
        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />
        <ShowPinCountSetting
          value={showPinCount}
          onChange={onShowPinCountChange}
          subtitle="Display how many pins the board holds."
        />
        <ShowBackgroundOverlaySetting
          value={showBackgroundOverlay}
          onChange={onShowBackgroundOverlayChange}
        />
        <ShowViewButtonSetting
          value={showViewButton}
          onChange={onShowViewButtonChange}
          subtitle="Add a button linking to the board on Pinterest."
        />
      </div>
    </div>
  );
}
