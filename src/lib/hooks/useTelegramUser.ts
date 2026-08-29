"use client";

import { useState, useEffect } from "react";
import { type TelegramUserData, cleanTelegramUsername } from "@/lib/telegram";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseTelegramUserReturn {
  user: TelegramUserData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTelegramUser(
  username: string | undefined | null,
  options: { enabled?: boolean } = {}
): UseTelegramUserReturn {
  const { enabled = true } = options;
  const [user, setUser] = useState<TelegramUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(username && enabled));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const cleanUsername = cleanTelegramUsername(username);

  const { value: fetchUsername, isPending } = useDebouncedValue(cleanUsername);

  useEffect(() => {
    if (!fetchUsername || !enabled) {
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
          `/api/widgets/telegram/user/${encodeURIComponent(fetchUsername)}`
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
          setError(data.error || "Profile not found");
        }
      } catch {
        if (!isMounted) return;
        setUser(null);
        setIsError(true);
        setError("Failed to fetch Telegram profile");
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
  }, [fetchUsername, enabled, trigger]);

  return {
    user: isPending ? null : user,
    isLoading: isPending || isLoading,
    isError: isPending ? false : isError,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
