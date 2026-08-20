"use client";

import { useState, useEffect } from "react";
import type { SpotifyItemData } from "@/lib/spotify";

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

  useEffect(() => {
    if (!cleanType || !cleanId || !enabled) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setData(null);
    setIsLoading(true);
    setIsError(false);
    setError(null);

    async function fetchData() {
      try {
        const res = await fetch(
          `/api/widgets/spotify/item/${encodeURIComponent(cleanType)}/${encodeURIComponent(cleanId)}`
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
  }, [cleanType, cleanId, enabled, trigger]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
