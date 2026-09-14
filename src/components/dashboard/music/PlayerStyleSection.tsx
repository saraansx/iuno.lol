"use client";

export type MusicPlayerStyle = "compact" | "vinyl" | "lyrics";

interface PlayerStyleOption {
  id: MusicPlayerStyle;
  name: string;
  description: string;
  enabled: boolean;
}

export const PLAYER_STYLES: PlayerStyleOption[] = [
  {
    id: "compact",
    name: "Compact player",
    description: "Artwork, title and play button in a slim row.",
    enabled: true,
  },
  {
    id: "vinyl",
    name: "Lyrics player",
    description: "Spinning disc with tone arm. Coming soon.",
    enabled: false,
  },
  {
    id: "lyrics",
    name: "Vinyl player",
    description: "Karaoke-style synced lyrics panel. Coming soon.",
    enabled: false,
  },
];

export function CompactPlayerMock() {
  return (
    <div className="relative w-full rounded-xl bg-[#101010] border border-white/5 overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-2.5 pl-3 pr-2 py-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#609fda]/15 border border-[#609fda]/25 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#609fda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="flex items-end gap-[2px] h-4 shrink-0">
          <span className="w-[2.5px] rounded-full bg-[#609fda] shrink-0" style={{ height: "80%" }} />
          <span className="w-[2.5px] rounded-full bg-[#609fda] shrink-0" style={{ height: "35%" }} />
          <span className="w-[2.5px] rounded-full bg-[#609fda] shrink-0" style={{ height: "60%" }} />
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
          <div className="w-7 h-7 rounded-full bg-[#609fda]/20 flex items-center justify-center">
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
        <div className="h-full w-1/3 bg-[#609fda]/80" />
      </div>
    </div>
  );
}

interface PlayerStyleSectionProps {
  playerStyle: MusicPlayerStyle;
  setPlayerStyle: (val: MusicPlayerStyle) => void;
  artBg: boolean;
  setArtBg: (val: boolean) => void;
}

export default function PlayerStyleSection({ playerStyle, setPlayerStyle, artBg, setArtBg }: PlayerStyleSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
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
    </div>
  );
}
