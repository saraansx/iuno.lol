"use client";

import ImageShapeSetting from "./settings/ImageShapeSetting";
import PlacementSetting from "./settings/PlacementSetting";
import ShowBackgroundOverlaySetting from "./settings/ShowBackgroundOverlaySetting";
import ShowActivitySetting from "./settings/ShowActivitySetting";
import ShowActivityImageSetting from "./settings/ShowActivityImageSetting";
import ActivityImageShapeSetting from "./settings/ActivityImageShapeSetting";
import ShowAvatarDecorationSetting from "./settings/ShowAvatarDecorationSetting";
import ShowGuildTagSetting from "./settings/ShowGuildTagSetting";
import ShowBadgesSetting from "./settings/ShowBadgesSetting";
import ShowLastSeenSetting from "./settings/ShowLastSeenSetting";
import FallbackTextSetting from "./settings/FallbackTextSetting";

interface PresenceCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (shape: "circle" | "rounded" | "square") => void;
  showBackgroundOverlay: boolean;
  onShowBackgroundOverlayChange: (val: boolean) => void;
  showActivity: boolean;
  onShowActivityChange: (val: boolean) => void;
  showActivityImage: boolean;
  onShowActivityImageChange: (val: boolean) => void;
  activityImageShape: "circle" | "rounded" | "square";
  onActivityImageShapeChange: (shape: "circle" | "rounded" | "square") => void;
  showAvatarDecoration: boolean;
  onShowAvatarDecorationChange: (val: boolean) => void;
  showGuildTag: boolean;
  onShowGuildTagChange: (val: boolean) => void;
  showBadges: boolean;
  onShowBadgesChange: (val: boolean) => void;
  showLastSeen: boolean;
  onShowLastSeenChange: (val: boolean) => void;
  fallbackText: string;
  onFallbackTextChange: (val: string) => void;
}

export default function PresenceCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showBackgroundOverlay,
  onShowBackgroundOverlayChange,
  showActivity,
  onShowActivityChange,
  showActivityImage,
  onShowActivityImageChange,
  activityImageShape,
  onActivityImageShapeChange,
  showAvatarDecoration,
  onShowAvatarDecorationChange,
  showGuildTag,
  onShowGuildTagChange,
  showBadges,
  onShowBadgesChange,
  showLastSeen,
  onShowLastSeenChange,
  fallbackText,
  onFallbackTextChange,
}: PresenceCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Presence customization
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
        <ShowBackgroundOverlaySetting
          value={showBackgroundOverlay}
          onChange={onShowBackgroundOverlayChange}
        />
        <ShowActivitySetting
          value={showActivity}
          onChange={onShowActivityChange}
        />
        <ShowActivityImageSetting
          value={showActivityImage}
          onChange={onShowActivityImageChange}
        />
        <ActivityImageShapeSetting
          value={activityImageShape}
          onChange={onActivityImageShapeChange}
          disabled={!showActivity || !showActivityImage}
        />
        <ShowAvatarDecorationSetting
          value={showAvatarDecoration}
          onChange={onShowAvatarDecorationChange}
        />
        <ShowGuildTagSetting
          value={showGuildTag}
          onChange={onShowGuildTagChange}
        />
        <ShowBadgesSetting
          value={showBadges}
          onChange={onShowBadgesChange}
        />
        <ShowLastSeenSetting
          value={showLastSeen}
          onChange={onShowLastSeenChange}
        />
        <FallbackTextSetting
          value={fallbackText}
          onChange={onFallbackTextChange}
        />
      </div>
    </div>
  );
}
