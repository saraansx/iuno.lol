"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { type MusicTrack } from "@/lib/music";
import { isCatboxUrl } from "@/lib/catbox";
import { useVolume, VolumeButton } from "./volume";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CompactMusicPlayer({ tracks, autoPlay = false, artBg = true, volumeControl = false, volumeFloating = false, volumeColor = "#5b6cf5", titleStyle, artistStyle, shuffle = false }: { tracks: MusicTrack[]; autoPlay?: boolean; artBg?: boolean; volumeControl?: boolean; volumeFloating?: boolean; volumeColor?: string; titleStyle?: CSSProperties; artistStyle?: CSSProperties; shuffle?: boolean }) {
  const [index, setIndex] = useState(0);

  useLayoutEffect(() => {
    if (shuffle && tracks.length > 1) setIndex(Math.floor(Math.random() * tracks.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [levels, setLevels] = useState<number[] | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const levelTimerRef = useRef<number | null>(null);
  const autoNextRef = useRef(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const { volume, muted, setVolume, toggleMute, applyVolume } = useVolume(audioRef);

  const randomDifferent = useCallback(
    (from: number) => {
      if (tracks.length <= 1) return from;
      let n = from;
      while (n === from) n = Math.floor(Math.random() * tracks.length);
      return n;
    },
    [tracks],
  );

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

  useEffect(() => () => {
    if (levelTimerRef.current !== null) window.clearInterval(levelTimerRef.current);
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const bounceRef = useRef(0);

  const startLevels = () => {
    if (levelTimerRef.current !== null) return;
    const phases = [0, 2.1, 4.2];
    const speeds = [1.1, 1.45, 0.85];
    levelTimerRef.current = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio || audio.paused) {
        setLevels(null);
        return;
      }
      bounceRef.current += 0.75;
      const t = bounceRef.current;
      setLevels(
        phases.map((p, i) => {
          const v = 52 + 42 * Math.sin(t * (speeds[i] ?? 1) + p) + (Math.random() * 10 - 5);
          return Math.min(100, Math.max(8, Math.round(v)));
        })
      );
    }, 60);
  };

  const stopLevels = () => {
    if (levelTimerRef.current !== null) {
      window.clearInterval(levelTimerRef.current);
      levelTimerRef.current = null;
    }
    setLevels(null);
  };

  const playAt = useCallback((target: number): Promise<void> | undefined => {
    const existing = audioRef.current;
    if (existing) {
      if (!existing.paused) return undefined;
      setLoading(true);
      return existing.play().catch(() => { setLoading(false); });
    }
    const t = tracks[Math.min(target, tracks.length - 1)] ?? null;
    if (!t) return undefined;
    const url = isCatboxUrl(t.streamUrl) ? (t.streamUrl as string) : null;
    if (!url) {
      setLoading(false);
      return undefined;
    }
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = url;
    audioRef.current = audio;
    applyVolume(audio);
    setLoading(true);
    setElapsed(0);
    const onTime = () => setElapsed(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
      startLevels();
    };
    const onPause = () => {
      setPlaying(false);
      stopLevels();
    };
    const onEnded = () => {
      stopLevels();
      const next = shuffle ? randomDifferent(target) : target < tracks.length - 1 ? target + 1 : 0;
      if (next === target) {
        try { audio.currentTime = 0; } catch {}
        setElapsed(0);
        setLoading(true);
        audio.play().catch(() => {
          setLoading(false);
          setPlaying(false);
        });
      } else {
        audioRef.current = null;
        setElapsed(0);
        setDuration(0);
        setPlaying(false);
        setLoading(false);
        autoNextRef.current = true;
        setIndex(next);
      }
    };
    const onError = () => {
      stopLevels();
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
  }, [tracks, applyVolume, shuffle, randomDifferent]);

  const ensureAndPlay = useCallback(
    (): Promise<void> | undefined => playAt(index),
    [playAt, index],
  );

  useEffect(() => {
    if (!autoNextRef.current) return;
    autoNextRef.current = false;
    const t = window.setTimeout(() => {
      ensureAndPlay()?.catch(() => {});
    }, 0);
    return () => window.clearTimeout(t);
  }, [index, ensureAndPlay]);

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
    const t = window.setTimeout(() => {
      ensureAndPlay()?.catch(() => {
        if (retry) return;
        retry = () => { ensureAndPlay()?.then(cleanupRetry).catch(() => {}); };
        window.addEventListener("pointerdown", retry);
        window.addEventListener("keydown", retry);
        window.addEventListener("touchstart", retry);
      });
    }, 0);
    return () => {
      window.clearTimeout(t);
      cleanupRetry();
    };
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
    const next = shuffle ? randomDifferent(index) : (index + dir + tracks.length) % tracks.length;
    if (next === index) {
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
    const wasPlaying = !!audioRef.current && !audioRef.current.paused;
    audioRef.current?.pause();
    audioRef.current = null;
    stopLevels();
    setPlaying(false);
    setLoading(false);
    setElapsed(0);
    setDuration(0);
    if (wasPlaying) autoNextRef.current = true;
    setIndex(next);
  };

  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  const bars = levels ?? [34, 20, 27];

  if (!track) return null;

  return (
    <div className="relative w-full rounded-2xl bg-[#101010] border border-white/10 overflow-hidden">
      {/* dynamic blurred artwork bg — changes with the song */}
      {artBg && track.artwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={track.id} src={track.artwork} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-70" />
      ) : null}
      {artBg && track.artwork ? <div className="absolute inset-0 bg-black/55" aria-hidden="true" /> : null}
      {volumeControl ? (
        <VolumeButton volume={volume} muted={muted} setVolume={setVolume} toggleMute={toggleMute} fixed={volumeFloating} color={volumeColor} />
      ) : null}
      <div className="relative flex items-center gap-3.5 pl-4 pr-3 py-3.5">
      <div className="w-14 h-14 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
        {track.artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.artwork} alt="" className="w-full h-full object-cover" draggable={false} />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </div>

      {/* short waveform in theme color */}
      <div className="flex items-end gap-[2px] h-4 shrink-0" aria-hidden="true">
        {bars.map((h, i) => (
          <span
            key={i}
            style={{ height: `${Math.max(15, h)}%` }}
            className={`w-[2.5px] rounded-full shrink-0 transition-[height] duration-100 ease-in-out ${levels ? "bg-[#5b6cf5]" : "bg-[#5b6cf5]/25"}`}
          />
        ))}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="truncate leading-tight" style={titleStyle}>{track.title}</span>
        <span className="truncate leading-tight opacity-60" style={artistStyle}>
          {track.artist}
          {duration > 0 ? <span className="font-mono"> · {formatTime(elapsed)} / {formatTime(duration)}</span> : null}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1 shrink-0">
      {tracks.length > 1 ? (
        <button
          type="button"
          onClick={() => step(-1)}
          title="Previous track"
          className="w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h2v14H6zM20 5v14L9 12z" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => step(-1)}
          title="Restart song"
          className="w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h2v14H6zM20 5v14L9 12z" />
          </svg>
        </button>
      )}

      <button
        type="button"
        onClick={toggle}
        title={playing ? "Pause" : "Play"}
        className="w-11 h-11 rounded-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white flex items-center justify-center shrink-0 transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-[#5b6cf5] animate-spin" />
        ) : playing ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {tracks.length > 1 ? (
        <button
          type="button"
          onClick={() => step(1)}
          title="Next track"
          className="w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => step(1)}
          title="Restart song"
          className="w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
          </svg>
        </button>
      )}
      </div>
      </div>
      {/* draggable seek bar at bottom */}
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
        className="absolute bottom-0 left-0 right-0 h-4 flex items-end cursor-pointer group outline-none"
      >
        <div className="w-full bg-white/5 h-[2px] group-hover:h-[4px] transition-all">
          <div className="h-full bg-[#5b6cf5]/80" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
