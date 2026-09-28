"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { type MusicTrack } from "@/lib/music";
import { isHostedMediaUrl } from "@/lib/media-hosts";
import { useVolume, VolumeButton } from "./volume";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function LyricsMusicPlayer({ tracks, autoPlay = false, artBg = true, volumeControl = false, volumeFloating = false, volumeColor = "#5b6cf5", titleStyle, artistStyle, lyricStyle, lyricColor = "#FFFFFF", shuffle = false }: { tracks: MusicTrack[]; autoPlay?: boolean; artBg?: boolean; volumeControl?: boolean; volumeFloating?: boolean; volumeColor?: string; titleStyle?: CSSProperties; artistStyle?: CSSProperties; lyricStyle?: CSSProperties; lyricColor?: string; shuffle?: boolean }) {
  const [index, setIndex] = useState(0);

  useLayoutEffect(() => {
    if (shuffle && tracks.length > 1) setIndex(Math.floor(Math.random() * tracks.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoNextRef = useRef(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const lyricsRef = useRef<HTMLDivElement | null>(null);
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

  const rafRef = useRef<number | null>(null);
  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);
  const startRaf = useCallback(() => {
    stopRaf();
    const tick = () => {
      const a = audioRef.current;
      if (!a) {
        rafRef.current = null;
        return;
      }
      if (!a.paused) setElapsed(a.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf]);

  useEffect(() => () => {
    stopRaf();
    audioRef.current?.pause();
    audioRef.current = null;
  }, [stopRaf]);

  const playAt = useCallback((target: number): Promise<void> | undefined => {
    const existing = audioRef.current;
    if (existing) {
      if (!existing.paused) return undefined;
      setLoading(true);
      return existing.play().catch(() => { setLoading(false); });
    }
    const t = tracks[Math.min(target, tracks.length - 1)] ?? null;
    if (!t) return undefined;
    const url = isHostedMediaUrl(t.streamUrl) ? (t.streamUrl as string) : null;
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
      startRaf();
    };
    const onPause = () => {
      stopRaf();
      setPlaying(false);
    };
    const onEnded = () => {
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
      stopRaf();
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
  }, [tracks, applyVolume, shuffle, randomDifferent, startRaf, stopRaf]);

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
    setPlaying(false);
    setLoading(false);
    setElapsed(0);
    setDuration(0);
    if (wasPlaying) autoNextRef.current = true;
    setIndex(next);
  };

  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  const GAP_MS = 3000;
  const EDGE_MS = 300;
  const lines = track?.lyrics ?? [];
  const ms = elapsed * 1000;
  const activeIdx = lines.findIndex((l, i) => {
    const next = lines[i + 1];
    return ms >= l.start && (next ? ms < next.start : ms <= l.end + 4000);
  });

  type DisplayItem =
    | { kind: "line"; line: { text: string; start: number; end: number }; idx: number }
    | { kind: "music"; key: string };
  const displayItems: DisplayItem[] = [];
  if (lines.length > 0) {
    displayItems.push({ kind: "music", key: "intro" });
  }
  lines.forEach((l, i) => {
    displayItems.push({ kind: "line", line: l, idx: i });
    const next = lines[i + 1];
    if (next && next.start - l.end > GAP_MS) {
      displayItems.push({ kind: "music", key: `gap-${i}` });
    }
  });
  if (lines.length > 0) {
    displayItems.push({ kind: "music", key: "outro" });
  }

  const activeMusicKey: string | null =
    playing && lines.length > 0
      ? (() => {
          const first = lines[0];
          if (ms < first.start) return "intro";
          for (let i = 0; i < lines.length - 1; i++) {
            const l = lines[i];
            const next = lines[i + 1];
            if (
              next.start - l.end > GAP_MS &&
              ms > l.end + EDGE_MS &&
              ms < next.start
            ) {
              return `gap-${i}`;
            }
          }
          const last = lines[lines.length - 1];
          if (ms > last.end + EDGE_MS) {
            return "outro";
          }
          return null;
        })()
      : null;

  const scrollKey = activeMusicKey
    ? `key:${activeMusicKey}`
    : activeIdx >= 0
      ? `idx:${activeIdx}`
      : null;

  useEffect(() => {
    if (!scrollKey) return;
    const box = lyricsRef.current;
    const [kind, val] = scrollKey.split(":");
    const el = box?.querySelector<HTMLElement>(
      kind === "key" ? `[data-key="${val}"]` : `[data-idx="${val}"]`
    );
    if (!box || !el) return;
    box.scrollTo({
      top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2,
      behavior: "smooth",
    });
  }, [scrollKey, index]);

  if (!track) return null;

  return (
    <div className="relative w-full rounded-2xl bg-[#101010] border border-white/10 overflow-hidden">
      {}
      {artBg && track.artwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={track.id} src={track.artwork} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-60" />
      ) : null}
      {artBg && track.artwork ? <div className="absolute inset-0 bg-black/65" aria-hidden="true" /> : null}
      {volumeControl ? (
        <VolumeButton volume={volume} muted={muted} setVolume={setVolume} toggleMute={toggleMute} fixed={volumeFloating} color={volumeColor} />
      ) : null}

      <div className="relative px-4 pt-3.5">
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
            <span className="truncate leading-tight" style={titleStyle}>{track.title}</span>
            <span className="truncate leading-tight opacity-60" style={artistStyle}>{track.artist}</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2.5">
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
            className="relative flex-1 h-4 flex items-center cursor-pointer group outline-none"
          >
            <div className="w-full h-1 rounded-full bg-white/10 overflow-visible">
              <div className="relative h-full rounded-full bg-[#5b6cf5]/80" style={{ width: `${progress}%` }}>
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-white/45 shrink-0">{duration > 0 ? formatTime(duration) : "0:00"}</span>
          <div className="flex items-center gap-1 shrink-0 ml-1">
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
              className="w-9 h-9 rounded-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-[#5b6cf5] animate-spin" />
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
      </div>

      <div ref={lyricsRef} className="relative px-4 pt-2 pb-4 max-h-[112px] overflow-hidden flex flex-col gap-1.5">
        {lines.length === 0 ? (
          <p className="text-[15px] text-white/50 blur-[1.5px] opacity-70 select-none text-center py-3" aria-hidden="true">
            ♪
          </p>
        ) : (
          displayItems.map((item) =>
            item.kind === "music" ? (
              <p
                key={item.key}
                data-key={item.key}
                style={{ ...lyricStyle, color: lyricColor }}
                className={`leading-snug transition-all duration-300 ${
                  item.key === activeMusicKey
                    ? "font-semibold blur-0 opacity-100"
                    : "font-normal blur-[1.5px] opacity-40"
                }`}
              >
                ♪
              </p>
            ) : (
              <p
                key={`line-${item.idx}`}
                data-idx={item.idx}
                style={{ ...lyricStyle, color: lyricColor }}
                className={`leading-snug transition-all duration-300 ${
                  item.idx === activeIdx && !activeMusicKey
                    ? "font-semibold blur-0 opacity-100"
                    : "font-normal blur-[1.5px] opacity-40"
                }`}
              >
                {item.line.text}
              </p>
            )
          )
        )}
      </div>
    </div>
  );
}
