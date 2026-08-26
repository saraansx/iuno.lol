/**
 * Shared types and helpers for the Weather widget.
 *
 * Weather is the one widget with no account behind it — the target is a place,
 * not a profile — so this carries the location parsing the client and server
 * both need, plus the WMO weather-code table that turns Open-Meteo's numeric
 * code into the text and icon the card renders.
 *
 * Temperatures are always stored and cached in Celsius and converted at render
 * time. Fetching per-unit would mean three cache entries per location for what
 * is the same reading.
 */

export type TemperatureUnit = "celsius" | "fahrenheit" | "both";

/** Icon family a weather code belongs to. Keeps the card's icon set small. */
export type WeatherIconKind =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm";

export interface WeatherData {
  /** Resolved place name, e.g. "Kolkata". */
  location: string;
  /** Country name, or empty when the lookup was by coordinates. */
  country: string;
  /** Actual temperature in Celsius. */
  temperatureC: number;
  /** Perceived ("feels like") temperature in Celsius. */
  feelsLikeC: number;
  /** Human-readable condition, e.g. "Light rain shower". */
  condition: string;
  /** Icon family for `condition`. */
  icon: WeatherIconKind;
  /** True when it is daytime at the location — drives the day/night icon and gradient. */
  isDay: boolean;
}

/**
 * Maps an OpenWeather condition ID to an icon family.
 *
 * OpenWeather groups its IDs by hundred — 2xx thunderstorm, 3xx drizzle, 5xx
 * rain, 6xx snow, 7xx atmospheric (mist, haze, dust), 8xx clear and cloud cover
 * — so this is a range check rather than a per-code table. Only the 80x band
 * needs individual treatment, since "few clouds" and "overcast" are the same
 * hundred but different pictures.
 *
 * Anything unrecognised falls back to cloudy, which is the least wrong thing to
 * show for a reading we cannot interpret.
 */
export function weatherIconForConditionId(id: number): WeatherIconKind {
  if (id >= 200 && id < 300) return "thunderstorm";
  if (id >= 300 && id < 400) return "drizzle";
  if (id >= 500 && id < 600) {
    // 511 is freezing rain, which reads better as snow than as rain.
    return id === 511 ? "snow" : "rain";
  }
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "fog";
  if (id === 800) return "clear";
  // 801 few clouds, 802 scattered — still mostly sky. 803/804 are overcast.
  if (id === 801 || id === 802) return "partly-cloudy";
  if (id === 803 || id === 804) return "cloudy";
  return "cloudy";
}

/**
 * Capitalises OpenWeather's condition text for display.
 *
 * The API returns it lowercase ("moderate rain"), and the card shows it as a
 * standalone label where a leading capital is expected.
 */
export function formatConditionText(description: string): string {
  const text = description.trim();
  if (!text) return "Unknown";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Resolves an ISO country code to its English name.
 *
 * OpenWeather returns the code ("IN"), but the card shows the country beside the
 * city ("Kolkata, India"). `Intl.DisplayNames` is built into Node and every
 * browser we target, so this needs no country table. An unknown code is returned
 * as-is rather than dropped, since a code is still more use than nothing.
 */
export function countryNameFromCode(code: string): string {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Location input: a city name, optionally with state and/or country, or a
 * `lat,lon` pair.
 *
 * Deliberately permissive on the character set — place names carry accents,
 * apostrophes ("Coeur d'Alene"), periods ("St. Louis") and hyphens
 * ("Aix-en-Provence"), and rejecting those would refuse real cities. Length is
 * what is actually bounded.
 */
export const WEATHER_LOCATION_PATTERN =
  /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9\s,.'’\-()]{1,79}$/u;

/** A bare `lat,lon` pair, which skips geocoding and queries the forecast directly. */
export const WEATHER_COORDS_PATTERN =
  /^(-?(?:[0-8]?\d(?:\.\d+)?|90(?:\.0+)?))\s*,\s*(-?(?:1[0-7]\d(?:\.\d+)?|[0-9]?\d(?:\.\d+)?|180(?:\.0+)?))$/;

/** Collapses whitespace so " Vienna ,  Austria " and "Vienna, Austria" share a cache key. */
export function cleanWeatherLocation(input: string | null | undefined): string {
  return (input || "").trim().replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
}

/** True when `input` is usable as a location. */
export function isValidWeatherLocation(input: string): boolean {
  return (
    WEATHER_COORDS_PATTERN.test(input) || WEATHER_LOCATION_PATTERN.test(input)
  );
}

/** Parses a `lat,lon` string, or null when `input` is not a coordinate pair. */
export function parseWeatherCoords(
  input: string
): { latitude: number; longitude: number } | null {
  const match = WEATHER_COORDS_PATTERN.exec(input);
  if (!match) return null;
  return { latitude: Number(match[1]), longitude: Number(match[2]) };
}


/** Celsius to Fahrenheit. */
export function toFahrenheit(celsius: number): number {
  return celsius * 9 / 5 + 32;
}

/**
 * Renders a Celsius reading in the unit the widget is configured for.
 *
 * Rounded to whole degrees — the card has one line for this, and a tenth of a
 * degree is noise at this size.
 */
export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit
): string {
  const c = `${Math.round(celsius)}°C`;
  const f = `${Math.round(toFahrenheit(celsius))}°F`;

  if (unit === "celsius") return c;
  if (unit === "fahrenheit") return f;
  return `${c} / ${f}`;
}

/** Label for the temperature-unit dropdown. */
export const TEMPERATURE_UNIT_LABELS: Record<TemperatureUnit, string> = {
  celsius: "Celsius (°C)",
  fahrenheit: "Fahrenheit (°F)",
  both: "Both (°C / °F)",
};
