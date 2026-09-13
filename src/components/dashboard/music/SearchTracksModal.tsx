"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SearchTrack = {
  id: string;
  title: string;
  artist: string;
  artwork: string | null;
  album?: string | null;
  duration?: number | null;
  streamUrl?: string | null;
};

function formatDuration(sec: number | null | undefined): string | null {
  if (typeof sec !== "number" || !Number.isFinite(sec) || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Artwork({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  return (
    // ponytail: plain <img> over next/image. Remote art is unoptimized + no-store; upgrade to allowlisted remotePatterns only if caching wanted.
    <img
      src={src}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className="w-full h-full object-cover"
    />
  );
}

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
  const [results, setResults] = useState<SearchTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [bufferingId, setBufferingId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setLoading(false);
      setSearched(false);
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
      setBufferingId(null);
      setElapsed(0);
    }
  }, [open ]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      setSearched(false);
      abortRef.current?.abort();
      return;
    }

    setError(null);
    abortRef.current?.abort();
    const t = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Search failed");
        }
        const items: SearchTrack[] = Array.isArray(data.results) ? data.results : [];
        // preload all artwork in bg, then paint rows together
        await Promise.allSettled(
          items
            .map((t) => t.artwork)
            .filter((src): src is string => typeof src === "string" && src !== "")
            .map(
              (src) =>
                new Promise<void>((resolve) => {
                  if (ctrl.signal.aborted) return resolve();
                  const img = new Image();
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                  img.src = src;
                }),
            ),
        );
        if (ctrl.signal.aborted) return;
        setResults(items);
        setSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 700);

    return () => clearTimeout(t);
  }, [query]);

  const stopPreview = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
    setBufferingId(null);
    setElapsed(0);
  };

  const togglePreview = (t: SearchTrack) => {
    if (!t.streamUrl) return;
    if (playingId === t.id || bufferingId === t.id) {
      stopPreview();
      return;
    }
    stopPreview();
    const audio = new Audio(t.streamUrl);
    audio.preload = "auto";
    audioRef.current = audio;
    setBufferingId(t.id);
    setElapsed(0);
    const tick = () => setElapsed(audio.currentTime);
    const onPlaying = () => {
      setBufferingId(null);
      setPlayingId(t.id);
    };
    const onWaiting = () => {
      if (audioRef.current === audio) setBufferingId(t.id);
    };
    audio.addEventListener("timeupdate", tick);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("ended", stopPreview);
    audio.addEventListener("error", stopPreview);
    timerRef.current = setTimeout(stopPreview, 30_000);
    audio.play().catch(stopPreview);
  };

  const showEmpty = query.trim() === "" || (!loading && !error && searched && results.length === 0) || (!loading && !error && !searched);

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
            className="relative w-full max-w-[560px] max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[24px] shadow-2xl z-10 overflow-hidden"
          >
            <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
              <h3 className="text-[15px] font-normal text-white tracking-tight">Search Tracks</h3>
              <p className="text-[12.5px] text-white/40 mt-0.5">
                Search for a track and import the available metadata automatically.
              </p>
            </div>

            <div className="px-6 py-4 flex-1 min-h-0 overflow-y-auto">
              <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-10 focus-within:border-white/15 transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 shrink-0 mr-2.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a song..."
                  autoFocus
                  className="w-full bg-transparent text-[13px] text-white placeholder:text-white/25 focus:outline-none"
                />
                {loading && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-[#609fda] animate-spin shrink-0 ml-2" />
                )}
              </div>

              {error ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <p className="text-[14px] font-normal text-white">Search failed</p>
                  <p className="text-[12.5px] text-white/40 mt-1">{error}</p>
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col gap-1.5 py-3">
                  {results.slice(0, 5).map((t) => {
                    const dur = formatDuration(t.duration);
                    const playing = playingId === t.id;
                    const buffering = bufferingId === t.id;
                    const active = playing || buffering;
                    return (
                      <div
                        key={t.id}
                        className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            stopPreview();
                            onSelect(t);
                            setQuery("");
                            onClose();
                          }}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                        >
                          <span className="w-10 h-10 rounded-lg bg-[#161616] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            <Artwork src={t.artwork} />
                          </span>
                          <span className="flex-1 min-w-0 flex flex-col">
                            <span className="text-[13px] text-white truncate block">{t.title}</span>
                            <span className="text-[12px] text-white/40 truncate block">{t.artist}</span>
                          </span>
                          {dur && (
                            <span className="text-[11.5px] font-mono text-white/30 shrink-0">{dur}</span>
                          )}
                        </button>
                        {t.streamUrl && (
                          <button
                            type="button"
                            onClick={() => togglePreview(t)}
                            title={active ? "Stop 30s preview" : "Play 30s preview"}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              active
                                ? "bg-[#609fda]/20 border-[#609fda]/30 text-white"
                                : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                            }`}
                          >
                            {buffering ? (
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-[#609fda] animate-spin shrink-0" />
                            ) : playing ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5.5v13l11-6.5-11-6.5z" />
                              </svg>
                            )}
                          </button>
                        )}
                        {playing && (
                          <div className="absolute bottom-0 left-0 h-[2px] bg-[#609fda] transition-none" style={{ width: `${Math.min(100, (elapsed / 30) * 100)}%` }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : showEmpty ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#609fda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                  <p className="text-[14px] font-normal text-white">
                    {loading ? "Searching..." : query.trim() === "" ? "Search for a song" : "No tracks found"}
                  </p>
                  <p className="text-[12.5px] text-white/40 mt-1">
                    {query.trim() === ""
                      ? "Find a track and view available audio, artwork, and lyrics."
                      : loading
                        ? "Fetching live results."
                        : "Try a different title or artist."}
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
