"use client";

import { useSyncExternalStore } from "react";

export function shouldSkipHeavyFx(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  return reducedMotion || phone;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useHeavyFxAllowed(): boolean {
  return useSyncExternalStore(() => () => {}, () => !shouldSkipHeavyFx(), () => false);
}
