"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useEffect, useState } from "react";
import { type ValorantPlayerData } from "@/app/api/widgets/valorant/player/[name]/[tag]/route";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export function useValorantPlayer(riotId: string) {
  const cleanInput = (riotId || "").trim();
  const parts = cleanInput.split("#");
  const isValidRiotId = parts.length === 2 && parts[0].length >= 3 && parts[1].length >= 3;

  const { value: fetchRiotId, isPending } = useDebouncedValue(isValidRiotId ? cleanInput : "");

  const [data, setData] = useState<ValorantPlayerData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidRiotId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fetchRiotId) {
      setData(null);
      setLoading(false);
      return;
    }

    const [name, tag] = fetchRiotId.split("#");
    let isMounted = true;
    const controller = new AbortController();

    const fetchPlayer = async () => {
      setData(null);
      setLoading(true);
      setError(null);

      try {
        const res = await cachedFetch(
          `/api/widgets/valorant/player/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to load Valorant player data");
        const json = (await res.json()) as ValorantPlayerData;
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load Valorant player data"));
          setLoading(false);
        }
      }
    };

    fetchPlayer();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchRiotId]);

  const isReady = isValidRiotId && !isPending;

  return {
    data: isReady ? data : null,
    loading: isValidRiotId && (isPending || loading),
    error: isReady ? error : null,
    isValidRiotId,
    cleanInput,
  };
}
