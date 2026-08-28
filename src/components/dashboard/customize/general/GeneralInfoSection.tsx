"use client";

import { useState, useRef } from "react";
interface GeneralInfoSectionProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  occupation: string;
  setOccupation: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
}

export default function GeneralInfoSection({
  displayName,
  setDisplayName,
  location,
  setLocation,
  occupation,
  setOccupation,
  bio,
  setBio,
}: GeneralInfoSectionProps) {
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const textToInsert = `${prefix}${suffix}`;
      if (bio.length + textToInsert.length <= 200) {
        setBio(bio + textToInsert);
      }
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = bio.substring(start, end);

    let replacement: string;
    let newCursorPos: number;

    if (selectedText) {
      replacement = `${prefix}${selectedText}${suffix}`;
      newCursorPos = start + replacement.length;
    } else {
      replacement = `${prefix}${suffix}`;
      newCursorPos = start + prefix.length;
    }

    const newBio = bio.substring(0, start) + replacement + bio.substring(end);

    if (newBio.length <= 200) {
      setBio(newBio);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-7 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="absolute">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h2 className="text-white font-normal text-[16px] tracking-tight">General Information</h2>
          <p className="text-white/40 text-[13px] mt-0.5">Your profile details</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[12.5px] font-medium text-white/90">Display Name</label>
            <span className="text-[11px] text-white/30">{displayName.length}/32</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 32))}
              placeholder="e.g. John Doe"
              className="w-full h-10 bg-[#161616] border border-white/5 rounded-xl px-4 text-[13px] text-white focus:outline-none focus:border-white/10 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[12.5px] font-medium text-white/90">Location</label>
            <span className="text-[11px] text-white/30">{location.length}/50</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. New York, USA"
              value={location}
              onChange={(e) => setLocation(e.target.value.slice(0, 50))}
              className="w-full h-10 bg-[#161616] border border-white/5 rounded-xl px-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/10 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[12.5px] font-medium text-white/90">Occupation</label>
            <span className="text-[11px] text-white/30">{occupation.length}/50</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value.slice(0, 50))}
              className="w-full h-10 bg-[#161616] border border-white/5 rounded-xl px-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/10 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <label className="text-[12.5px] font-medium text-white/90">Description</label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/30">{bio.length}/200</span>
              <span className={`text-[11px] ${bio.split('\n').length >= 5 ? 'text-red-400' : 'text-white/30'}`}>
                {bio.split('\n').length}/5 lines
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFormattingHelp(!showFormattingHelp)}
              className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-[#609fda] transition-colors cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
              <span>Formatting Guide</span>
            </button>
          </div>
        </div>

        {showFormattingHelp && (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs text-white/70 shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] font-medium text-white/90">Text Formatting Options:</p>
              <span className="text-[10px] text-white/30">Markdown supported</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="font-bold text-white">Bold</span>
                <code className="text-[#609fda] bg-black/40 px-1.5 py-0.5 rounded font-mono">**text**</code>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="italic text-white">Italics</span>
                <code className="text-[#609fda] bg-black/40 px-1.5 py-0.5 rounded font-mono">*text* or _text_</code>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="underline text-white">Underline</span>
                <code className="text-[#609fda] bg-black/40 px-1.5 py-0.5 rounded font-mono">__text__</code>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="line-through text-white">Strikethrough</span>
                <code className="text-[#609fda] bg-black/40 px-1.5 py-0.5 rounded font-mono">~~text~~</code>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="text-white flex items-center gap-1.5"><span className="text-[12px] opacity-70">•</span> Bullet List</span>
                <code className="text-[#609fda] bg-black/40 px-1.5 py-0.5 rounded font-mono">- text or • text</code>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="text-white/60 text-[11px]">Subtext / Small Text</span>
                <code className="text-[#609fda] bg-black/40 px-1.5 py-0.5 rounded font-mono">-# text</code>
              </div>
            </div>
          </div>
        )}

        <div className="w-full bg-[#161616] border border-white/5 rounded-xl overflow-hidden flex flex-col focus-within:border-white/10 transition-colors">
          <textarea
            ref={textareaRef}
            placeholder="Tell people about yourself..."
            value={bio}
            onChange={(e) => {
              let val = e.target.value;
              if (val.split('\n').length > 5) {
                val = val.split('\n').slice(0, 5).join('\n');
              }
              setBio(val.slice(0, 200));
            }}
            className="w-full min-h-[140px] bg-transparent p-4 text-[13px] text-white placeholder:text-white/30 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => insertFormat("**", "**")}
                title="Bold (**text**)"
                className="w-6.5 h-6.5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
              </button>
              <button
                type="button"
                onClick={() => insertFormat("*", "*")}
                title="Italics (*text*)"
                className="w-6.5 h-6.5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
              </button>
              <button
                type="button"
                onClick={() => insertFormat("__", "__")}
                title="Underline (__text__)"
                className="w-6.5 h-6.5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>
              </button>
              <button
                type="button"
                onClick={() => insertFormat("~~", "~~")}
                title="Strikethrough (~~text~~)"
                className="w-6.5 h-6.5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>
              </button>
              <button
                type="button"
                onClick={() => insertFormat("- ", "")}
                title="Bullet List (- text)"
                className="w-6.5 h-6.5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
              </button>
              <button
                type="button"
                onClick={() => insertFormat("-# ", "")}
                title="Subtext (-# text)"
                className="w-6.5 h-6.5 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-mono text-[10px] font-semibold tracking-tighter"
              >
                -#
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
