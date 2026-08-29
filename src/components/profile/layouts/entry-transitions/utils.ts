export { hexToRgba } from "@/lib/utils/color";

export function getBlurOverlayOpacity(blur: number, baseMaxOpacity = 70): number {
  if (blur <= 0) return 0;
  return (blur / 40) * baseMaxOpacity;
}
