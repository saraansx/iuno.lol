"use client";

import ColorPickerInput from "@/components/ui/color-picker";

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 250;

interface EmbedContentSectionProps {
  username: string;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  color: string;
  setColor: (val: string) => void;
  embedBackgroundUrl: string;
  setEmbedBackgroundModalOpen: (open: boolean) => void;
  clearEmbedBackground: () => void;
  embedIconUrl: string;
  setEmbedIconModalOpen: (open: boolean) => void;
  clearEmbedIcon: () => void;
}

export default function EmbedContentSection({
  username,
  title,
  setTitle,
  description,
  setDescription,
  color,
  setColor,
  embedBackgroundUrl,
  setEmbedBackgroundModalOpen,
  clearEmbedBackground,
  embedIconUrl,
  setEmbedIconModalOpen,
  clearEmbedIcon,
}: EmbedContentSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <div className="flex flex-col">
          <span className="text-[14px] font-normal text-white/90 tracking-tight">Embed content</span>
          <p className="text-[12.5px] text-white/40">Shown when your profile link is shared</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[12.5px] font-medium text-white/90">Title</label>
          <span className="text-[11.5px] text-white/30 font-mono">
            {title.length} / {TITLE_MAX}
          </span>
        </div>
        <input
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={username || "Your title"}
          className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10 transition-colors"
        />
        <p className="text-[12px] text-white/35">Leave empty to use your username.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[12.5px] font-medium text-white/90">Description</label>
          <span className="text-[11.5px] text-white/30 font-mono">
            {description.length} / {DESCRIPTION_MAX}
          </span>
        </div>
        <textarea
          value={description}
          maxLength={DESCRIPTION_MAX}
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short line about your profile"
          className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10 transition-colors resize-none custom-scrollbar"
        />
        <p className="text-[12px] text-white/35">Leave empty to hide the description.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12.5px] font-medium text-white/90">Color</label>
        <ColorPickerInput value={color} onChange={setColor} />
        <p className="text-[12px] text-white/35">The stripe down the side of the embed.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-[12.5px] font-medium text-white/90">Card background</label>
        {embedBackgroundUrl ? (
          <div
            onClick={() => setEmbedBackgroundModalOpen(true)}
            className="relative rounded-[14px] border border-white/5 overflow-hidden cursor-pointer group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={embedBackgroundUrl} alt="Card background" className="w-full h-28 object-cover" />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-[13px] font-medium text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Change background</span>
            </div>
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearEmbedBackground();
                }}
                title="Remove background"
                className="w-7 h-7 flex items-center justify-center rounded-md bg-black/60 text-red-400 hover:text-red-300 hover:bg-black/80 transition-all cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEmbedBackgroundModalOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/10 py-8 px-4 text-center cursor-pointer hover:border-white/20 transition-colors"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="text-[13px] font-medium text-white/90">Upload background</span>
          </button>
        )}
        <p className="text-[12px] text-white/35">Images only (1200×630 recommended, max 5MB). Empty uses the default background.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12.5px] font-medium text-white/90">Card icon</label>
        {embedIconUrl ? (
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 p-1.5 -m-1.5">
              <div
                onClick={() => setEmbedIconModalOpen(true)}
                className="relative w-20 h-20 rounded-full overflow-hidden bg-[#161616] border border-white/5 cursor-pointer group"
                title="Change card icon"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={embedIconUrl} alt="Card icon" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearEmbedIcon();
                }}
                title="Remove icon"
                className="absolute top-0 right-0 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 text-red-400 hover:text-red-300 hover:border-red-400/50 transition-all cursor-pointer"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEmbedIconModalOpen(true)}
            className="w-20 h-20 rounded-full border border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white/60 transition-all cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="text-[10px] font-normal">Upload</span>
          </button>
        )}
        <p className="text-[12px] text-white/35">Square image recommended (1:1, max 5MB). Shown as the circle in the middle. Empty uses the default icon.</p>
      </div>
      </div>

      <div className="flex gap-3 bg-[#161616] border border-white/5 rounded-xl p-3.5">
        <svg className="text-[#5b6cf5] shrink-0 mt-px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <p className="text-[12.5px] text-white/40">
          The card uses your card background and icon above, dimmed, with your name on top. Leave both empty to use the defaults.
        </p>
      </div>
    </div>
  );
}
