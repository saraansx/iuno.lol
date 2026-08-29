"use client";

import { useEffect, useState } from "react";
import { type PinterestBoardData } from "@/app/api/widgets/pinterest/board/[username]/[board]/route";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export function usePinterestBoard(input: string) {
  const cleanInput = (input || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?pinterest\.[a-z.]+\//i, "")
    .replace(/\/$/, "");
  const parts = cleanInput.split("/").filter(Boolean);
  const isValidBoard = parts.length >= 2 && Boolean(parts[0]) && Boolean(parts[1]);

  const { value: fetchBoard, isPending } = useDebouncedValue(isValidBoard ? cleanInput : "");

  const [data, setData] = useState<PinterestBoardData | null>(null);
  const [loading, setLoading] = useState<boolean>(isValidBoard);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fetchBoard) {
      setData(null);
      setLoading(false);
      return;
    }

    const [user, board] = fetchBoard.split("/").filter(Boolean);
    let isMounted = true;
    const controller = new AbortController();

    const fetchBoardData = async () => {
      setData(null);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/widgets/pinterest/board/${encodeURIComponent(user)}/${encodeURIComponent(board)}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Failed to load Pinterest board");
        const json = (await res.json()) as PinterestBoardData;
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load Pinterest board"));
          setLoading(false);
        }
      }
    };

    fetchBoardData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchBoard]);

  const isReady = isValidBoard && !isPending;

  return {
    data: isReady ? data : null,
    loading: isValidBoard && (isPending || loading),
    error: isReady ? error : null,
    isValidBoard,
    cleanInput,
  };
}
