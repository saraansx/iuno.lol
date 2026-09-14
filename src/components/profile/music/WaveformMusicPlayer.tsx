"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type MusicTrack } from "@/lib/music";
import { isCatboxUrl } from "@/lib/catbox";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Stable organic wave shape per track — layered sines + slight noise. */
export function seedHeights(key: string, n: number): number[] {
  let h = 2166136261;
  for (let k = 0; k < key.length; k++) {
    h ^= key.charCodeAt(k) ?? 0;
    h = Math.imul(h, 16777619);
  }
  const rnd = () => {
    h = (Math.imul(h ^ Math.imul(1, 2654435761), 2246822519) >>> 0);
    return ((h >>> 8) % 1000) / 1000;
  };
  const p1 = rnd() * Math.PI * 2;
  const p2 = rnd() * Math.PI * 2;
  const p3 = rnd() * Math.PI * 2;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    // beating lows = irregular loud/quiet sections (no repeating humps)
    const env = 0.62 + 0.38 * Math.sin(i * 0.083 + p1) * Math.sin(i * 0.057 + p2);
    const det = 0.8 + 0.2 * Math.sin(i * 0.83 + p3);
    // tapered song ends
    const edge = Math.min(1, i / 10, (n - 1 - i) / 10);
    const v = (58 * env * det + (rnd() * 12 - 6)) * (0.35 + 0.65 * Math.max(0, edge));
    out.push(Math.min(96, Math.max(8, Math.round(v))));
  }
  return out;
}

const BAR_COUNT = 110;

