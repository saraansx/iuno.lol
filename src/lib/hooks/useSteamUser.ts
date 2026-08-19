"use client";

import { useEffect, useState } from "react";
import { type SteamUserData } from "@/app/api/widgets/steam/user/[id]/route";

export function useSteamUser(input: string) {
  const cleanInput = (input || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "")
    .replace(/\/$/, "");

  const isValidId = Boolean(cleanInput);

  const [data, setData] = useState<SteamUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isValidId) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/widgets/steam/user/${encodeURIComponent(cleanInput)}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Failed to load Steam profile");
        const json = (await res.json()) as SteamUserData;
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load Steam profile"));
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [cleanInput, isValidId]);

  return {
    data: isValidId ? data : null,
    loading: isValidId ? loading : false,
    error: isValidId ? error : null,
    isValidId,
    cleanInput,
  };
}
