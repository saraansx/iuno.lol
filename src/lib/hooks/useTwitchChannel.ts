"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useState, useEffect } from "react";
import type { TwitchChannelData } from "@/lib/twitch";
import { useDebouncedValue } from "./useDebouncedValue";

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

  const { value: fetchLogin, isPending } = useDebouncedValue(cleanLogin);

  useEffect(() => {
    if (!fetchLogin || !enabled) {
      setChannel(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setChannel(null);
    setIsLoading(true);
    setIsError(false);
    setError(null);

    async function fetchData() {
      try {
        const res = await cachedFetch(
          `/api/widgets/twitch/channel/${encodeURIComponent(fetchLogin)}`
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
      } catch {
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
  }, [fetchLogin, enabled, trigger, refetchInterval]);

  return {
    channel: isPending ? null : channel,
    isLoading: isPending || isLoading,
    isError: isPending ? false : isError,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
