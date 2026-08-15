export function hexToRgba(hex: string | undefined, opacity: number): string {
  if (!hex) return `rgba(0, 0, 0, ${opacity / 100})`;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity / 100))})`;
  }
  if (clean.length !== 6) return `rgba(0, 0, 0, ${opacity / 100})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity / 100))})`;
}

/**
 * Computes overlay background opacity based on blur intensity (0 to 40px)
 */
export function getBlurOverlayOpacity(blur: number, baseMaxOpacity = 70): number {
  if (blur <= 0) return 0;
  // Scale opacity proportionally with blur intensity: 0px -> 0%, 40px -> baseMaxOpacity%
  return (blur / 40) * baseMaxOpacity;
}
