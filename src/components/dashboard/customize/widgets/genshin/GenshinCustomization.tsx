"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import GenshinToggleSetting from "./settings/GenshinToggleSetting";

interface GenshinCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showAr: boolean;
  onShowArChange: (val: boolean) => void;
  showWorldLevel: boolean;
  onShowWorldLevelChange: (val: boolean) => void;
  showAchievements: boolean;
  onShowAchievementsChange: (val: boolean) => void;
  showRegion: boolean;
  onShowRegionChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showBackgroundImage: boolean;
  onShowBackgroundImageChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function GenshinCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showAr,
  onShowArChange,
  showWorldLevel,
  onShowWorldLevelChange,
  showAchievements,
  onShowAchievementsChange,
  showRegion,
  onShowRegionChange,
  showBackground,
  onShowBackgroundChange,
  showBackgroundImage,
  onShowBackgroundImageChange,
  showViewButton,
  onShowViewButtonChange,
}: GenshinCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Display options
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed Genshin Impact information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        <GenshinToggleSetting
          label="Background card"
          description={
            showBackgroundImage
              ? "Turn off Background image to use the namecard artwork."
              : "Display player's equipped namecard artwork as the widget cover."
          }
          checked={showBackground}
          onChange={onShowBackgroundChange}
          disabled={showBackgroundImage}
        />

        <GenshinToggleSetting
          label="Background image"
          description={
            showBackground
              ? "Turn off Background card to use the character avatar."
              : "Display a subtle blurred character avatar in the widget background."
          }
          checked={showBackgroundImage}
          onChange={onShowBackgroundImageChange}
          disabled={showBackground}
        />

        <GenshinToggleSetting
          label="Show server region"
          description="Display player's server region badge (NA, EU, ASIA, SAR, CN)."
          checked={showRegion}
          onChange={onShowRegionChange}
        />

        <GenshinToggleSetting
          label="Show Adventure Rank"
          description="Display player's Adventure Rank level (AR)."
          checked={showAr}
          onChange={onShowArChange}
        />

        <GenshinToggleSetting
          label="Show World Level"
          description="Display player's current world level tier."
          checked={showWorldLevel}
          onChange={onShowWorldLevelChange}
        />

        <GenshinToggleSetting
          label="Show achievements count"
          description="Display completed achievements counter."
          checked={showAchievements}
          onChange={onShowAchievementsChange}
        />

        <GenshinToggleSetting
          label="Show redirect button"
          description="Display link out button to open player profile on Enka.Network."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
