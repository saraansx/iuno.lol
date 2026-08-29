"use client";

import { useState, useEffect } from "react";
import { type RobloxUserData, cleanRobloxInput } from "@/lib/roblox";
import { useDebouncedValue } from "./useDebouncedValue";

interface UseRobloxUserReturn {
  user: RobloxUserData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRobloxUser(
  input: string | undefined | null,
  options: { enabled?: boolean } = {}
): UseRobloxUserReturn {
  const { enabled = true } = options;
  const [user, setUser] = useState<RobloxUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(input && enabled));
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const cleanInput = cleanRobloxInput(input);

  const { value: fetchInput, isPending } = useDebouncedValue(cleanInput);

  useEffect(() => {
    if (!fetchInput || !enabled) {
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
          `/api/widgets/roblox/user/${encodeURIComponent(fetchInput)}`
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
        setError("Failed to fetch Roblox profile");
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
  }, [fetchInput, enabled, trigger]);

  return {
    user: isPending ? null : user,
    isLoading: isPending || isLoading,
    isError: isPending ? false : isError,
    error: isPending ? null : error,
    refetch: () => setTrigger((prev) => prev + 1),
  };
}
