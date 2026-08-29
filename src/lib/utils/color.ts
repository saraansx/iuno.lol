export function hexToRgba(
  hex: string | null | undefined,
  opacity: number,
  fallback = "0, 0, 0"
): string {
  const alpha = Math.max(0, Math.min(1, opacity / 100));
  if (!hex) return `rgba(${fallback}, ${alpha})`;

  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return `rgba(${fallback}, ${alpha})`;

  const int = parseInt(clean, 16);
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
}
