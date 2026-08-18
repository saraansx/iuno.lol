"use client";

import { useEffect, useState } from "react";

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0, 1, 2, 3, 4
}

export function useGitHubContributions(username: string, enabled: boolean = true) {
  const cleanUsername = (username || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  const isValid = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(cleanUsername);

  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled && isValid);

  useEffect(() => {
    if (!enabled || !isValid) {
      setContributions([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchContributions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/widgets/github/contributions/${encodeURIComponent(cleanUsername)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load contributions");
        const json = await res.json();
        if (isMounted && Array.isArray(json?.contributions)) {
          setContributions(json.contributions);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) setLoading(false);
      }
    };

    fetchContributions();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [cleanUsername, isValid, enabled]);

  return { contributions, loading };
}
