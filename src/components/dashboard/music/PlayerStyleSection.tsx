"use client";

import { useMemo } from "react";
import { seedHeights } from "@/components/profile/music/WaveformMusicPlayer";

export type MusicPlayerStyle = "compact" | "waveform" | "lyrics";

interface PlayerStyleOption {
  id: MusicPlayerStyle;
  name: string;
  description: string;
  enabled: boolean;
}

const PLAYER_STYLES: PlayerStyleOption[] = [
  {
    id: "compact",
    name: "Compact player",
    description: "Artwork, title and play button in a slim row.",
    enabled: true,
  },
  {
    id: "waveform",
    name: "Waveform player",
    description: "Full-width scrubable waveform, SoundCloud style.",
    enabled: true,
  },
  {
    id: "lyrics",
    name: "Lyrics player",
    description: "Karaoke-style synced lyrics panel.",
    enabled: true,
  },
];

function CompactPlayerMock() {
  return (
    <div className="relative w-full my-auto rounded-xl bg-[#101010] border border-white/5 overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-2.5 pl-3 pr-2 py-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#5b6cf5]/15 border border-[#5b6cf5]/25 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="flex items-end gap-[2px] h-4 shrink-0">
          <span className="w-[2.5px] h-full rounded-full bg-[#5b6cf5] shrink-0 animate-eq" style={{ animationDuration: "0.9s" }} />
          <span className="w-[2.5px] h-full rounded-full bg-[#5b6cf5] shrink-0 animate-eq" style={{ animationDuration: "1.2s", animationDelay: "0.2s" }} />
          <span className="w-[2.5px] h-full rounded-full bg-[#5b6cf5] shrink-0 animate-eq" style={{ animationDuration: "1s", animationDelay: "0.4s" }} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="h-2.5 w-2/5 rounded bg-white/15" />
          <div className="h-2 w-1/4 rounded bg-white/10" />
        </div>
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <div className="w-6 h-6 rounded-full flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
              <path d="M6 5h2v14H6zM20 5v14L9 12z" />
            </svg>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#5b6cf5]/20 flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" className="ml-px">
              <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
            </svg>
          </div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
              <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div className="h-full w-1/3 bg-[#5b6cf5]/80" />
      </div>
    </div>
  );
}

function LyricsPlayerMock() {
  return (
    <div className="w-full rounded-xl bg-[#101010] border border-white/5 px-3 pt-2.5 pb-3 flex flex-col gap-2" aria-hidden="true">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#5b6cf5]/15 border border-[#5b6cf5]/25 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="h-2 w-1/3 rounded bg-white/15" />
          <div className="h-1.5 w-1/4 rounded bg-white/10" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] font-mono text-white/45 shrink-0">0:03</span>
        <div className="flex-1 h-1 rounded-full bg-white/10">
          <div className="h-full w-1/4 rounded-full bg-[#5b6cf5]/80" />
        </div>
        <span className="text-[8px] font-mono text-white/45 shrink-0">1:35</span>
        <div className="flex items-center gap-0.5 shrink-0 ml-0.5">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
            <path d="M6 5h2v14H6zM20 5v14L9 12z" />
          </svg>
          <div className="w-5 h-5 rounded-full bg-[#5b6cf5]/20 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff" className="ml-px">
              <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
            </svg>
          </div>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
            <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-1 pl-0.5">
        <p className="text-[10px] text-white/25 blur-[1.5px] truncate">midnight drives and city lights</p>
        <p className="text-[11px] text-white font-medium truncate">we were never going home</p>
        <p className="text-[10px] text-white/25 blur-[1.5px] truncate">dancing till the morning comes</p>
      </div>
    </div>
  );
}

