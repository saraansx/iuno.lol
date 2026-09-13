"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SearchTrack = {
  id: string;
  title: string;
  artist: string;
  artwork: string | null;
};

// ponytail: placeholder rows until search API lands. Replace MOCK with fetch results.
const MOCK: SearchTrack[] = [
  { id: "1", title: "Frail", artist: "Evi", artwork: null },
  { id: "2", title: "Midnight Drive", artist: "Neon Coast", artwork: null },
  { id: "3", title: "Glass Hearts", artist: "Aurora Lines", artwork: null },
];

export default function SearchTracksModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (track: SearchTrack) => void;
}) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const results = q
    ? MOCK.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q)
      )
    : [];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[560px] bg-[#0c0c0c] border border-white/10 rounded-[24px] shadow-2xl z-10 overflow-hidden"
          >
            <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
              <h3 className="text-[15px] font-normal text-white tracking-tight">Search Tracks</h3>
              <p className="text-[12.5px] text-white/40 mt-0.5">
                Search for a track and import the available metadata automatically.
              </p>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-10 focus-within:border-white/15 transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 shrink-0 mr-2.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a song..."
                  className="w-full bg-transparent text-[13px] text-white placeholder:text-white/25 focus:outline-none"
                />
              </div>

              {q === "" || results.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#609fda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                  <p className="text-[14px] font-normal text-white">Search for a song</p>
                  <p className="text-[12.5px] text-white/40 mt-1">
                    Find a track and view available audio, artwork, and lyrics.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 py-3 max-h-[300px] overflow-y-auto">
                  {results.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelect(t);
                        setQuery("");
                        onClose();
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#161616] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white truncate">{t.title}</p>
                        <p className="text-[12px] text-white/40 truncate">{t.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
