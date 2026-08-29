"use client";

import { useState, useEffect } from "react";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";
import { useDebouncedValue, WIDGET_DEBOUNCE_MS } from "./useDebouncedValue";

interface UseInstagramUserReturn {
  user: InstagramUserData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInstagramUser(
  username: string | undefined | null,
  options: { enabled?: boolean; refetchInterval?: number; debounceMs?: number } = {}
): UseInstagramUserReturn {
  const { enabled = true, refetchInterval, debounceMs = WIDGET_DEBOUNCE_MS } = options;
  const [user, setUser] = useState<InstagramUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(username && enabled));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const cleanUsername = cleanInstagramUsername(username || "").toLowerCase();

  const { value: fetchUsername, isPending } = useDebouncedValue(cleanUsername, debounceMs);

  useEffect(() => {
    if (!fetchUsername || !enabled) {
      setUser(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setUser(null);
    setIsLoading(true);
    setIsError(false);
    setError(null);

    async function fetchData() {
      try {
        const res = await fetch(
          `/api/widgets/instagram/user/${encodeURIComponent(fetchUsername)}`
        );
        const data = await res.json();

        if (!isMounted) return;

        if (data.ok && data.data) {
          setUser(data.data);
          setIsError(false);
          setError(null);
        } else {
          setUser(null);
          setIsError(true);
          setError(data.error || "Instagram user not found");
        }
      } catch {
        if (!isMounted) return;
        setUser(null);
        setIsError(true);
        setError("Failed to fetch Instagram profile");
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
  }, [fetchUsername, enabled, trigger, refetchInterval]);

  return {
    user: isPending ? null : user,
    isLoading: isPending || isLoading,
    isError: isPending ? false : isError,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