function WaveformPlayerMock() {
  const bars = useMemo(() => seedHeights("preview", 36), []);
  return (
    <div className="w-full my-auto rounded-xl bg-[#101010] border border-white/5 px-3 pt-2.5 pb-3 flex flex-col gap-2" aria-hidden="true">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#5b6cf5]/15 border border-[#5b6cf5]/25 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="h-2 w-1/3 rounded bg-white/15" />
          <div className="h-1.5 w-1/4 rounded bg-white/10" />
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
            <path d="M6 5h2v14H6zM20 5v14L9 12z" />
          </svg>
          <div className="w-6 h-6 rounded-full bg-[#5b6cf5]/20 flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff" className="ml-px">
              <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
            </svg>
          </div>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
            <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] font-mono text-white/45 shrink-0">0:29</span>
        <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-[2px] h-7">
          {bars.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 min-w-0 rounded-[1px] ${i < 12 ? "bg-[#5b6cf5]" : "bg-white/20"}`}
            />
          ))}
        </div>
        <span className="text-[8px] font-mono text-white/45 shrink-0">1:35</span>
      </div>
    </div>
  );
}

interface PlayerStyleSectionProps {
  playerStyle: MusicPlayerStyle;
  setPlayerStyle: (val: MusicPlayerStyle) => void;
  artBg: boolean;
  setArtBg: (val: boolean) => void;
  volumeControl: boolean;
  setVolumeControl: (val: boolean) => void;
  defaultVolume: number;
  setDefaultVolume: (val: number) => void;
  shuffle: boolean;
  setShuffle: (val: boolean) => void;
  trackCount: number;
}

export default function PlayerStyleSection({ playerStyle, setPlayerStyle, artBg, setArtBg, volumeControl, setVolumeControl, defaultVolume, setDefaultVolume, shuffle, setShuffle, trackCount }: PlayerStyleSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
        <div className="flex flex-col">
          <span className="text-[14px] font-normal text-white/90 tracking-tight">Player style</span>
          <p className="text-[12.5px] text-white/40">How your playlist looks on your profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLAYER_STYLES.map((option) => {
          const isSelected = playerStyle === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={!option.enabled}
              onClick={() => setPlayerStyle(option.id)}
              aria-pressed={isSelected}
              className={`flex flex-col gap-2.5 rounded-2xl border p-3.5 text-left transition-all ${
                !option.enabled
                  ? "bg-[#101010]/50 border-white/5 opacity-50 cursor-not-allowed"
                  : isSelected
                    ? "bg-[#111326] border-[#5b6cf5]/40 cursor-pointer"
                    : "bg-[#141414]/70 border-white/5 hover:border-white/15 cursor-pointer"
              }`}
            >
              <span className="text-[13px] font-medium text-white/90">{option.name}</span>
              {option.id === "compact" ? (
                <CompactPlayerMock />
              ) : option.id === "lyrics" ? (
                <LyricsPlayerMock />
              ) : option.id === "waveform" ? (
                <WaveformPlayerMock />
              ) : (
                <span className="w-full aspect-[16/7] rounded-xl bg-[#161616] border border-white/5 flex items-center justify-center text-[11px] text-white/25">
                  Soon
                </span>
              )}
              <span className="text-[11.5px] text-white/35 leading-snug">{option.description}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={artBg}
        onClick={() => setArtBg(!artBg)}
        className="flex items-center justify-between gap-3 rounded-2xl bg-[#141414]/70 border border-white/5 hover:border-white/15 px-4 py-3.5 text-left transition-all cursor-pointer"
      >
        <span className="flex flex-col">
          <span className="text-[13px] font-normal text-white/90">Artwork background</span>
          <span className="text-[11.5px] text-white/35 leading-snug">Blurry song cover behind the player, changes per track</span>
        </span>
        <span className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${artBg ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${artBg ? "left-[18px]" : "left-0.5"}`} />
        </span>
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={volumeControl}
        onClick={() => setVolumeControl(!volumeControl)}
        className="flex items-center justify-between gap-3 rounded-2xl bg-[#141414]/70 border border-white/5 hover:border-white/15 px-4 py-3.5 text-left transition-all cursor-pointer"
      >
        <span className="flex flex-col">
          <span className="text-[13px] font-normal text-white/90">Volume control</span>
          <span className="text-[11.5px] text-white/35 leading-snug">Frosted volume button on the player — hover for slider, click to mute</span>
        </span>
        <span className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${volumeControl ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${volumeControl ? "left-[18px]" : "left-0.5"}`} />
        </span>
      </button>

      <div className="rounded-2xl bg-[#141414]/70 border border-white/5 px-4 py-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="flex flex-col">
            <span className="text-[13px] font-normal text-white/90">Default volume</span>
            <span className="text-[11.5px] text-white/35 leading-snug">
              Volume visitors hear when your profile opens. They can still lower or raise it.
            </span>
          </span>
          <span className="text-[12px] font-mono text-white/60 tabular-nums shrink-0">{defaultVolume}%</span>
        </div>

        <div className="relative flex items-center h-5 group w-full">
          <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="absolute h-full bg-[#5b6cf5]" style={{ width: `${defaultVolume}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={defaultVolume}
            onChange={(e) => setDefaultVolume(Number(e.target.value))}
            aria-label="Default music volume"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          <div
            className="absolute h-3 w-3 rounded-full bg-white shadow-[0_0_10px_rgba(91,108,245,0.8)] pointer-events-none"
            style={{ left: `calc(${defaultVolume}% - 6px)` }}
          />
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={shuffle}
        disabled={trackCount < 2}
        onClick={() => setShuffle(!shuffle)}
        title={trackCount < 2 ? "Add at least 2 tracks to use shuffle" : undefined}
        className={`flex items-center justify-between gap-3 rounded-2xl bg-[#141414]/70 border border-white/5 px-4 py-3.5 text-left transition-all ${trackCount < 2 ? "opacity-40 cursor-not-allowed" : "hover:border-white/15 cursor-pointer"}`}
      >
        <span className="flex flex-col">
          <span className="text-[13px] font-normal text-white/90">Shuffle mode</span>
          <span className="text-[11.5px] text-white/35 leading-snug">{trackCount < 2 ? "Add at least 2 tracks to use shuffle" : "Play tracks in random order instead of sequence"}</span>
        </span>
        <span className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${shuffle && trackCount >= 2 ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${shuffle && trackCount >= 2 ? "left-[18px]" : "left-0.5"}`} />
        </span>
      </button>
    </div>
  );
}
