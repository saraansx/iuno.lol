"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import SteamBackgroundSetting from "./settings/SteamBackgroundSetting";
import SteamToggleSetting from "./settings/SteamToggleSetting";

interface SteamCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showLevel: boolean;
  onShowLevelChange: (val: boolean) => void;
  showGames: boolean;
  onShowGamesChange: (val: boolean) => void;
  showMemberSince: boolean;
  onShowMemberSinceChange: (val: boolean) => void;
  showAvatarFrame: boolean;
  onShowAvatarFrameChange: (val: boolean) => void;
  showAnimatedAvatar: boolean;
  onShowAnimatedAvatarChange: (val: boolean) => void;
  background: "none" | "large" | "small";
  onBackgroundChange: (val: "none" | "large" | "small") => void;
  showBackgroundImage: boolean;
  onShowBackgroundImageChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function SteamCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showLevel,
  onShowLevelChange,
  showGames,
  onShowGamesChange,
  showMemberSince,
  onShowMemberSinceChange,
  showAvatarFrame,
  onShowAvatarFrameChange,
  showAnimatedAvatar,
  onShowAnimatedAvatarChange,
  background,
  onBackgroundChange,
  showBackgroundImage,
  onShowBackgroundImageChange,
  showViewButton,
  onShowViewButtonChange,
}: SteamCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Display options
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed Steam information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Placement */}
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        {/* Image Shape */}
        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        {/* Show Level */}
        <SteamToggleSetting
          label="Show level"
          description="Display current Steam account level badge."
          checked={showLevel}
          onChange={onShowLevelChange}
        />

        {/* Show Games */}
        <SteamToggleSetting
          label="Show games count"
          description="Display total number of owned games in library."
          checked={showGames}
          onChange={onShowGamesChange}
        />

        {/* Show Member Since */}
        <SteamToggleSetting
          label="Show member since"
          description="Display account creation year badge."
          checked={showMemberSince}
          onChange={onShowMemberSinceChange}
        />

        {/* Show Avatar Frame */}
        <SteamToggleSetting
          label="Show avatar frame"
          description="Display customized Steam Points Shop avatar frame if equipped."
          checked={showAvatarFrame}
          onChange={onShowAvatarFrameChange}
        />

        {/* Show Animated Avatar */}
        <SteamToggleSetting
          label="Show animated avatar"
          description="Use animated avatar image if equipped on Steam profile."
          checked={showAnimatedAvatar}
          onChange={onShowAnimatedAvatarChange}
        />

        {/* Profile Background */}
        <SteamBackgroundSetting
          value={background}
          onChange={onBackgroundChange}
          disabled={showBackgroundImage}
        />

        {/* Background Image (blurred avatar) */}
        <SteamToggleSetting
          label="Background image"
          description={
            background !== "none"
              ? "Set Profile background to None to use the avatar as background."
              : "Display a subtle blurred avatar in the widget background."
          }
          checked={showBackgroundImage}
          onChange={onShowBackgroundImageChange}
          disabled={background !== "none"}
        />

        {/* Show View Button */}
        <SteamToggleSetting
          label="Show redirect button"
          description="Display link out button to open profile on Steam."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
