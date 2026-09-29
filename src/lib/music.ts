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
