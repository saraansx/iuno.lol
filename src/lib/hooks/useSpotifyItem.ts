"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useState, useEffect } from "react";
import type { SpotifyItemData } from "@/lib/spotify";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseSpotifyItemReturn {
  data: SpotifyItemData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSpotifyItem(
  type: string | undefined | null,
  id: string | undefined | null,
  options: { enabled?: boolean } = {}
): UseSpotifyItemReturn {
  const { enabled = true } = options;
  const [data, setData] = useState<SpotifyItemData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(type && id && enabled));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const cleanType = (type || "").toLowerCase().replace("spotify-", "");
  const cleanId = (id || "").trim();

  const { value: fetchKey, isPending } = useDebouncedValue(
    cleanType && cleanId ? `${cleanType}/${cleanId}` : ""
  );

  useEffect(() => {
    if (!fetchKey || !enabled) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    const separator = fetchKey.indexOf("/");
    const fetchType = fetchKey.slice(0, separator);
    const fetchId = fetchKey.slice(separator + 1);

    let isMounted = true;
    setData(null);
    setIsLoading(true);
    setIsError(false);
    setError(null);

    async function fetchData() {
      try {
        const res = await cachedFetch(
          `/api/widgets/spotify/item/${encodeURIComponent(fetchType)}/${encodeURIComponent(fetchId)}`
        );
        const json = await res.json();

        if (!isMounted) return;

        if (json.ok && json.data) {
          setData(json.data);
          setIsError(false);
          setError(null);
        } else {
          setData(null);
          setIsError(true);
          setError(json.error || "Spotify item not found");
        }
      } catch {
        if (!isMounted) return;
        setData(null);
        setIsError(true);
        setError("Failed to fetch Spotify item");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchKey, enabled, trigger]);

  return {
    data: isPending ? null : data,
    isLoading: isPending || isLoading,
    isError: isPending ? false : isError,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
