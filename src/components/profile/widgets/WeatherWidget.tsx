"use client";

import { useWeather } from "@/lib/hooks/useWeather";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { type TemperatureUnit, formatTemperature } from "@/lib/weather";
import OverflowPingPong from "./OverflowPingPong";
import {
  WeatherConditionIcon,
  WeatherConditionMarkerIcon,
  WeatherTemperatureIcon,
} from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

const SKY_GRADIENTS: Record<string, { day: string; night: string }> = {
  clear: {
    day: "from-[#2b7fd4]/45 via-[#4aa3e8]/25 to-transparent",
    night: "from-[#1b2a52]/60 via-[#2a3a68]/30 to-transparent",
  },
  "partly-cloudy": {
    day: "from-[#3d82c4]/40 via-[#6fa8d8]/22 to-transparent",
    night: "from-[#1e2c4e]/58 via-[#2c3c62]/28 to-transparent",
  },
  cloudy: {
    day: "from-[#5b6b7d]/42 via-[#7d8b9c]/22 to-transparent",
    night: "from-[#232c38]/58 via-[#333d4c]/28 to-transparent",
  },
  fog: {
    day: "from-[#6b7580]/42 via-[#8d959e]/24 to-transparent",
    night: "from-[#262c33]/58 via-[#363d45]/28 to-transparent",
  },
  drizzle: {
    day: "from-[#3f6d94]/45 via-[#5f8cad]/24 to-transparent",
    night: "from-[#1d2a3a]/60 via-[#2b3a4c]/30 to-transparent",
  },
  rain: {
    day: "from-[#2f5c85]/48 via-[#4a7ba3]/26 to-transparent",
    night: "from-[#182534]/62 via-[#253546]/30 to-transparent",
  },
  snow: {
    day: "from-[#6f8ba8]/40 via-[#9db4cc]/22 to-transparent",
    night: "from-[#222d3d]/58 via-[#323e50]/28 to-transparent",
  },
  thunderstorm: {
    day: "from-[#3a3f5c]/52 via-[#54597a]/28 to-transparent",
    night: "from-[#1a1c2e]/64 via-[#282b42]/32 to-transparent",
  },
};

export default function WeatherWidget({ widget }: { widget: WidgetItem }) {
  const cleanLocation = (widget.targetId || "").trim();

  const { weather, isLoading } = useWeather(cleanLocation, {
    refetchInterval: 15 * 60 * 1000,
  });

  const unit = (widget.weatherUnit || "celsius") as TemperatureUnit;
  const showCondition =
    widget.weatherShowCondition !== undefined ? widget.weatherShowCondition : true;
  const showFeelsLike =
    widget.weatherShowFeelsLike !== undefined ? widget.weatherShowFeelsLike : false;
  const showLocation =
    widget.weatherShowLocation !== undefined ? widget.weatherShowLocation : true;
  const showAtmosphericBackground =
    widget.weatherShowBackground !== undefined ? widget.weatherShowBackground : false;

  if (isLoading) {
    return <WidgetSkeleton imageShape="rounded" />;
  }

  if (!weather) {
    return <WidgetUnavailable imageShape="rounded" label="location" />;
  }

  const temperature = formatTemperature(weather.temperatureC, unit);
  const feelsLike = formatTemperature(weather.feelsLikeC, unit);

  const showFeelsLikeRow =
    showFeelsLike && Math.round(weather.feelsLikeC) !== Math.round(weather.temperatureC);

  const place = weather.country
    ? `${weather.location}, ${weather.country}`
    : weather.location;

  const title = showLocation ? place : temperature;

  const gradient = SKY_GRADIENTS[weather.icon] ?? SKY_GRADIENTS.cloudy;
  const skyClass = weather.isDay ? gradient.day : gradient.night;

  return (
    <div className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 flex items-center justify-between relative box-border">
      {showAtmosphericBackground && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-br ${skyClass}`} />
          <div className="absolute inset-0 bg-[#101010]/40 backdrop-blur-[1px]" />
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        <div className="relative w-[74px] h-[74px] shrink-0 flex items-center justify-center">
          <WeatherConditionIcon
            kind={weather.icon}
            isDay={weather.isDay}
            size={58}
            className="w-[58px] h-[58px]"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          <OverflowPingPong deps={[title, showLocation, unit]}>
            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
              {title}
            </span>
          </OverflowPingPong>

          <OverflowPingPong
            deps={[weather, unit, showCondition, showFeelsLikeRow, showLocation]}
          >
            <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
              {showLocation && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <WeatherTemperatureIcon
                    size={13}
                    className="w-[13px] h-[13px] shrink-0 text-white/50"
                  />
                  <span className="text-white/85">{temperature}</span>
                </div>
              )}

              {showFeelsLikeRow && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-white/40">Feels</span>
                  <span className="text-white/85">{feelsLike}</span>
                </div>
              )}

              {showCondition && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <WeatherConditionMarkerIcon
                    size={13}
                    className="w-[13px] h-[13px] shrink-0 text-white/50"
                  />
                  <span className="text-white/60">{weather.condition}</span>
                </div>
              )}

              {!showLocation && !showFeelsLikeRow && !showCondition && (
                <span className="text-white/40 shrink-0">{place}</span>
              )}
            </div>
          </OverflowPingPong>
        </div>
      </div>
    </div>
  );
}
