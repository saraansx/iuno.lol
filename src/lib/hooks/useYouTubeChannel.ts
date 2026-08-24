"use client";

import { useState, useEffect } from "react";
import { type YouTubeWidgetData, cleanYouTubeInput } from "@/lib/youtube";

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

  useEffect(() => {
    if (!cleanInput) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const res = await fetch(
          `/api/widgets/youtube/channel/${encodeURIComponent(cleanInput)}`
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
  }, [cleanInput, trigger]);

  return {
    data,
    loading,
    error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
