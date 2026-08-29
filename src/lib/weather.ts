
export type TemperatureUnit = "celsius" | "fahrenheit" | "both";

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
  location: string;
  country: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  icon: WeatherIconKind;
  isDay: boolean;
}

export function weatherIconForConditionId(id: number): WeatherIconKind {
  if (id >= 200 && id < 300) return "thunderstorm";
  if (id >= 300 && id < 400) return "drizzle";
  if (id >= 500 && id < 600) {
    return id === 511 ? "snow" : "rain";
  }
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "fog";
  if (id === 800) return "clear";
  if (id === 801 || id === 802) return "partly-cloudy";
  if (id === 803 || id === 804) return "cloudy";
  return "cloudy";
}

export function formatConditionText(description: string): string {
  const text = description.trim();
  if (!text) return "Unknown";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function countryNameFromCode(code: string): string {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export const WEATHER_LOCATION_PATTERN =
  /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9\s,.'’\-()]{1,79}$/u;

export const WEATHER_COORDS_PATTERN =
  /^(-?(?:[0-8]?\d(?:\.\d+)?|90(?:\.0+)?))\s*,\s*(-?(?:1[0-7]\d(?:\.\d+)?|[0-9]?\d(?:\.\d+)?|180(?:\.0+)?))$/;

export function cleanWeatherLocation(input: string | null | undefined): string {
  return (input || "").trim().replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
}

export function isValidWeatherLocation(input: string): boolean {
  return (
    WEATHER_COORDS_PATTERN.test(input) || WEATHER_LOCATION_PATTERN.test(input)
  );
}

export function parseWeatherCoords(
  input: string
): { latitude: number; longitude: number } | null {
  const match = WEATHER_COORDS_PATTERN.exec(input);
  if (!match) return null;
  return { latitude: Number(match[1]), longitude: Number(match[2]) };
}

export function toFahrenheit(celsius: number): number {
  return celsius * 9 / 5 + 32;
}

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

export const TEMPERATURE_UNIT_LABELS: Record<TemperatureUnit, string> = {
  celsius: "Celsius (°C)",
  fahrenheit: "Fahrenheit (°F)",
  both: "Both (°C / °F)",
};
