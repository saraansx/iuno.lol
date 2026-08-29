import { NextRequest, NextResponse } from "next/server";
import { withWidgetCache, widgetCacheKey } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import {
  type WeatherData,
  cleanWeatherLocation,
  countryNameFromCode,
  formatConditionText,
  isValidWeatherLocation,
  parseWeatherCoords,
  weatherIconForConditionId,
} from "@/lib/weather";

const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";

const WEATHER_CACHE_TTL_SECONDS = 15 * 60;

const REQUEST_HEADERS = {
  "User-Agent": "iuno-weather-widget/1.0 (+https://iuno.lol)",
  Accept: "application/json",
} as const;

interface OpenWeatherResponse {
  name?: string;
  dt?: number;
  main?: { temp?: number; feels_like?: number };
  weather?: Array<{ id?: number; description?: string; icon?: string }>;
  sys?: { country?: string };
}

function buildLocationQuery(location: string): string {
  const coords = parseWeatherCoords(location);
  if (coords) {
    return `lat=${coords.latitude}&lon=${coords.longitude}`;
  }

  return `q=${encodeURIComponent(location)}`;
}

export async function fetchWeatherData(
  location: string
): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("[Weather] OPENWEATHER_API_KEY is not set");
    return null;
  }

  try {
    const res = await fetch(
      `${WEATHER_API}?${buildLocationQuery(location)}&units=metric&appid=${apiKey}`,
      {
        headers: REQUEST_HEADERS,
        cache: "no-store",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );

    if (!res.ok) {
      await res.body?.cancel();
      if (res.status !== 404) {
        console.error("[Weather] Upstream returned", res.status);
      }
      return null;
    }

    const json = (await res.json()) as OpenWeatherResponse;

    const temperature = json.main?.temp;
    if (typeof temperature !== "number") return null;

    const condition = json.weather?.[0];
    const conditionId = condition?.id ?? 0;

    const isDay = condition?.icon ? condition.icon.endsWith("d") : true;

    const coords = parseWeatherCoords(location);

    return {
      location:
        json.name ||
        (coords
          ? `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`
          : location),
      country: countryNameFromCode(json.sys?.country ?? ""),
      temperatureC: temperature,
      feelsLikeC:
        typeof json.main?.feels_like === "number"
          ? json.main.feels_like
          : temperature,
      condition: formatConditionText(condition?.description ?? ""),
      icon: weatherIconForConditionId(conditionId),
      isDay,
    };
  } catch (err) {
    console.error("[Weather Fetch Error]", err);
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ location: string }> }
) {
  try {
    const { location } = await params;
    const cleanLocation = cleanWeatherLocation(decodeURIComponent(location));

    if (!isValidWeatherLocation(cleanLocation)) {
      return NextResponse.json(
        { ok: false, error: "Invalid location" },
        { status: 400 }
      );
    }

    const data = await withWidgetCache<WeatherData>(
      widgetCacheKey("weather", "current", cleanLocation),
      () => fetchWeatherData(cleanLocation),
      WEATHER_CACHE_TTL_SECONDS
    );

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": `public, max-age=${WEATHER_CACHE_TTL_SECONDS}, s-maxage=${WEATHER_CACHE_TTL_SECONDS}, stale-while-revalidate=${WEATHER_CACHE_TTL_SECONDS}`,
        },
      }
    );
  } catch (err) {
    console.error("[Weather API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
