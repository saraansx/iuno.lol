"use client";

import { useEffect, useState } from "react";
import { type DiscordServerData } from "@/app/api/widgets/discord/invite/[code]/route";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export function useDiscordServer(inviteCode: string) {
  const cleanCode = (inviteCode || "").trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "");
  const isValidCode = cleanCode.length >= 2;

  const { value: fetchCode, isPending } = useDebouncedValue(isValidCode ? cleanCode : "");

  const [data, setData] = useState<DiscordServerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fetchCode) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchServer = async () => {
      setData(null);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/widgets/discord/invite/${encodeURIComponent(fetchCode)}`, {
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
  }, [fetchCode]);

  const isReady = isValidCode && !isPending;

  return {
    data: isReady ? data : null,
    loading: isValidCode && (isPending || loading),
    error: isReady ? error : null,
    isValidCode,
    cleanCode,
  };
}
