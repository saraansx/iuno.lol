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
  showVerifiedBadge: boolean;
  onShowVerifiedBadgeChange: (val: boolean) => void;
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
  showVerifiedBadge,
  onShowVerifiedBadgeChange,
  showBackground,
  onShowBackgroundChange,
  showViewButton,
  onShowViewButtonChange,
}: InstagramCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Instagram Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed Instagram profile information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        <InstagramToggleSetting
          label="Show followers"
          description="Display the follower count on the card."
          checked={showFollowers}
          onChange={onShowFollowersChange}
        />

        <InstagramToggleSetting
          label="Show following"
          description="Display how many accounts this profile follows."
          checked={showFollowing}
          onChange={onShowFollowingChange}
        />

        <InstagramToggleSetting
          label="Show posts"
          description="Display the total number of posts."
          checked={showPosts}
          onChange={onShowPostsChange}
        />

        <InstagramToggleSetting
          label="Verified badge"
          description="Show the verification badge next to the display name."
          checked={showVerifiedBadge}
          onChange={onShowVerifiedBadgeChange}
        />

        <InstagramToggleSetting
          label="Background image"
          description="Use the profile photo as a blurred background behind the card."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />

        <InstagramToggleSetting
          label="Show redirect button"
          description="Display a top-right direct link button opening the Instagram profile."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
