"use client";

import { useRef, useState, type CSSProperties, type RefObject } from "react";

/** Volume state that survives track changes (refs) + applies to audio elements. */
export function useVolume(audioRef: RefObject<HTMLAudioElement | null>) {
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);
  const volumeRef = useRef(1);
  const mutedRef = useRef(false);

  const applyVolume = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    try {
      audio.volume = Math.min(1, Math.max(0, volumeRef.current));
      audio.muted = mutedRef.current;
    } catch {}
  };

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

/** Frosted bluish button; hover reveals slider, click mutes.
 *  fixed=true floats it at the page top-left corner instead of the card. */
export function VolumeButton({
  volume,
  muted,
  setVolume,
  toggleMute,
  fixed = false,
  color = "#609fda",
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

  const fromClientX = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setVolume(Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(1, rect.width))));
  };

  const silent = muted || volume === 0;

  return (
    <div
      className={`${fixed ? "fixed top-5 left-5 z-50" : "absolute top-2 left-2 z-20"} group/vol flex items-center gap-2`}
      style={{ "--volume-icon": color } as CSSProperties}
    >
      <button
        type="button"
        onClick={toggleMute}
        title={silent ? "Unmute" : "Mute"}
        className={`${fixed ? "w-11 h-11" : "w-7 h-7"} rounded-2xl bg-[color-mix(in_srgb,var(--volume-icon)_12%,transparent)] backdrop-blur-xl border border-[color-mix(in_srgb,var(--volume-icon)_25%,transparent)] text-[var(--volume-icon)] hover:bg-[color-mix(in_srgb,var(--volume-icon)_22%,transparent)] hover:border-[color-mix(in_srgb,var(--volume-icon)_45%,transparent)] ${fixed ? "hover:scale-105" : ""} flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95`}
      >
        {silent ? (
          <svg width={fixed ? "18" : "13"} height={fixed ? "18" : "13"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width={fixed ? "18" : "13"} height={fixed ? "18" : "13"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            {volume > 0.5 ? <path d="M18.5 5.5a9.4 9.4 0 0 1 0 13" /> : null}
          </svg>
        )}
      </button>
      <div className={`hidden group-hover/vol:flex focus-within:flex items-center ${fixed ? "w-28 h-9 px-3" : "w-20 h-7 px-2.5"} rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10`}>
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
          className="w-full h-4 flex items-center cursor-pointer outline-none"
        >
          <div className={`relative w-full ${fixed ? "h-1.5" : "h-1"} rounded-full bg-white/15`}>
            <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--volume-icon)]" style={{ width: `${(muted ? 0 : volume) * 100}%` }}>
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
