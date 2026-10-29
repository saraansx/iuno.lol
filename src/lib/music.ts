export interface LyricLine {
  text: string;
  start: number;
  end: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  artwork: string | null;
  album?: string | null;
  duration?: number | null;
  streamUrl?: string | null;
  lyrics?: LyricLine[] | null;
}

export type MusicPlayerStyle = "compact" | "waveform" | "lyrics";

export const DEFAULT_MUSIC_CARD_COLOR = "#101010";

export function musicCardBackground(color?: string | null, opacity?: number | null): string {
  const hex = /^#[0-9a-f]{6}$/i.test(color ?? "") ? (color as string) : DEFAULT_MUSIC_CARD_COLOR;
  const alpha = typeof opacity === "number" && Number.isFinite(opacity) ? Math.min(100, Math.max(0, opacity)) / 100 : 1;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
