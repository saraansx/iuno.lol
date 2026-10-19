"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useState, useEffect } from "react";
import { type InstagramUserData, cleanInstagramUsername } from "@/lib/instagram";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseInstagramUserReturn {
  data: InstagramUserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInstagramUser(
  rawUsername: string | null | undefined
): UseInstagramUserReturn {
  const cleanUsername = rawUsername ? cleanInstagramUsername(rawUsername) : "";
  const [data, setData] = useState<InstagramUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(cleanUsername));
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const { value: fetchUsername, isPending } = useDebouncedValue(cleanUsername);

  useEffect(() => {
    if (!fetchUsername) {
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
          `/api/widgets/instagram/profile/${encodeURIComponent(fetchUsername)}`
        );
        const json = await res.json();

        if (!isMounted) return;

        if (res.ok && json.data) {
          setData(json.data);
          setError(null);
        } else {
          setData(null);
          setError(json.error || "User not found");
        }
      } catch {
        if (!isMounted) return;
        setData(null);
        setError("Failed to fetch Instagram profile");
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
  }, [fetchUsername, trigger]);

  return {
    data: isPending ? null : data,
    loading: isPending || loading,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
