"use client";

import { useEffect, useState } from "react";
import { type GitHubRepoData } from "@/app/api/widgets/github/repo/[owner]/[repo]/route";

export function useGitHubRepo(repoString: string) {
  const cleanRepo = (repoString || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  const parts = cleanRepo.split("/");
  const isValidRepo = parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]);

  const [data, setData] = useState<GitHubRepoData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidRepo);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isValidRepo) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchRepo = async () => {
      setData(null);
      setLoading(true);
      setError(null);

      try {
        const [owner, repo] = cleanRepo.split("/");
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

    fetchRepo();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [cleanRepo, isValidRepo]);

  return {
    data: isValidRepo ? data : null,
    loading: isValidRepo ? loading : false,
    error: isValidRepo ? error : null,
    isValidRepo,
    cleanRepo,
  };
}
