"use client";

import ColorPickerInput from "@/components/ui/color-picker";

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 250;

interface EmbedContentSectionProps {
  username: string;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  color: string;
  setColor: (val: string) => void;
}

export default function EmbedContentSection({
  username,
  title,
  setTitle,
  description,
  setDescription,
  color,
  setColor,
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

      <div className="flex gap-3 bg-[#161616] border border-white/5 rounded-xl p-3.5">
        <svg className="text-[#609fda] shrink-0 mt-px" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <p className="text-[12.5px] text-white/40">
          The card uses your profile background, dimmed, with your avatar on top. Change either from General.
        </p>
      </div>
    </div>
  );
}
