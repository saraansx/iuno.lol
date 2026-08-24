"use client";

import { useEffect, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

export interface ContributionDay {
  level: number; // 0, 1, 2, 3, 4
}

// A shared empty array keeps the pending return referentially stable, so
// consumers using `contributions` in a dependency list don't re-run per render.
const NO_DAYS: ContributionDay[] = [];

const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function useGitHubContributions(username: string, enabled: boolean = true) {
  const cleanUsername = (username || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  const isValid = USERNAME_PATTERN.test(cleanUsername);

  // Each miss hits the GitHub GraphQL API, so wait for typing to settle. An
  // invalid username debounces to "" at once, clearing the heatmap immediately.
  const { value: fetchUsername, isPending } = useDebouncedValue(isValid ? cleanUsername : "");

  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled && isValid);

  useEffect(() => {
    if (!enabled || !fetchUsername) {
      setContributions([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    // Drop the previous user's squares so the heatmap never renders one
    // account's contributions under another account's name.
    setContributions([]);

    const fetchContributions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/widgets/github/contributions/${encodeURIComponent(fetchUsername)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load contributions");
        const json = await res.json();
        if (isMounted) {
          // Resolve loading regardless of the payload shape. Gating it on a
          // well-formed response would leave the heatmap on its skeleton for
          // good if the body ever came back without the array.
          if (Array.isArray(json?.contributions)) setContributions(json.contributions);
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
  }, [fetchUsername, enabled]);

  return {
    contributions: isPending ? NO_DAYS : contributions,
    loading: isPending || loading,
  };
}
