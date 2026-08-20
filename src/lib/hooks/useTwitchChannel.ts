"use client";

import { useState, useEffect } from "react";
import type { TwitchChannelData } from "@/lib/twitch";

interface UseTwitchChannelReturn {
  channel: TwitchChannelData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTwitchChannel(
  login: string | undefined | null,
  options: { enabled?: boolean; refetchInterval?: number } = {}
): UseTwitchChannelReturn {
  const { enabled = true, refetchInterval } = options;
  const [channel, setChannel] = useState<TwitchChannelData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(login && enabled));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const cleanLogin = (login || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
    .replace(/\/$/, "");

  useEffect(() => {
    if (!cleanLogin || !enabled) {
      setChannel(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);
    setError(null);

    async function fetchData() {
      try {
        const res = await fetch(
          `/api/widgets/twitch/channel/${encodeURIComponent(cleanLogin)}`
        );
        const data = await res.json();

        if (!isMounted) return;

        if (data.ok && data.data) {
          setChannel(data.data);
          setIsError(false);
          setError(null);
        } else {
          setChannel(null);
          setIsError(true);
          setError(data.error || "Channel not found");
        }
      } catch (err) {
        if (!isMounted) return;
        setChannel(null);
        setIsError(true);
        setError("Failed to fetch Twitch channel");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    let timer: NodeJS.Timeout | undefined;
    if (refetchInterval && refetchInterval > 0) {
      timer = setInterval(fetchData, refetchInterval);
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [cleanLogin, enabled, trigger, refetchInterval]);

  return {
    channel,
    isLoading,
    isError,
    error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
