"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import RobloxToggleSetting from "./settings/RobloxToggleSetting";

interface RobloxCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showFollowers: boolean;
  onShowFollowersChange: (val: boolean) => void;
  showFriends: boolean;
  onShowFriendsChange: (val: boolean) => void;
  showVerifiedBadge: boolean;
  onShowVerifiedBadgeChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function RobloxCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showFollowers,
  onShowFollowersChange,
  showFriends,
  onShowFriendsChange,
  showVerifiedBadge,
  onShowVerifiedBadgeChange,
  showBackground,
  onShowBackgroundChange,
  showViewButton,
  onShowViewButtonChange,
}: RobloxCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Roblox Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed Roblox player information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        <RobloxToggleSetting
          label="Show followers"
          description="Display the player's follower count."
          checked={showFollowers}
          onChange={onShowFollowersChange}
        />

        <RobloxToggleSetting
          label="Show friends"
          description="Display the player's friend count."
          checked={showFriends}
          onChange={onShowFriendsChange}
        />

        <RobloxToggleSetting
          label="Show verified badge"
          description="Display the Roblox verified checkmark beside the display name for accounts that have one."
          checked={showVerifiedBadge}
          onChange={onShowVerifiedBadgeChange}
        />

        <RobloxToggleSetting
          label="Background image"
          description="Display a subtle blurred player avatar backdrop in the widget card."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />

        <RobloxToggleSetting
          label="Show redirect button"
          description="Display a top-right direct link button opening the Roblox profile."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
