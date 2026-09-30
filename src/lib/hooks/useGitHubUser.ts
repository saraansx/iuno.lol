"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useEffect, useState } from "react";
import { type GitHubUserData } from "@/app/api/widgets/github/user/[username]/route";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export function useGitHubUser(username: string) {
  const cleanUsername = (username || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  const isValidUser = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(cleanUsername);

  const { value: fetchUsername, isPending } = useDebouncedValue(isValidUser ? cleanUsername : "");

  const [data, setData] = useState<GitHubUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidUser);
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
        const res = await cachedFetch(`/api/widgets/github/user/${encodeURIComponent(fetchUsername)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load GitHub user");
        const json = (await res.json()) as GitHubUserData;
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load GitHub user"));
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

  const isReady = isValidUser && !isPending;

  return {
    data: isReady ? data : null,
    loading: isValidUser && (isPending || loading),
    error: isReady ? error : null,
    isValidUser,
    cleanUsername,
  };
}