export default function WaveformMusicPlayer({ tracks, autoPlay = false, artBg = true }: { tracks: MusicTrack[]; autoPlay?: boolean; artBg?: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoNextRef = useRef(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const seekFromClientX = (clientX: number) => {
    const el = barRef.current;
    const audio = audioRef.current;
    const total = audio?.duration && Number.isFinite(audio.duration) ? audio.duration : duration;
    if (!el || !audio || !total) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(1, rect.width)));
    try { audio.currentTime = frac * total; } catch {}
    setElapsed(frac * total);
  };

  const track = tracks[Math.min(index, tracks.length - 1)] ?? null;
  const heights = useMemo(() => seedHeights(track?.id ?? "x", BAR_COUNT), [track?.id]);

  // stop audio on unmount only (plain <Audio>, no Web Audio routing — see CompactMusicPlayer)
  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const ensureAndPlay = useCallback((): Promise<void> | undefined => {
    const existing = audioRef.current;
    if (existing) {
      if (!existing.paused) return undefined;
      setLoading(true);
      return existing.play().catch(() => { setLoading(false); });
    }
    const t = tracks[Math.min(index, tracks.length - 1)] ?? null;
    if (!t) return undefined;
    // Main page plays ONLY from saved (Catbox) files — no upstream fallback.
    const url = isCatboxUrl(t.streamUrl) ? (t.streamUrl as string) : null;
    if (!url) {
      setLoading(false);
      return undefined;
    }
    const audio = new Audio(url);
    audio.preload = "auto";
    audioRef.current = audio;
    setLoading(true);
    setElapsed(0);
    const onTime = () => setElapsed(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
    };
    const onPause = () => {
      setPlaying(false);
    };
    const onEnded = () => {
      // loop: single track repeats, playlist wraps to first after last
      audioRef.current = null;
      setElapsed(0);
      setDuration(0);
      setPlaying(false);
      setLoading(false);
      autoNextRef.current = true;
      setIndex(index < tracks.length - 1 ? index + 1 : 0);
    };
    const onError = () => {
      audioRef.current = null;
      setLoading(false);
      setPlaying(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return audio.play().catch(() => { onError(); });
  }, [index, tracks]);

  // continue into the next track after auto-advance
  useEffect(() => {
    if (autoNextRef.current) {
      autoNextRef.current = false;
      ensureAndPlay()?.catch(() => {});
    }
  }, [index, ensureAndPlay]);

  // autoplay: try immediately; if the browser blocks it, retry on first gesture
  const autoTriedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!autoPlay) return;
    const key = `${index}`;
    if (autoTriedRef.current === key) return;
    autoTriedRef.current = key;
    let retry: (() => void) | null = null;
    const cleanupRetry = () => {
      if (retry) {
        window.removeEventListener("pointerdown", retry);
        window.removeEventListener("keydown", retry);
        window.removeEventListener("touchstart", retry);
        retry = null;
      }
    };
    ensureAndPlay()?.catch(() => {
      if (retry) return;
      retry = () => { ensureAndPlay()?.then(cleanupRetry).catch(() => {}); };
      window.addEventListener("pointerdown", retry);
      window.addEventListener("keydown", retry);
      window.addEventListener("touchstart", retry);
    });
    return cleanupRetry;
  }, [autoPlay, index, ensureAndPlay]);

  const toggle = () => {
    const existing = audioRef.current;
    if (existing && playing) {
      existing.pause();
      setPlaying(false);
      return;
    }
    ensureAndPlay();
  };

  const step = (dir: 1 | -1) => {
    // single track: restart the same song from the start
    if (tracks.length <= 1) {
      const existing = audioRef.current;
      if (existing) {
        try { existing.currentTime = 0; } catch {}
        setElapsed(0);
        if (!playing) {
          setLoading(true);
          existing.play().catch(() => setLoading(false));
        }
      } else {
        toggle();
      }
      return;
    }
    // wrap around both ends so prev/next never grey out
    const next = (index + dir + tracks.length) % tracks.length;
    const wasPlaying = !!audioRef.current && !audioRef.current.paused;
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
    setLoading(false);
    setElapsed(0);
    setDuration(0);
    if (wasPlaying) autoNextRef.current = true;
    setIndex(next);
  };

  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
  const playedBars = Math.floor((progress / 100) * heights.length);

  if (!track) return null;

  return (
    <div className="relative w-full rounded-2xl bg-[#101010] border border-white/10 overflow-hidden">
      {/* dynamic blurred artwork bg — changes with the song */}
      {artBg && track.artwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={track.id} src={track.artwork} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-60" />
      ) : null}
      {artBg && track.artwork ? <div className="absolute inset-0 bg-black/60" aria-hidden="true" /> : null}

      <div className="relative px-4 pt-3.5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
            {track.artwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={track.artwork} alt="" className="w-full h-full object-cover" draggable={false} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-[15px] text-white truncate leading-tight">{track.title}</span>
            <span className="text-[12.5px] text-white/50 truncate leading-tight">{track.artist}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => step(-1)}
              title="Previous track"
              className="w-7 h-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h2v14H6zM20 5v14L9 12z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggle}
              title={playing ? "Pause" : "Play"}
              className="w-9 h-9 rounded-full bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-[#609fda] animate-spin" />
              ) : playing ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              title="Next track"
              className="w-7 h-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <span className="text-[11px] font-mono text-white/45 shrink-0 w-7">{formatTime(elapsed)}</span>
          <div
            ref={barRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration || 0)}
            aria-valuenow={Math.round(elapsed)}
            tabIndex={0}
            onPointerDown={(e) => {
              (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
              setDragging(true);
              seekFromClientX(e.clientX);
            }}
            onPointerMove={(e) => { if (dragging) seekFromClientX(e.clientX); }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onKeyDown={(e) => {
              const audio = audioRef.current;
              if (!audio || !duration) return;
              if (e.key === "ArrowRight") { try { audio.currentTime = Math.min(duration, audio.currentTime + 5); } catch {} }
              if (e.key === "ArrowLeft") { try { audio.currentTime = Math.max(0, audio.currentTime - 5); } catch {} }
            }}
            className="flex-1 h-12 flex items-center gap-[2px] cursor-pointer group outline-none"
          >
            {heights.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={`flex-1 min-w-[2px] rounded-[2px] transition-colors duration-150 ${i < playedBars ? "bg-[#609fda]" : "bg-white/20 group-hover:bg-white/30"}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-white/45 shrink-0">{duration > 0 ? formatTime(duration) : "0:00"}</span>
        </div>
      </div>
    </div>
  );
}
