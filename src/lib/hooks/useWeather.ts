"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useState, useEffect } from "react";
import { type WeatherData, cleanWeatherLocation } from "@/lib/weather";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseWeatherReturn {
  weather: WeatherData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeather(
  location: string | undefined | null,
  options: { enabled?: boolean; refetchInterval?: number } = {}
): UseWeatherReturn {
  const { enabled = true, refetchInterval } = options;
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(location && enabled));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const cleanLocation = cleanWeatherLocation(location);

  const { value: fetchLocation, isPending } = useDebouncedValue(cleanLocation);

  useEffect(() => {
    if (!fetchLocation || !enabled) {
      setWeather(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setWeather(null);
    setIsLoading(true);
    setIsError(false);
    setError(null);

    async function fetchData() {
      try {
        const res = await cachedFetch(
          `/api/widgets/weather/current/${encodeURIComponent(fetchLocation)}`
        );
        const data = await res.json();

        if (!isMounted) return;

        if (data.ok && data.data) {
          setWeather(data.data);
          setIsError(false);
          setError(null);
        } else {
          setWeather(null);
          setIsError(true);
          setError(data.error || "Location not found");
        }
      } catch {
        if (!isMounted) return;
        setWeather(null);
        setIsError(true);
        setError("Failed to fetch weather");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    // Skip polls while the tab is hidden; refresh once when the visitor comes back
    let timer: NodeJS.Timeout | undefined;
    const onVisible = () => {
      if (!document.hidden) fetchData();
    };
    if (refetchInterval && refetchInterval > 0) {
      timer = setInterval(() => {
        if (!document.hidden) fetchData();
      }, refetchInterval);
      document.addEventListener("visibilitychange", onVisible);
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchLocation, enabled, trigger, refetchInterval]);

  return {
    weather: isPending ? null : weather,
    isLoading: isPending || isLoading,
    isError: isPending ? false : isError,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
