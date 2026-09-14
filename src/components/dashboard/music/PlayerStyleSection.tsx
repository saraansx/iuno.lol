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
    name: "Vinyl player",
    description: "Spinning disc with tone arm. Coming soon.",
    enabled: false,
  },
  {
    id: "lyrics",
    name: "Lyrics player",
    description: "Karaoke-style synced lyrics panel. Coming soon.",
    enabled: false,
  },
];

export function CompactPlayerMock() {
  return (
    <div className="w-full rounded-xl bg-[#161616] border border-white/5 px-3 py-2.5 flex items-center gap-3" aria-hidden="true">
      <div className="w-10 h-10 rounded-lg bg-[#609fda]/15 border border-[#609fda]/25 flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#609fda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="h-2.5 w-2/5 rounded bg-white/15" />
        <div className="h-2 w-1/4 rounded bg-white/10" />
      </div>
      <div className="w-7 h-7 rounded-full bg-[#609fda]/20 flex items-center justify-center shrink-0">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" className="ml-px">
          <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
        </svg>
      </div>
    </div>
  );
}

interface PlayerStyleSectionProps {
  playerStyle: MusicPlayerStyle;
  setPlayerStyle: (val: MusicPlayerStyle) => void;
}

export default function PlayerStyleSection({ playerStyle, setPlayerStyle }: PlayerStyleSectionProps) {
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
    </div>
  );
}
