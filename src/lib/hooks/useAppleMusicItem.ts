"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useState, useEffect } from "react";
import { type AppleMusicItemData, type AppleMusicItemType } from "@/lib/apple-music";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseAppleMusicItemReturn {
  data: AppleMusicItemData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAppleMusicItem(
  type: AppleMusicItemType,
  id: string | null | undefined
): UseAppleMusicItemReturn {
  const cleanId = (id || "").trim();
  const [data, setData] = useState<AppleMusicItemData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(cleanId));
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const { value: fetchKey, isPending } = useDebouncedValue(
    cleanId ? `${type}/${cleanId}` : ""
  );

  useEffect(() => {
    if (!fetchKey) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const separator = fetchKey.indexOf("/");
    const fetchType = fetchKey.slice(0, separator);
    const fetchId = fetchKey.slice(separator + 1);

    let isMounted = true;
    setData(null);
    setIsLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const res = await cachedFetch(
          `/api/widgets/apple-music/item/${encodeURIComponent(fetchType)}/${encodeURIComponent(fetchId)}`
        );
        const json = await res.json();

        if (!isMounted) return;

        if (res.ok && json.data) {
          setData(json.data);
          setError(null);
        } else {
          setData(null);
          setError(json.error || "Apple Music item not found");
        }
      } catch {
        if (!isMounted) return;
        setData(null);
        setError("Failed to fetch Apple Music item");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchKey, trigger]);

  return {
    data: isPending ? null : data,
    isLoading: isPending || isLoading,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
