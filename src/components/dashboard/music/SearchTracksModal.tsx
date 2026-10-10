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
  lyrics?: Array<{ text: string; start: number; end: number }> | null;
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

function parseLRC(text: string): Array<{ text: string; start: number; end: number }> {
  const lines: Array<{ text: string; start: number }> = [];
  for (const raw of text.split("\n")) {
    const m = raw.match(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)/);
    if (!m || !m[4]?.trim()) continue;
    let ms = (parseInt(m[1]) * 60 + parseInt(m[2])) * 1000;
    const frac = m[3] ?? "";
    if (frac.length === 3) ms += parseInt(frac);
    else if (frac.length === 2) ms += parseInt(frac) * 10;
    else if (frac.length === 1) ms += parseInt(frac) * 100;
    lines.push({ text: m[4].trim().slice(0, 300), start: ms });
  }
  lines.sort((a, b) => a.start - b.start);
  return lines.slice(0, 300).map((l, i) => ({
    text: l.text,
    start: l.start,
    end: lines[i + 1]?.start ?? l.start + 4000,
  }));
}

function UploadTrackForm({ onDone }: { onDone: (track: SearchTrack) => void }) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [lrc, setLrc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadOne = async (file: File, assetType: string) => {
    const fd = new FormData();
    fd.append("fileToUpload", file);
    fd.append("assetType", assetType);
    const res = await fetch("/api/upload", { method: "POST", body: fd, signal: AbortSignal.timeout(30_000) });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) throw new Error(data?.error || "Upload failed");
    return data.url as string;
  };

  const probeDuration = (url: string) =>
    new Promise<number | null>((resolve) => {
      const a = new Audio(url);
      const to = window.setTimeout(() => {
        try { a.src = ""; } catch {}
        resolve(null);
      }, 15000);
      a.preload = "metadata";
      a.onloadedmetadata = () => {
        window.clearTimeout(to);
        resolve(Number.isFinite(a.duration) && a.duration > 0 ? Math.round(a.duration) : null);
        try { a.src = ""; } catch {}
      };
      a.onerror = () => {
        window.clearTimeout(to);
        resolve(null);
      };
      a.src = url;
    });

  const submit = async () => {
    if (!audioFile || !coverFile || busy) return;
    setBusy(true);
    setError(null);
    try {
      const streamUrl = await uploadOne(audioFile, "track");
      const artwork = await uploadOne(coverFile, "artwork");
      const duration = await probeDuration(streamUrl);
      const lyrics = lrc.trim() ? parseLRC(lrc) : null;
      onDone({
        id: `custom-${Date.now().toString(36)}`,
        title: title.trim() || audioFile.name.replace(/\.[^.]+$/, "") || "Untitled",
        artist: artist.trim() || "Unknown artist",
        artwork,
        album: null,
        duration,
        streamUrl,
        lyrics: lyrics && lyrics.length > 0 ? lyrics : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-1">
      <label className="w-full border border-dashed border-white/[0.12] hover:border-[#5b6cf5]/50 rounded-2xl bg-[#141414]/40 px-4 py-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
        <input
          type="file"
          accept="audio/mpeg,audio/mp3,audio/mp4,audio/m4a,audio/ogg,audio/flac,audio/wav,audio/*"
          className="hidden"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
        />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 mb-2">
          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
        </svg>
        <span className="text-[13px] text-white/80">
          {audioFile ? audioFile.name : "Choose an audio file"}
        </span>
        <span className="text-[11.5px] text-white/35 mt-1">MP3, M4A, OGG, FLAC or WAV · up to 15MB</span>
      </label>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] text-white/40">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Song title"
          className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] text-white/40">Artist</label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          maxLength={200}
          placeholder="Artist name"
          className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
        />
      </div>

      <label className="w-full border border-white/5 hover:border-white/15 rounded-2xl bg-[#141414]/40 px-4 py-3.5 flex items-center gap-3 cursor-pointer transition-colors">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
        />
        <span className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
            <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.5-3.5a2 2 0 0 0-3 0L6 20" />
          </svg>
        </span>
        <span className="flex flex-col">
          <span className="text-[13px] text-white/80">{coverFile ? coverFile.name : "Cover art"}</span>
          <span className="text-[11.5px] text-white/35">Square image works best · required</span>
        </span>
      </label>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] text-white/40">Lyrics <span className="text-white/25">(optional, LRC format)</span></label>
        <textarea
          value={lrc}
          onChange={(e) => setLrc(e.target.value)}
          rows={3}
          placeholder={"[00:12.00] First line\n[00:16.50] Second line"}
          className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5 text-[13px] font-mono text-white placeholder:text-white/25 resize-y focus:outline-none focus:border-white/10"
        />
      </div>

      {error ? <p className="text-[12.5px] text-red-400">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={!audioFile || !coverFile || busy}
        className="w-full h-10 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white text-[13px] font-normal transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {busy ? (
          <span className="w-4 h-4 rounded-full border-2 border-white/15 border-t-[#5b6cf5] animate-spin" />
        ) : (
          "Upload track"
        )}
      </button>
    </div>
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
  const audioTrackIdRef = useRef<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [bufferingId, setBufferingId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [view, setView] = useState<"choose" | "search" | "upload">("choose");
  const activeLyricRef = useRef<HTMLParagraphElement | null>(null);
  const lyricsScrollRef = useRef<HTMLDivElement | null>(null);

  const stopPreview = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    audioTrackIdRef.current = null;
    setPlayingId(null);
    setBufferingId(null);
    setElapsed(0);
  };

  const endPreview = () => {
    stopPreview();
    lyricsScrollRef.current?.scrollTo({ top: 0 });
  };

  const pausePreview = () => {
    audioRef.current?.pause();
    setPlayingId(null);
    setBufferingId(null);
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
      setView("choose");
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
    if (
      audioRef.current &&
      audioTrackIdRef.current === t.id &&
      playingId === null &&
      bufferingId === null
    ) {
      const audio = audioRef.current;
      setBufferingId(t.id);
      audio.play().catch(() => setBufferingId(null));
      return;
    }
    if (playingId === t.id || bufferingId === t.id) {
      pausePreview();
      return;
    }
    stopPreview();
    lyricsScrollRef.current?.scrollTo({ top: 0 });
    const audio = new Audio(t.streamUrl);
    audio.preload = "auto";
    audioRef.current = audio;
    audioTrackIdRef.current = t.id;
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
    audio.addEventListener("ended", endPreview);
    audio.addEventListener("error", stopPreview);
    audio.play().catch(stopPreview);
  };

  const previewMs = elapsed * 1000;
  const isPreviewingSelected =
    selectedTrack !== null &&
    (playingId === selectedTrack.id || bufferingId === selectedTrack.id);
  const GAP_MS = 3000;
  const EDGE_MS = 300;
  const LINE_EARLY_MS = 0;
  type DisplayItem =
    | { kind: "line"; line: LyricLine; idx: number }
    | { kind: "music"; key: string };
  const displayItems: DisplayItem[] = [];
  {
    if (lyricLines.length > 0) {
      displayItems.push({ kind: "music", key: "intro" });
    }
    lyricLines.forEach((l, i) => {
      displayItems.push({ kind: "line", line: l, idx: i });
      const next = lyricLines[i + 1];
      if (next && next.start - l.end > GAP_MS) {
        displayItems.push({ kind: "music", key: `gap-${i}` });
      }
    });
    if (lyricLines.length > 0) {
      displayItems.push({ kind: "music", key: "outro" });
    }
  }

  const isPlayingSelected =
    selectedTrack !== null && playingId === selectedTrack.id;

  const activeMusicKey: string | null =
    isPlayingSelected && lyricLines.length > 0
      ? (() => {
          const first = lyricLines[0];
          if (previewMs < first.start - LINE_EARLY_MS) return "intro";
          for (let i = 0; i < lyricLines.length - 1; i++) {
            const l = lyricLines[i];
            const next = lyricLines[i + 1];
            if (
              next.start - l.end > GAP_MS &&
              previewMs > l.end + EDGE_MS &&
              previewMs < next.start - LINE_EARLY_MS
            ) {
              return `gap-${i}`;
            }
          }
          const last = lyricLines[lyricLines.length - 1];
          if (previewMs > last.end + EDGE_MS) {
            return "outro";
          }
          return null;
        })()
      : null;

  const activeLineIdx =
    isPlayingSelected && lyricLines.length > 0 && activeMusicKey === null
      ? lyricLines.findIndex((l, i) => {
          const next = lyricLines[i + 1];
          return (
            previewMs >= l.start - LINE_EARLY_MS &&
            (next ? previewMs < next.start : previewMs <= l.end + 4000)
          );
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
  }, [activeLineIdx, activeMusicKey]);

  useEffect(() => {
    lyricsScrollRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

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
  const emptyActive = query.trim() !== "";
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`relative w-full ${results.length > 0 ? "max-w-[900px]" : "max-w-[560px]"} max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[24px] shadow-2xl z-10 overflow-hidden transition-all duration-200`}
          >
            <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
              <h3 className="text-[15px] font-normal text-white tracking-tight">Search Tracks</h3>
              <p className="text-[12.5px] text-white/40 mt-0.5">
                Select a track to preview audio and lyrics, then add it.
              </p>
            </div>

            <div className="px-6 py-4 flex-1 min-h-0 overflow-y-auto">
              {view === "choose" ? (
                <div className="flex flex-col gap-3 py-1">
                  <button
                    type="button"
                    onClick={() => setView("search")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#141414]/70 hover:bg-[#161616] border border-white/5 hover:border-white/15 text-left transition-all cursor-pointer"
                  >
                    <span className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <span className="flex-1 min-w-0 flex flex-col">
                      <span className="flex items-center gap-2">
                        <span className="text-[13.5px] font-medium text-white">Search</span>
                        <span className="text-[10px] font-medium text-white bg-[#2b3280] border border-[#5b6cf5]/50 rounded-full px-2 py-0.5">Recommended</span>
                      </span>
                      <span className="text-[12px] text-white/40 mt-0.5">Find any song with artwork and synced lyrics.</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("upload")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#141414]/70 hover:bg-[#161616] border border-white/5 hover:border-white/15 text-left transition-all cursor-pointer"
                  >
                    <span className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </span>
                    <span className="flex-1 min-w-0 flex flex-col">
                      <span className="text-[13.5px] font-medium text-white">Upload</span>
                      <span className="text-[12px] text-white/40 mt-0.5">Upload your own MP3 file with custom cover art.</span>
                    </span>
                  </button>
                </div>
              ) : (
              <>
              {(
                <button
                  type="button"
                  onClick={() => { stopPreview(); setView("choose"); }}
                  className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/80 transition-colors cursor-pointer mb-3"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back
                </button>
              )}
              {view === "upload" ? (
                <UploadTrackForm
                  onDone={(t) => {
                    stopPreview();
                    onSelect(t);
                    setQuery("");
                    onClose();
                  }}
                />
              ) : (
              <>
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
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-[#5b6cf5] animate-spin shrink-0 ml-2" />
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
                    {results.slice(0, 4).map((t) => {
                      const rowDur = formatDuration(t.duration);
                      const isSelected = t.id === selectedTrack.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            if (t.id !== selectedId) stopPreview();
                            setSelectedId(t.id);
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                            isSelected
                              ? "bg-[#5b6cf5]/10 border border-[#5b6cf5]/25"
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

                  <div className="flex-1 min-w-0 basis-0 self-start flex flex-col rounded-2xl border border-white/[0.07] bg-[#101010]/80 backdrop-blur-md overflow-hidden">
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
                              ? "bg-[#5b6cf5]/30 text-white shadow-[0_0_15px_rgba(91,108,245,0.1)]"
                              : "bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white shadow-[0_0_15px_rgba(91,108,245,0.1)]"
                          }`}
                        >
                          {buffering ? (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/15 border-t-[#5b6cf5] animate-spin shrink-0" />
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
                    <div ref={lyricsScrollRef} className="relative flex-1 min-h-0 max-h-[118px] overflow-hidden px-4 py-3">
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
                              <span className="w-4 h-4 rounded-full border-2 border-white/15 border-t-[#5b6cf5] animate-spin" />
                            </div>
                          ) : lyricLines.length === 0 ? (
                            <p className="text-[13px] text-white/50 blur-[2.5px] opacity-70 select-none text-center py-8">
                              ♪
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2.5 py-1">
                              {displayItems.map((item, di) => {
                                if (item.kind === "music") {
                                  const isActiveMusic =
                                    isPreviewingSelected && activeMusicKey === item.key;
                                  return (
                                    <motion.p
                                      key={item.key}
                                      data-lyric-idx={`m-${item.key}`}
                                      ref={isActiveMusic ? activeLyricRef : undefined}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        delay: Math.min(di * 0.02, 0.4),
                                        duration: 0.3,
                                        ease: [0.22, 1, 0.36, 1],
                                      }}
                                      className={`leading-relaxed transition-all duration-300 select-none ${
                                        isActiveMusic
                                          ? "text-[16px] text-white font-medium blur-0 opacity-100"
                                          : !isPreviewingSelected
                                            ? "text-[15px] text-white/50 blur-[2.5px] opacity-70"
                                            : "text-[15px] text-white/45 blur-[3px] opacity-50"
                                      }`}
                                    >
                                      ♪
                                    </motion.p>
                                  );
                                }
                                const l = item.line;
                                const i = item.idx;
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
                                      delay: Math.min(di * 0.02, 0.4),
                                      duration: 0.3,
                                      ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className={`leading-relaxed transition-all duration-300 ${
                                      isActive
                                        ? "text-[16px] text-white font-medium blur-0 opacity-100"
                                        : !isPreviewingSelected
                                          ? "text-[15px] text-white/50 blur-[2.5px] opacity-70 select-none"
                                          : isPast
                                            ? "text-[15px] text-white/35 blur-[3px] opacity-60 select-none"
                                            : "text-[15px] text-white/45 blur-[3.5px] opacity-50 select-none"
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
                        className="w-full h-9 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white text-[13px] font-normal transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
                      >
                        Add track
                      </button>
                    </div>
                  </div>
                </div>
              ) : showEmpty ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className={`flex items-end gap-1 h-8 mb-3 ${emptyActive ? "[&>span]:animate-eq" : ""}`} aria-hidden="true">
                    {[0.5, 0.9, 0.35, 0.7, 1, 0.45, 0.8].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h * 100}%`, animationDelay: `${i * 120}ms` }}
                        className={`w-1 rounded-full bg-[#5b6cf5]/70 ${emptyActive ? "" : "opacity-40"}`}
                      />
                    ))}
                  </div>
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
              </>)}
              </>)}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
