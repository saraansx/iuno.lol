"use client";

import { useEffect, useState } from "react";

export const WIDGET_DEBOUNCE_MS = 600;

export function useDebouncedValue(
  value: string,
  delayMs: number = WIDGET_DEBOUNCE_MS
): { value: string; isPending: boolean } {
  const [settled, setSettled] = useState<string>(value);

  if (!value && settled) setSettled("");

  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return { value: settled, isPending: value !== settled };
}
