"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import SoundcloudToggleSetting from "./settings/SoundcloudToggleSetting";

interface SoundcloudCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showFollowers: boolean;
  onShowFollowersChange: (val: boolean) => void;
  showTracks: boolean;
  onShowTracksChange: (val: boolean) => void;
  showVerifiedBadge: boolean;
  onShowVerifiedBadgeChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function SoundcloudCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showFollowers,
  onShowFollowersChange,
  showTracks,
  onShowTracksChange,
  showVerifiedBadge,
  onShowVerifiedBadgeChange,
  showBackground,
  onShowBackgroundChange,
  showViewButton,
  onShowViewButtonChange,
}: SoundcloudCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          SoundCloud Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed SoundCloud artist information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        <SoundcloudToggleSetting
          label="Show followers"
          description="Display the artist's follower count on the card."
          checked={showFollowers}
          onChange={onShowFollowersChange}
        />

        <SoundcloudToggleSetting
          label="Show tracks"
          description="Display how many tracks the artist has uploaded."
          checked={showTracks}
          onChange={onShowTracksChange}
        />

        <SoundcloudToggleSetting
          label="Verified badge"
          description="Show the verification badge next to the artist name."
          checked={showVerifiedBadge}
          onChange={onShowVerifiedBadgeChange}
        />

        <SoundcloudToggleSetting
          label="Background image"
          description="Use the artist's banner or avatar as a blurred background behind the card."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />

        <SoundcloudToggleSetting
          label="Show redirect button"
          description="Display a top-right direct link button opening the SoundCloud profile."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
