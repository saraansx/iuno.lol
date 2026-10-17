"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import { type TemperatureUnit } from "@/lib/weather";
import TemperatureUnitSetting from "./settings/TemperatureUnitSetting";
import WeatherToggleSetting from "./settings/WeatherToggleSetting";

interface WeatherCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  unit: TemperatureUnit;
  onUnitChange: (val: TemperatureUnit) => void;
  showCondition: boolean;
  onShowConditionChange: (val: boolean) => void;
  showFeelsLike: boolean;
  onShowFeelsLikeChange: (val: boolean) => void;
  showLocation: boolean;
  onShowLocationChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
}

export default function WeatherCustomization({
  placement,
  onPlacementChange,
  unit,
  onUnitChange,
  showCondition,
  onShowConditionChange,
  showFeelsLike,
  onShowFeelsLikeChange,
  showLocation,
  onShowLocationChange,
  showBackground,
  onShowBackgroundChange,
}: WeatherCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Weather Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed weather information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <TemperatureUnitSetting value={unit} onChange={onUnitChange} />

        <WeatherToggleSetting
          label="Show condition"
          description="Display the weather condition text (e.g. 'Partly cloudy')."
          checked={showCondition}
          onChange={onShowConditionChange}
        />

        <WeatherToggleSetting
          label="Show feels like"
          description="Display the perceived temperature in addition to the actual one."
          checked={showFeelsLike}
          onChange={onShowFeelsLikeChange}
        />

        <WeatherToggleSetting
          label="Show location"
          description="When on, the title shows the city; when off, the title shows the temperature."
          checked={showLocation}
          onChange={onShowLocationChange}
        />

        <WeatherToggleSetting
          label="Atmospheric background"
          description="Add a subtle sky or night gradient behind the card, matching the current conditions."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />
      </div>
    </div>
  );
}
