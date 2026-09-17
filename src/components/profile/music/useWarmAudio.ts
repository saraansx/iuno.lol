"use client";

import { useEffect } from "react";

/**
 * Buffers audio files in the background while the page loads so the first
 * click plays instantly. Never autoplays — it only preloads bytes into the
 * browser's media cache (same URLs the player will request on play).
 */
export function useWarmAudio(urls: Array<string | null | undefined>) {
  const key = JSON.stringify(urls.filter(Boolean));
  useEffect(() => {
    const cleaners: Array<() => void> = [];
    try {
      const parsed: string[] = JSON.parse(key) as string[];
      for (const url of parsed) {
        try {
          const audio = new Audio(url);
          audio.preload = "auto";
          audio.load();
          cleaners.push(() => {
            try {
              audio.pause();
              audio.removeAttribute("src");
              audio.load();
            } catch {
              // ignore cleanup errors
            }
          });
        } catch {
          // ignore per-url warmup errors
        }
      }
    } catch {
      // ignore warmup errors
    }
    return () => {
      cleaners.forEach((fn) => fn());
    };
  }, [key]);
}
