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
          Steam Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize how your Steam widget appears on your page.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        <SteamToggleSetting
          label="Show level"
          description="Display current Steam account level badge."
          checked={showLevel}
          onChange={onShowLevelChange}
        />

        <SteamToggleSetting
          label="Show games count"
          description="Display total number of owned games in library."
          checked={showGames}
          onChange={onShowGamesChange}
        />

        <SteamToggleSetting
          label="Show member since"
          description="Display account creation year badge."
          checked={showMemberSince}
          onChange={onShowMemberSinceChange}
        />

        <SteamToggleSetting
          label="Show avatar frame"
          description="Display customized Steam Points Shop avatar frame if equipped."
          checked={showAvatarFrame}
          onChange={onShowAvatarFrameChange}
        />

        <SteamToggleSetting
          label="Show animated avatar"
          description="Use animated avatar image if equipped on Steam profile."
          checked={showAnimatedAvatar}
          onChange={onShowAnimatedAvatarChange}
        />

        <SteamBackgroundSetting
          value={background}
          onChange={onBackgroundChange}
          disabled={showBackgroundImage}
        />

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
