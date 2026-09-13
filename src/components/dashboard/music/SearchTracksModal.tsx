"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
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

type LyricLine = { text: string; start: number; end: number };

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
    // ponytail: unoptimized next/image keeps remote art no-store; add remotePatterns only if caching wanted.
    <NextImage
      src={src}
      alt=""
      width={48}
      height={48}
      unoptimized
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
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [bufferingId, setBufferingId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const activeLyricRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsScrollRef = useRef<HTMLDivElement | null>(null);

  const stopPreview = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
    setBufferingId(null);
    setElapsed(0);
  };

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setLoading(false);
      setSearched(false);
      abortRef.current?.abort();
      stopPreview();
      setSelectedId(null);
      setLyricLines([]);
      setLyricsLoading(false);
    }
  }, [open ]);

  useEffect(
    () => () => {
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
      stopPreview();
      setSelectedId(null);
      setLyricLines([]);
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
        // default-select first track so lyrics panel shows immediately
        setSelectedId((prev) =>
          prev && items.some((i) => i.id === prev) ? prev : (items[0]?.id ?? null),
        );
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

  const selectedTrack = results.find((t) => t.id === selectedId) ?? results[0] ?? null;

  // fetch lyrics for selected track
  useEffect(() => {
    if (!selectedTrack) {
      setLyricLines([]);
      setLyricsLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLyricLines([]);
    setLyricsLoading(true);
    (async () => {
      try {
        const qs = new URLSearchParams({
          id: selectedTrack.id,
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          duration: String(Math.round(selectedTrack.duration ?? 0)),
        });
        const res = await fetch(`/api/music/lyrics?${qs.toString()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Lyrics failed");
        if (ctrl.signal.aborted) return;
        setLyricLines(Array.isArray(data.lines) ? data.lines : []);
      } catch {
        if (!ctrl.signal.aborted) setLyricLines([]);
      } finally {
        if (!ctrl.signal.aborted) setLyricsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [selectedTrack]);

  const togglePreview = (t: SearchTrack) => {
    if (!t.streamUrl) return;
    if (playingId === t.id || bufferingId === t.id) {
      stopPreview();
      return;
    }
    stopPreview();
    // retry once at 128 on stall/error (lighter evi transcode)
    const urls =
      t.streamUrl.includes("quality=320")
        ? [t.streamUrl, t.streamUrl.replace("quality=320", "quality=128")]
        : [t.streamUrl];
    let attempt = 0;
    const playAttempt = () => {
      const url = urls[attempt];
      if (!url) return stopPreview();
      const audio = new Audio(url);
      audio.preload = "auto";
      audioRef.current = audio;
      setBufferingId(t.id);
      if (attempt === 0) setElapsed(0);
      const tick = () => setElapsed(audio.currentTime);
      const onPlaying = () => {
        setBufferingId(null);
        setPlayingId(t.id);
      };
      const onWaiting = () => {
        if (audioRef.current === audio) setBufferingId(t.id);
      };
      const onError = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
          attempt += 1;
          if (attempt < urls.length) playAttempt();
          else stopPreview();
        }
      };
      audio.addEventListener("timeupdate", tick);
      audio.addEventListener("playing", onPlaying);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("ended", stopPreview);
      audio.addEventListener("error", onError);
      audio.play().catch(onError);
    };
    playAttempt();
  };

  const previewMs = elapsed * 1000;
  const isPreviewingSelected =
    selectedTrack !== null &&
    (playingId === selectedTrack.id || bufferingId === selectedTrack.id);
  const activeLineIdx =
    selectedTrack && playingId === selectedTrack.id && lyricLines.length > 0
      ? lyricLines.findIndex((l, i) => {
          const next = lyricLines[i + 1];
          return previewMs >= l.start && (next ? previewMs < next.start : previewMs <= l.end + 4000);
        })
      : -1;

  useEffect(() => {
    if (activeLineIdx < 0) return;
    const container = lyricsScrollRef.current;
    if (!container) return;
    const active =
      activeLyricRef.current ??
      container.querySelector<HTMLElement>(`[data-lyric-idx="${activeLineIdx}"]`);
    if (!active) return;
    const cRect = container.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    const top =
      container.scrollTop +
      (aRect.top - cRect.top) -
      container.clientHeight / 2 +
      aRect.height / 2;
    container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [activeLineIdx]);

  // reset scroll on track switch so new lyrics animate in from top
  useEffect(() => {
    lyricsScrollRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  // block manual scroll (wheel/touch) — auto-scroll only
  useEffect(() => {
    const el = lyricsScrollRef.current;
    if (!el) return;
    const prevent = (e: Event) => e.preventDefault();
    el.addEventListener("wheel", prevent, { passive: false });
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      el.removeEventListener("wheel", prevent);
      el.removeEventListener("touchmove", prevent);
    };
  }, [selectedId, lyricLines.length]);

  const showEmpty = query.trim() === "" || (!loading && !error && searched && results.length === 0) || (!loading && !error && !searched);
  const playing = selectedTrack !== null && playingId === selectedTrack.id;
  const buffering = selectedTrack !== null && bufferingId === selectedTrack.id;
  const previewActive = playing || buffering;
  const dur = formatDuration(selectedTrack?.duration);

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
            className={`relative w-full ${results.length > 0 ? "max-w-[900px]" : "max-w-[560px]"} max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[24px] shadow-2xl z-10 overflow-hidden transition-all duration-200`}
          >
            <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
              <h3 className="text-[15px] font-normal text-white tracking-tight">Search Tracks</h3>
              <p className="text-[12.5px] text-white/40 mt-0.5">
                Select a track to preview audio and lyrics, then add it.
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
              ) : results.length > 0 && selectedTrack ? (
                <div className="flex gap-4 py-3 min-h-0">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0 basis-0">
                    {results.slice(0, 5).map((t) => {
                      const rowDur = formatDuration(t.duration);
                      const isSelected = t.id === selectedTrack.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedId(t.id)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                            isSelected
                              ? "bg-[#609fda]/10 border border-[#609fda]/25"
                              : "border border-transparent hover:bg-white/[0.05]"
                          }`}
                        >
                          <span className="w-10 h-10 rounded-lg bg-[#161616] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            <Artwork src={t.artwork} />
                          </span>
                          <span className="flex-1 min-w-0 flex flex-col">
                            <span className="text-[13px] text-white truncate block">{t.title}</span>
                            <span className="text-[12px] text-white/40 truncate block">{t.artist}</span>
                          </span>
                          {rowDur && (
                            <span className="text-[11.5px] font-mono text-white/30 shrink-0">{rowDur}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-1 min-w-0 basis-0 h-[324px] flex flex-col rounded-2xl border border-white/[0.07] bg-[#101010]/80 backdrop-blur-md overflow-hidden">
                    <div className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-white/[0.06] shrink-0">
                      <span className="w-11 h-11 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <Artwork src={selectedTrack.artwork} />
                      </span>
                      <span className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[13px] text-white truncate block">{selectedTrack.title}</span>
                        <span className="text-[11.5px] text-white/40 truncate block">
                          {selectedTrack.artist}{dur ? ` · ${dur}` : ""}
                        </span>
                      </span>
                      {selectedTrack.streamUrl && (
                        <button
                          type="button"
                          onClick={() => togglePreview(selectedTrack)}
                          title={previewActive ? "Stop preview" : "Play preview"}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            previewActive
                              ? "bg-[#609fda]/30 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]"
                              : "bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]"
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
                    </div>
                    {(playing || buffering) && typeof selectedTrack.duration === "number" && selectedTrack.duration > 0 && (
                      <div className="h-[2px] bg-white/5 shrink-0">
                        <div className="h-full bg-[#609fda]" style={{ width: `${Math.min(100, (elapsed / (selectedTrack.duration ?? 1)) * 100)}%` }} />
                      </div>
                    )}

                    <div ref={lyricsScrollRef} className="relative flex-1 min-h-0 max-h-[220px] overflow-y-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={`${selectedTrack.id}-${lyricsLoading ? "loading" : "loaded"}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {lyricsLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <span className="w-4 h-4 rounded-full border-2 border-white/15 border-t-[#609fda] animate-spin" />
                            </div>
                          ) : lyricLines.length === 0 ? (
                            <p className="text-[12.5px] text-white/40 text-center py-8">No lyrics found.</p>
                          ) : (
                            <div className="flex flex-col gap-2 py-1">
                              {lyricLines.map((l, i) => {
                                const isActive = i === activeLineIdx;
                                const isPast = activeLineIdx >= 0 && i < activeLineIdx;
                                return (
                                  <motion.p
                                    key={`${l.start}-${i}`}
                                    data-lyric-idx={i}
                                    ref={isActive ? activeLyricRef : undefined}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      delay: Math.min(i * 0.02, 0.4),
                                      duration: 0.3,
                                      ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className={`text-[13px] leading-relaxed transition-all duration-300 ${
                                      isActive
                                        ? "text-white font-normal blur-0 opacity-100"
                                        : !isPreviewingSelected
                                          ? "text-white/50 blur-[2.5px] opacity-70 select-none"
                                          : isPast
                                            ? "text-white/35 blur-[3px] opacity-60 select-none"
                                            : "text-white/45 blur-[3.5px] opacity-50 select-none"
                                    }`}
                                  >
                                    {l.text}
                                  </motion.p>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          stopPreview();
                          onSelect(selectedTrack);
                          setQuery("");
                          onClose();
                        }}
                        className="w-full h-9 rounded-xl bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white text-[13px] font-normal transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer"
                      >
                        Add track
                      </button>
                    </div>
                  </div>
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
