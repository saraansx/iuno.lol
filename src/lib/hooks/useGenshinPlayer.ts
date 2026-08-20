"use client";

import { useEffect, useState } from "react";
import { type GenshinPlayerData } from "@/lib/genshin";

export function useGenshinPlayer(uid: string) {
  const cleanUid = (uid || "").trim();
  const isValidUid = /^[1-9][0-9]{8,9}$/.test(cleanUid);

  const [data, setData] = useState<GenshinPlayerData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidUid);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isValidUid) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchPlayer = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/widgets/genshin/player/${encodeURIComponent(cleanUid)}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Failed to load Genshin Impact profile");
        const json = (await res.json()) as GenshinPlayerData;
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load Genshin profile"));
          setLoading(false);
        }
      }
    };

    fetchPlayer();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [cleanUid, isValidUid]);

  return {
    data: isValidUid ? data : null,
    loading: isValidUid ? loading : false,
    error: isValidUid ? error : null,
    isValidUid,
    cleanUid,
  };
}
