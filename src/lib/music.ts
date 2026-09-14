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

export type MusicPlayerStyle = "compact" | "vinyl" | "lyrics";

export function streamUrlForTrack(id: string): string {
  return `/api/music/stream/${encodeURIComponent(id)}?quality=320`;
}
