"use client";

import { useEffect, useState } from "react";
import { type GitHubUserData } from "@/app/api/widgets/github/user/[username]/route";

export function useGitHubUser(username: string) {
  const cleanUsername = (username || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  const isValidUser = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(cleanUsername);

  const [data, setData] = useState<GitHubUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidUser);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isValidUser) {
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
        const res = await fetch(`/api/widgets/github/user/${encodeURIComponent(cleanUsername)}`, {
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
  }, [cleanUsername, isValidUser]);

  return {
    data: isValidUser ? data : null,
    loading: isValidUser ? loading : false,
    error: isValidUser ? error : null,
    isValidUser,
    cleanUsername,
  };
}
