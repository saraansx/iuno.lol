"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchTrack } from "./SearchTracksModal";
import { parseLRC, toLRC } from "./lrc";

type Patch = {
  title: string;
  artist: string;
  artwork: string | null;
  lyrics: Array<{ text: string; start: number; end: number }> | null;
};

const MAX_COVER_MB = 5;

export default function EditTrackModal({
  open,
  track,
  onClose,
  onSave,
}: {
  open: boolean;
  track: SearchTrack | null;
  onClose: () => void;
  onSave: (patch: Patch) => void;
}) {
  return (
    <AnimatePresence>
      {open && track && (
        <EditTrackForm key={track.id} track={track} onClose={onClose} onSave={onSave} />
      )}
    </AnimatePresence>
  );
}

function EditTrackForm({
  track,
  onClose,
  onSave,
}: {
  track: SearchTrack;
  onClose: () => void;
  onSave: (patch: Patch) => void;
}) {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [lrc, setLrc] = useState(() => toLRC(track.lyrics));
  const artwork = track.artwork ?? null;
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!picked) return;
    return () => URL.revokeObjectURL(picked.url);
  }, [picked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const pickCover = (file: File | null) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("The cover must be an image.");
      return;
    }
    if (file.size > MAX_COVER_MB * 1024 * 1024) {
      setError(`The cover must be smaller than ${MAX_COVER_MB}MB.`);
      return;
    }
    setPicked({ file, url: URL.createObjectURL(file) });
  };

  const uploadCover = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("fileToUpload", file);
    fd.append("assetType", "artwork");
    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
      signal: AbortSignal.timeout(30_000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) throw new Error(data?.error || "Cover upload failed");
    return data.url as string;
  };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const nextArtwork = picked ? await uploadCover(picked.file) : artwork;
      const parsedLyrics = lrc.trim() ? parseLRC(lrc) : null;
      onSave({
        title: title.trim() || track.title,
        artist: artist.trim() || track.artist,
        artwork: nextArtwork,
        lyrics: parsedLyrics && parsedLyrics.length > 0 ? parsedLyrics : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the track");
      setBusy(false);
    }
  };

  const previewSrc = picked?.url ?? artwork;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Edit track"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-[480px] max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[24px] shadow-2xl z-10 overflow-hidden"
      >
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-white/[0.06] shrink-0">
          <h3 className="text-[15px] font-normal text-white tracking-tight">Edit track</h3>
          <p className="text-[12.5px] text-white/40 mt-0.5">
            Change the cover, title, artist or lyrics. The audio stays as it is.
          </p>
        </div>

        <div className="px-4 sm:px-6 py-4 flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4 py-1">
            <div className="flex items-center gap-3.5">
              <label className="group relative w-20 h-20 rounded-2xl bg-[#141414] border border-white/10 overflow-hidden shrink-0 cursor-pointer transition-colors hover:border-white/25">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickCover(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                {previewSrc ? (
                  <NextImage
                    src={previewSrc}
                    alt=""
                    fill
                    sizes="80px"
                    unoptimized
                    draggable={false}
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-white/35">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.5-3.5a2 2 0 0 0-3 0L6 20" />
                    </svg>
                  </span>
                )}
                <span className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[11px] text-white">
                  Change
                </span>
              </label>

              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[13px] text-white/80">Cover art</span>
                <span className="text-[11.5px] text-white/35 truncate">
                  {picked ? picked.file.name : "Click the cover to replace it"}
                </span>
                <span className="text-[11.5px] text-white/25">Square image works best · up to {MAX_COVER_MB}MB</span>
                {picked && (
                  <button
                    type="button"
                    onClick={() => setPicked(null)}
                    className="text-left text-[11.5px] text-white/45 hover:text-white/80 transition-colors cursor-pointer w-fit"
                  >
                    Undo cover change
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="track-title" className="text-[12.5px] text-white/40">Title</label>
              <input
                id="track-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="Song title"
                className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="track-artist" className="text-[12.5px] text-white/40">Artist</label>
              <input
                id="track-artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                maxLength={200}
                placeholder="Artist name"
                className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="track-lyrics" className="text-[12.5px] text-white/40">
                Lyrics <span className="text-white/25">(optional, LRC format)</span>
              </label>
              <textarea
                id="track-lyrics"
                value={lrc}
                onChange={(e) => setLrc(e.target.value)}
                rows={4}
                placeholder={"[00:12.00] First line\n[00:16.50] Second line"}
                className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5 text-[13px] font-mono text-white placeholder:text-white/25 resize-y focus:outline-none focus:border-white/10"
              />
            </div>

            {error ? <p className="text-[12.5px] text-red-400">{error}</p> : null}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-9 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] text-[13px] text-white/70 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="h-9 px-4 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white text-[13px] font-normal transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[96px]"
          >
            {busy ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/15 border-t-[#5b6cf5] animate-spin" />
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
