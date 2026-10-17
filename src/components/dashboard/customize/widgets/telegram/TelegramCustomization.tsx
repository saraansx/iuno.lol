"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import TelegramToggleSetting from "./settings/TelegramToggleSetting";

interface TelegramCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showBio: boolean;
  onShowBioChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showBackgroundOverlay: boolean;
  onShowBackgroundOverlayChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function TelegramCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showBio,
  onShowBioChange,
  showBackground,
  onShowBackgroundChange,
  showBackgroundOverlay,
  onShowBackgroundOverlayChange,
  showViewButton,
  onShowViewButtonChange,
}: TelegramCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Telegram Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed Telegram profile information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        <TelegramToggleSetting
          label="Show bio"
          description="Display the profile's bio line below the display name."
          checked={showBio}
          onChange={onShowBioChange}
        />

        <TelegramToggleSetting
          label="Background image"
          description="Use the profile photo as a background behind the card."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />

        <TelegramToggleSetting
          label="Background overlay"
          description="Darken and blur the background image so the card content stays readable."
          checked={showBackgroundOverlay}
          onChange={onShowBackgroundOverlayChange}
          disabled={!showBackground}
        />

        <TelegramToggleSetting
          label="Show redirect button"
          description="Display a top-right direct link button opening the Telegram profile."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
