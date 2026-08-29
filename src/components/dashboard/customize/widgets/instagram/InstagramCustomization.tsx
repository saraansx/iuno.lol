"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import InstagramToggleSetting from "./settings/InstagramToggleSetting";

interface InstagramCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showFollowers: boolean;
  onShowFollowersChange: (val: boolean) => void;
  showFollowing: boolean;
  onShowFollowingChange: (val: boolean) => void;
  showPosts: boolean;
  onShowPostsChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function InstagramCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showFollowers,
  onShowFollowersChange,
  showFollowing,
  onShowFollowingChange,
  showPosts,
  onShowPostsChange,
  showBackground,
  onShowBackgroundChange,
  showViewButton,
  onShowViewButtonChange,
}: InstagramCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Instagram Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed Instagram profile statistics.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        <InstagramToggleSetting
          label="Show followers"
          description="Display your total follower count on the profile widget."
          checked={showFollowers}
          onChange={onShowFollowersChange}
        />

        <InstagramToggleSetting
          label="Show following"
          description="Display your total following count on the profile widget."
          checked={showFollowing}
          onChange={onShowFollowingChange}
        />

        <InstagramToggleSetting
          label="Show post count"
          description="Display your total public post count on the profile widget."
          checked={showPosts}
          onChange={onShowPostsChange}
        />

        <InstagramToggleSetting
          label="Background image"
          description="Display a subtle blurred avatar backdrop in the widget card."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />

        <InstagramToggleSetting
          label="Show redirect button"
          description="Display a top-right direct link button opening your Instagram profile."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
