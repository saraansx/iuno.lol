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

/**
 * Current weather for a location, via OpenWeather.
 *
 * One upstream call per location: the Current Weather endpoint returns the
 * temperature, the condition, the resolved city name and the country together.
 *
 * The location can arrive as a place name — a city, optionally with state and/or
 * country ("Kolkata", "Vienna, Austria", "Springfield, IL, US") — or as a
 * `lat,lon` pair, which OpenWeather takes on different parameters, so the form is
 * detected before the call rather than after.
 *
 * Unlike the profile widgets this has no image proxy: the card's icon is an
 * inline SVG chosen from the condition ID, so no image is ever fetched.
 *
 * The reading is cached in Redis on a much shorter window than the profile
 * widgets — weather that is twelve hours stale is wrong, not merely dated. See
 * `WEATHER_CACHE_TTL_SECONDS` below.
 */

const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";

/**
 * How long a reading is served before refetching: 15 minutes.
 *
 * The shared 12h widget window is wrong for weather — a temperature from this
 * morning is simply incorrect by the afternoon. OpenWeather updates its station
 * data on a roughly 10-minute cycle, so refetching much faster than this would
 * return the same numbers while spending a call to learn that.
 *
 * It also keeps usage far inside the free tier: 15 minutes is 96 calls a day per
 * distinct location, no matter how many visitors are watching.
 */
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

/**
 * Builds the query parameters for `location`, choosing the parameter OpenWeather
 * expects for the form it is in.
 */
function buildLocationQuery(location: string): string {
  const coords = parseWeatherCoords(location);
  if (coords) {
    return `lat=${coords.latitude}&lon=${coords.longitude}`;
  }

  return `q=${encodeURIComponent(location)}`;
}

/**
 * Fetches current weather for `location`, which is a place name (optionally with
 * state and/or country) or a `lat,lon` pair. Returns null when the place cannot
 * be found.
 */
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

    // 404 is an unknown place, which is a normal outcome rather than a fault.
    // Anything else is worth a log line, but the key must never reach it.
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

    // The icon suffix is "d" or "n" for day or night at the location, which is
    // more reliable than comparing timestamps against sunrise/sunset ourselves.
    const isDay = condition?.icon ? condition.icon.endsWith("d") : true;

    const coords = parseWeatherCoords(location);

    return {
      // A coordinate lookup usually still resolves to a nearby place name; fall
      // back to the coordinates only when it does not.
      location:
        json.name ||
        (coords
          ? `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`
          : location),
      country: countryNameFromCode(json.sys?.country ?? ""),
      temperatureC: temperature,
      // `feels_like` is occasionally absent; the actual reading is the honest
      // fallback, and the card hides "feels like" when the two agree anyway.
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

    // The CF cache rule excludes this path from the shared 12h widget window, so
    // the TTL has to come from here. Mirrors WEATHER_CACHE_TTL_SECONDS above:
    // 15 minutes, matching the Redis window. `stale-while-revalidate` serves the
    // slightly-old reading instantly while the refetch happens behind it.
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
