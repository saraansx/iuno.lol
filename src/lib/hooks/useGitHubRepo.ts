"use client";

import { useEffect, useState } from "react";
import { type GitHubRepoData } from "@/app/api/widgets/github/repo/[owner]/[repo]/route";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export function useGitHubRepo(repoString: string) {
  const cleanRepo = (repoString || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  const parts = cleanRepo.split("/");
  const isValidRepo = parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]);

  // Debounced as one "owner/repo" string, so a half-typed pair never fires a
  // request. An incomplete value debounces to "" at once, clearing the preview.
  const { value: fetchRepo, isPending } = useDebouncedValue(isValidRepo ? cleanRepo : "");

  const [data, setData] = useState<GitHubRepoData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidRepo);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fetchRepo) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchRepoData = async () => {
      setData(null);
      setLoading(true);
      setError(null);

      try {
        const [owner, repo] = fetchRepo.split("/");
        const res = await fetch(
          `/api/widgets/github/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Failed to load GitHub repository");
        const json = (await res.json()) as GitHubRepoData;
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load GitHub repository"));
          setLoading(false);
        }
      }
    };

    fetchRepoData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchRepo]);

  // While the typed repo is ahead of the fetched one, report the loading state
  // instead of the repository the hook still holds.
  const isReady = isValidRepo && !isPending;

  return {
    data: isReady ? data : null,
    loading: isValidRepo && (isPending || loading),
    error: isReady ? error : null,
    isValidRepo,
    cleanRepo,
  };
}
