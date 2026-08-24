"use client";

import { useState, useEffect } from "react";
import { type YouTubeWidgetData, cleanYouTubeInput } from "@/lib/youtube";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseYouTubeChannelReturn {
  data: YouTubeWidgetData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useYouTubeChannel(
  rawInput: string | null | undefined
): UseYouTubeChannelReturn {
  const cleanInput = rawInput ? cleanYouTubeInput(rawInput) : "";
  const [data, setData] = useState<YouTubeWidgetData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(cleanInput));
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  // The YouTube Data API is quota-metered, so wait for typing to settle.
  const { value: fetchInput, isPending } = useDebouncedValue(cleanInput);

  useEffect(() => {
    if (!fetchInput) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    // Drop the previous channel's data immediately. Without this, `data` still
    // holds the old channel while the new fetch is in flight, so consumers
    // gated on `loading && !data` never show their loading state.
    setData(null);
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const res = await fetch(
          `/api/widgets/youtube/channel/${encodeURIComponent(fetchInput)}`
        );
        const json = await res.json();

        if (!isMounted) return;

        if (res.ok && json.data) {
          setData(json.data);
          setError(null);
        } else {
          setData(null);
          setError(json.error || "Channel not found");
        }
      } catch {
        if (!isMounted) return;
        setData(null);
        setError("Failed to fetch YouTube channel");
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
  }, [fetchInput, trigger]);

  return {
    data: isPending ? null : data,
    loading: isPending || loading,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
