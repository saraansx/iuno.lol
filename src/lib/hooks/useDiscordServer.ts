"use client";

import { useEffect, useState } from "react";
import { type DiscordServerData } from "@/app/api/widgets/discord/invite/[code]/route";

export function useDiscordServer(inviteCode: string) {
  const cleanCode = (inviteCode || "").trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "");
  const isValidCode = cleanCode.length >= 2;

  const [data, setData] = useState<DiscordServerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isValidCode) return;

    let isMounted = true;
    const controller = new AbortController();

    // Async data fetch without synchronous setState in effect body
    const fetchServer = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/widgets/discord/invite/${encodeURIComponent(cleanCode)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load server data");
        const json = (await res.json()) as DiscordServerData;
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load server data"));
          setLoading(false);
        }
      }
    };

    fetchServer();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [cleanCode, isValidCode]);

  return {
    data: isValidCode ? data : null,
    loading: isValidCode ? loading : false,
    error: isValidCode ? error : null,
    isValidCode,
    cleanCode,
  };
}
