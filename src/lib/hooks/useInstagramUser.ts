"use client";

import { useState, useEffect } from "react";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";

interface UseInstagramUserReturn {
  user: InstagramUserData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInstagramUser(
  username: string | undefined | null,
  options: { enabled?: boolean; refetchInterval?: number } = {}
): UseInstagramUserReturn {
  const { enabled = true, refetchInterval } = options;
  const [user, setUser] = useState<InstagramUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(username && enabled));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const cleanUsername = cleanInstagramUsername(username || "").toLowerCase();

  useEffect(() => {
    if (!cleanUsername || !enabled) {
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
          `/api/widgets/instagram/user/${encodeURIComponent(cleanUsername)}`
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
  }, [cleanUsername, enabled, trigger, refetchInterval]);

  return {
    user,
    isLoading,
    isError,
    error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
