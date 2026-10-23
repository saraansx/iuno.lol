"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useState, useEffect } from "react";
import { type SoundcloudArtistData, cleanSoundcloudHandle } from "@/lib/soundcloud";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseSoundcloudArtistReturn {
  data: SoundcloudArtistData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSoundcloudArtist(
  rawHandle: string | null | undefined
): UseSoundcloudArtistReturn {
  const cleanHandle = rawHandle ? cleanSoundcloudHandle(rawHandle) : "";
  const [data, setData] = useState<SoundcloudArtistData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(cleanHandle));
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const { value: fetchHandle, isPending } = useDebouncedValue(cleanHandle);

  useEffect(() => {
    if (!fetchHandle) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setData(null);
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const res = await cachedFetch(
          `/api/widgets/soundcloud/artist/${encodeURIComponent(fetchHandle)}`
        );
        const json = await res.json();

        if (!isMounted) return;

        if (res.ok && json.data) {
          setData(json.data);
          setError(null);
        } else {
          setData(null);
          setError(json.error || "Artist not found");
        }
      } catch {
        if (!isMounted) return;
        setData(null);
        setError("Failed to fetch SoundCloud artist");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchHandle, trigger]);

  return {
    data: isPending ? null : data,
    loading: isPending || loading,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
