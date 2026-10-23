"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useState, useEffect } from "react";
import {
  type SoundcloudTrackData,
  cleanSoundcloudTrackPath,
  isValidSoundcloudTrackPath,
} from "@/lib/soundcloud";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseSoundcloudTrackReturn {
  data: SoundcloudTrackData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSoundcloudTrack(
  rawPath: string | null | undefined
): UseSoundcloudTrackReturn {
  const cleaned = rawPath ? cleanSoundcloudTrackPath(rawPath) : "";
  const cleanPath = cleaned && isValidSoundcloudTrackPath(cleaned) ? cleaned : "";
  const [data, setData] = useState<SoundcloudTrackData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(cleanPath));
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const { value: fetchPath, isPending } = useDebouncedValue(cleanPath);

  useEffect(() => {
    if (!fetchPath) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setData(null);
    setLoading(true);
    setError(null);

    const [artist, slug] = fetchPath.split("/");

    async function fetchData() {
      try {
        const res = await cachedFetch(
          `/api/widgets/soundcloud/track/${encodeURIComponent(artist)}/${encodeURIComponent(slug)}`
        );
        const json = await res.json();

        if (!isMounted) return;

        if (res.ok && json.data) {
          setData(json.data);
          setError(null);
        } else {
          setData(null);
          setError(json.error || "Track not found");
        }
      } catch {
        if (!isMounted) return;
        setData(null);
        setError("Failed to fetch SoundCloud track");
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
  }, [fetchPath, trigger]);

  return {
    data: isPending ? null : data,
    loading: isPending || loading,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
