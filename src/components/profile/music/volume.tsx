"use client";

import { useCallback, useId, useRef, useState, type CSSProperties, type RefObject } from "react";

export function useVolume(audioRef: RefObject<HTMLAudioElement | null>, initialVolume = 1) {
  const initial = Math.min(1, Math.max(0, initialVolume));
  const [volume, setVolumeState] = useState(initial);
  const [muted, setMutedState] = useState(false);
  const volumeRef = useRef(initial);
  const mutedRef = useRef(false);

  const applyVolume = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    try {
      audio.volume = Math.min(1, Math.max(0, volumeRef.current));
      audio.muted = mutedRef.current;
    } catch {}
  }, []);

  const setVolume = (v: number) => {
    const c = Math.min(1, Math.max(0, v));
    volumeRef.current = c;
    setVolumeState(c);
    if (c > 0 && mutedRef.current) {
      mutedRef.current = false;
      setMutedState(false);
    }
    applyVolume(audioRef.current);
  };

  const toggleMute = () => {
    mutedRef.current = !mutedRef.current;
    setMutedState(mutedRef.current);
    applyVolume(audioRef.current);
  };

  return { volume, muted, setVolume, toggleMute, applyVolume };
}

export function VolumeButton({
  volume,
  muted,
  setVolume,
  toggleMute,
  fixed = false,
  color = "#5b6cf5",
}: {
  volume: number;
  muted: boolean;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  fixed?: boolean;
  color?: string;
}) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const glowId = useId().replace(/:/g, "");

  const fromClientX = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setVolume(Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(1, rect.width))));
  };

  const silent = muted || volume === 0;

  return (
    <div
      className={`${fixed ? "fixed top-5 left-5 z-50" : "absolute top-2 left-2 z-20"} group/vol flex items-center rounded-2xl border border-white/10 bg-transparent backdrop-blur-2xl transition-shadow duration-300 p-1.5`}
      style={{ "--volume-icon": color } as CSSProperties}
    >
      <button
        type="button"
        onClick={toggleMute}
        title={silent ? "Unmute" : "Mute"}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--volume-icon)] transition-transform duration-200 cursor-pointer active:scale-95 shrink-0"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#vol-glow-${glowId})`}>
          <defs>
            <filter id={`vol-glow-${glowId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="currentColor" floodOpacity="0.9" />
            </filter>
          </defs>
          {silent ? (
            <>
              <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : (
            <>
              <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              {volume > 0.5 ? <path d="M18.5 5.5a9.4 9.4 0 0 1 0 13" /> : null}
            </>
          )}
        </svg>
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-out w-0 opacity-0 group-hover/vol:w-[132px] group-hover/vol:opacity-100 group-hover/vol:mr-1.5 focus-within:w-[132px] focus-within:opacity-100 focus-within:mr-1.5 h-9 flex items-center">
        <div
          ref={barRef}
          role="slider"
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
          tabIndex={0}
          onPointerDown={(e) => {
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            setDrag(true);
            fromClientX(e.clientX);
          }}
          onPointerMove={(e) => { if (drag) fromClientX(e.clientX); }}
          onPointerUp={() => setDrag(false)}
          onPointerCancel={() => setDrag(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") setVolume(volume + 0.05);
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") setVolume(volume - 0.05);
          }}
          className="w-28 h-4 flex items-center cursor-pointer outline-none"
        >
          <div className="relative w-full h-1.5 rounded-full bg-white/15">
            <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--volume-icon)] shadow-[0_0_8px_var(--volume-icon)]" style={{ width: `${(muted ? 0 : volume) * 100}%` }}>
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_var(--volume-icon)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
