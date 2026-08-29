"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import TwitchToggleSetting from "./settings/TwitchToggleSetting";

interface TwitchCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showLiveStatus: boolean;
  onShowLiveStatusChange: (val: boolean) => void;
  showFollowers: boolean;
  onShowFollowersChange: (val: boolean) => void;
  showPartnerBadge: boolean;
  onShowPartnerBadgeChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function TwitchCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showLiveStatus,
  onShowLiveStatusChange,
  showFollowers,
  onShowFollowersChange,
  showPartnerBadge,
  onShowPartnerBadgeChange,
  showBackground,
  onShowBackgroundChange,
  showViewButton,
  onShowViewButtonChange,
}: TwitchCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Twitch Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed Twitch channel information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        <TwitchToggleSetting
          label="Show live status"
          description="Display live stream indicator, viewer count, and game title when broadcasting."
          checked={showLiveStatus}
          onChange={onShowLiveStatusChange}
        />

        <TwitchToggleSetting
          label="Show followers"
          description="Display channel follower count when stream is offline or live status is hidden."
          checked={showFollowers}
          onChange={onShowFollowersChange}
        />

        <TwitchToggleSetting
          label="Show partner badge"
          description="Display verified partner checkmark icon beside the streamer username."
          checked={showPartnerBadge}
          onChange={onShowPartnerBadgeChange}
        />

        <TwitchToggleSetting
          label="Background image"
          description="Display a subtle blurred channel avatar backdrop in the widget card."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />

        <TwitchToggleSetting
          label="Show redirect button"
          description="Display a top-right direct link button opening your Twitch channel."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
