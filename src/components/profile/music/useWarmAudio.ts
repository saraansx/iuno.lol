"use client";

import { useEffect } from "react";

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
            }
          });
        } catch {
        }
      }
    } catch {
    }
    return () => {
      cleaners.forEach((fn) => fn());
    };
  }, [key]);
}
