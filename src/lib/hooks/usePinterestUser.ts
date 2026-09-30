"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useEffect, useState } from "react";
import { type PinterestUserData } from "@/app/api/widgets/pinterest/user/[username]/route";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export function usePinterestUser(username: string) {
  const cleanUsername = (username || "").trim().toLowerCase();
  const isValidUsername = /^[a-zA-Z0-9_]{1,30}$/.test(cleanUsername);

  const { value: fetchUsername, isPending } = useDebouncedValue(
    isValidUsername ? cleanUsername : ""
  );

  const [data, setData] = useState<PinterestUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidUsername);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fetchUsername) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchUser = async () => {
      setData(null);
      setLoading(true);
      setError(null);

      try {
        const res = await cachedFetch(`/api/widgets/pinterest/user/${encodeURIComponent(fetchUsername)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load Pinterest user");
        const json = (await res.json()) as PinterestUserData;
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load Pinterest user"));
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchUsername]);

  const isReady = isValidUsername && !isPending;

  return {
    data: isReady ? data : null,
    loading: isValidUsername && (isPending || loading),
    error: isReady ? error : null,
    isValidUsername,
    cleanUsername,
  };
}
