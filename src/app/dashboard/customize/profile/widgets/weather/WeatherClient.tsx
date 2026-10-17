"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useWeather } from "@/lib/hooks/useWeather";
import {
  type TemperatureUnit,
  cleanWeatherLocation,
  formatTemperature,
  isValidWeatherLocation,
} from "@/lib/weather";
import SaveBar from "@/components/dashboard/SaveBar";
import WeatherCustomization from "@/components/dashboard/customize/widgets/weather/WeatherCustomization";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";
import {
  WeatherConditionIcon,
  WeatherConditionMarkerIcon,
  WeatherTemperatureIcon,
} from "@/components/profile/widgets/WidgetIcons";
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";
import { toast } from "sonner";

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

export default function WeatherClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetIdParam = searchParams.get("widgetId");
  const idParam = searchParams.get("id") || "";

  const existingWidgets = useMemo(
    () => ((user?.widgets as WidgetItem[]) || []),
    [user?.widgets]
  );

  const existingWidget = useMemo(
    () =>
      widgetIdParam
        ? existingWidgets.find((w) => w.id === widgetIdParam)
        : undefined,
    [existingWidgets, widgetIdParam]
  );

  const isEditing = Boolean(widgetIdParam && existingWidget);

  const initialTargetId = existingWidget?.targetId || idParam || "";
  const initialPlacement = (existingWidget?.placement || "inside") as "inside" | "outside";
  const initialUnit = (existingWidget?.weatherUnit || "celsius") as TemperatureUnit;
  const initialShowCondition = existingWidget?.weatherShowCondition !== undefined ? existingWidget.weatherShowCondition : true;
  const initialShowFeelsLike = existingWidget?.weatherShowFeelsLike !== undefined ? existingWidget.weatherShowFeelsLike : false;
  const initialShowLocation = existingWidget?.weatherShowLocation !== undefined ? existingWidget.weatherShowLocation : true;
  const initialShowBackground = existingWidget?.weatherShowBackground !== undefined ? existingWidget.weatherShowBackground : false;

  const [locationInput, setLocationInput] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [unit, setUnit] = useState<TemperatureUnit>(initialUnit);
  const [showCondition, setShowCondition] = useState<boolean>(initialShowCondition);
  const [showFeelsLike, setShowFeelsLike] = useState<boolean>(initialShowFeelsLike);
  const [showLocation, setShowLocation] = useState<boolean>(initialShowLocation);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);

  const [, startTransition] = useTransition();

  const cleanLocation = cleanWeatherLocation(locationInput);
  const isValidLocation = isValidWeatherLocation(cleanLocation);

  const { weather, isLoading: loadingPreview } = useWeather(cleanLocation, {
    enabled: isValidLocation,
  });

  const isChanged =
    !isEditing ||
    cleanLocation !== initialTargetId ||
    placement !== initialPlacement ||
    unit !== initialUnit ||
    showCondition !== initialShowCondition ||
    showFeelsLike !== initialShowFeelsLike ||
    showLocation !== initialShowLocation ||
    showBackground !== initialShowBackground;

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidLocation) {
      toast.error(
        "Please enter a valid location (a city name, optionally with state and country, or 'lat,lon' coordinates)"
      );
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      targetId: cleanLocation,
      placement,
      weatherUnit: unit,
      weatherShowCondition: showCondition,
      weatherShowFeelsLike: showFeelsLike,
      weatherShowLocation: showLocation,
      weatherShowBackground: showBackground,
    };

    if (isEditing && widgetIdParam) {
      updated = existingList.map((w) =>
        w.id === widgetIdParam ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "weather",
        type: "weather-current",
        targetId: cleanLocation,
        useLinked: false,
        enabled: true,
        placement,
        weatherUnit: unit,
        weatherShowCondition: showCondition,
        weatherShowFeelsLike: showFeelsLike,
        weatherShowLocation: showLocation,
        weatherShowBackground: showBackground,
      };
      updated = [newWidget, ...existingList];
    }

    startTransition(async () => {
      try {
        const res = await updateProfileWidgets({
          widgets: updated,
        });
        if (res?.success) {
          toast.success(isEditing ? "Widget saved successfully" : "Widget added successfully");
          router.push("/dashboard/customize/profile/widgets");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save widget");
      }
    });
  };

  const handleRevert = () => {
    if (isEditing) {
      setLocationInput(initialTargetId);
      setPlacement(initialPlacement);
      setUnit(initialUnit);
      setShowCondition(initialShowCondition);
      setShowFeelsLike(initialShowFeelsLike);
      setShowLocation(initialShowLocation);
      setShowBackground(initialShowBackground);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const temperature = weather ? formatTemperature(weather.temperatureC, unit) : "";
  const feelsLike = weather ? formatTemperature(weather.feelsLikeC, unit) : "";
  const showFeelsLikeRow =
    Boolean(weather) &&
    showFeelsLike &&
    Math.round(weather!.feelsLikeC) !== Math.round(weather!.temperatureC);

  const place = weather
    ? weather.country
      ? `${weather.location}, ${weather.country}`
      : weather.location
    : "";
  const title = showLocation ? place : temperature;

  const gradient = weather
    ? SKY_GRADIENTS[weather.icon] ?? SKY_GRADIENTS.cloudy
    : SKY_GRADIENTS.cloudy;
  const skyClass = weather?.isDay ? gradient.day : gradient.night;

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Location</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which place this widget should show the weather for.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">City or coordinates</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. Vienna, Austria"
                  maxLength={80}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                A city name, optionally with state and country (e.g. &apos;Vienna, Austria&apos;
                or &apos;Springfield, IL, US&apos;), or &apos;lat,lon&apos; coordinates.
              </p>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-4 sm:p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!isValidLocation ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a location to see live preview
                  </span>
                </div>
              ) : loadingPreview && !weather ? (
                <WidgetSkeleton imageShape="rounded" />
              ) : !weather ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Location not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find weather for &quot;{cleanLocation}&quot;.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 flex items-center justify-between relative box-border">
                  {showBackground && (
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
              )}
            </div>
          </div>
        </div>

        <WeatherCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          unit={unit}
          onUnitChange={setUnit}
          showCondition={showCondition}
          onShowConditionChange={setShowCondition}
          showFeelsLike={showFeelsLike}
          onShowFeelsLikeChange={setShowFeelsLike}
          showLocation={showLocation}
          onShowLocationChange={setShowLocation}
          showBackground={showBackground}
          onShowBackgroundChange={setShowBackground}
        />
      </div>

      <SaveBar
        show={isChanged}
        onSave={handleSaveWidgetConfirm}
        onRevert={handleRevert}
      />
    </>
  );
}
