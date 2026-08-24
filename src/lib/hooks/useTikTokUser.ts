"use client";

import { useState, useEffect } from "react";
import { type TikTokUserData, cleanTikTokUsername } from "@/lib/tiktok";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseTikTokUserReturn {
  data: TikTokUserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTikTokUser(rawUsername: string | null | undefined): UseTikTokUserReturn {
  const cleanUsername = rawUsername ? cleanTikTokUsername(rawUsername) : "";
  const [data, setData] = useState<TikTokUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(cleanUsername));
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  // Each miss hits the upstream TikTok scrape, so wait for typing to settle.
  const { value: fetchUsername, isPending } = useDebouncedValue(cleanUsername);

  useEffect(() => {
    if (!fetchUsername) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    // Drop the previous user's data immediately. Without this, `data` still
    // holds the old profile while the new fetch is in flight, so consumers
    // gated on `loading && !data` never show their loading state.
    setData(null);
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const res = await fetch(
          `/api/widgets/tiktok/user/${encodeURIComponent(fetchUsername)}`
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
        setError("Failed to fetch TikTok profile");
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
