import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safePage(page: number) {
  return Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
}

export function hexToRgb(hex: string, fallback = "255, 255, 255") {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map(c => c + c).join("");
  }
  if (clean.length !== 6) return fallback;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
