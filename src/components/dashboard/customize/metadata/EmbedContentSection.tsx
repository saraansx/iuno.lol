"use client";

import { useState } from "react";
import ColorPickerInput from "@/components/ui/color-picker";

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 250;

function fileNameOf(url: string): string {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    return name || url;
  } catch {
    return url;
  }
}

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
  const [openMenu, setOpenMenu] = useState<"bg" | "icon" | null>(null);

  const menuFor = (key: "bg" | "icon", onPick: () => void, onDelete: () => void) => (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpenMenu(openMenu === key ? null : key)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        title="Options"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
      </button>
      {openMenu === key && (
        <>
          <button type="button" aria-label="Close menu" onClick={() => setOpenMenu(null)} className="fixed inset-0 z-30 cursor-default" />
          <div className="absolute right-0 top-full mt-1.5 z-40 w-44 p-1 bg-[#161616] border border-white/10 rounded-lg shadow-xl flex flex-col">
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onPick();
              }}
              className="flex items-center px-3 py-2 rounded-md text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setOpenMenu(null);
              }}
              className="flex items-center px-3 py-2 rounded-md text-[13px] text-red-400 hover:bg-red-400/10 transition-all text-left cursor-pointer"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );

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
          <div className="rounded-[14px] border border-white/5 p-2 flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#161616] px-3 py-2.5 transition-colors">
              <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={embedBackgroundUrl} alt="Card background" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <button type="button" onClick={() => setEmbedBackgroundModalOpen(true)} title="Change card background" className="flex-1 min-w-0 text-left cursor-pointer">
                <p className="text-[13px] text-white truncate">{fileNameOf(embedBackgroundUrl)}</p>
                <p className="text-[11px] text-white/35 truncate">Card background</p>
              </button>
              {menuFor("bg", () => setEmbedBackgroundModalOpen(true), clearEmbedBackground)}
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
          <div className="rounded-[14px] border border-white/5 p-2 flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#161616] px-3 py-2.5 transition-colors">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={embedIconUrl} alt="Card icon" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <button type="button" onClick={() => setEmbedIconModalOpen(true)} title="Change card icon" className="flex-1 min-w-0 text-left cursor-pointer">
                <p className="text-[13px] text-white truncate">{fileNameOf(embedIconUrl)}</p>
                <p className="text-[11px] text-white/35 truncate">Card icon</p>
              </button>
              {menuFor("icon", () => setEmbedIconModalOpen(true), clearEmbedIcon)}
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
