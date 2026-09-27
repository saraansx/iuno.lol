"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/toast";
import { imageHostFileId } from "@/lib/cdn";

type FilterKey = "all" | "image" | "video" | "favorite";

interface GalleryFile {
  id: number;
  url: string;
  name: string;
  size: number;
  kind: string;
  favorite: boolean;
  createdAt: number;
}

const PAGE_SIZE = 24;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
  { key: "favorite", label: "Favorites" },
];

const MENU_ITEM =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-white/80 hover:bg-white/[0.06] transition-colors";
const MENU_ITEM_DANGER =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-red-400 hover:bg-red-500/10 transition-colors";

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const rounded = value >= 100 || i === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[i]}`;
}

function sharePath(file: GalleryFile): string {
  const id = imageHostFileId(file.url);
  return id ? `/f/${id}` : file.url;
}

function shareLink(file: GalleryFile): string {
  const path = sharePath(file);
  if (path.startsWith("/") && typeof window !== "undefined") return `${window.location.origin}${path}`;
  return path;
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function Thumbnail({ file }: { file: GalleryFile }) {
  if (file.kind === "video") {
    return (
      <>
        <video src={file.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
  );
}

export default function ImageHostGalleryClient() {
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewer, setViewer] = useState<GalleryFile | null>(null);

  const filterRef = useRef<FilterKey>("all");
  filterRef.current = filter;

  const loadPage = useCallback((f: FilterKey, off: number, append: boolean) => {
    fetch(`/api/image-host/files?limit=${PAGE_SIZE}&offset=${off}&filter=${f}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((data: { files: GalleryFile[]; total: number; hasMore: boolean }) => {
        setFiles((prev) => (append ? [...prev, ...data.files] : data.files));
        setTotal(data.total);
        setHasMore(data.hasMore);
        setOffset(off + data.files.length);
      })
      .catch(() => {
        if (!append) {
          setFiles([]);
          setTotal(0);
          setHasMore(false);
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, []);

  useEffect(() => {
    loadPage("all", 0, false);
  }, [loadPage]);

  useEffect(() => {
    const onUploaded = () => loadPage(filterRef.current, 0, false);
    window.addEventListener("image-host:uploaded", onUploaded);
    return () => window.removeEventListener("image-host:uploaded", onUploaded);
  }, [loadPage]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-ih-menu]")) setMenuOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpenId(null);
        setConfirmDelete(null);
        setViewer(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const changeFilter = (f: FilterKey) => {
    if (f === filter) return;
    setFilter(f);
    setSelected(new Set());
    setMenuOpenId(null);
    setOffset(0);
    setLoading(true);
    loadPage(f, 0, false);
  };

  const loadMore = () => {
    setLoadingMore(true);
    loadPage(filter, offset, true);
  };

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allLoadedSelected = files.length > 0 && files.every((f) => selected.has(f.id));
  const toggleSelectAll = () =>
    setSelected(allLoadedSelected ? new Set() : new Set(files.map((f) => f.id)));
  const clearSelection = () => setSelected(new Set());
  const toggleMenu = (id: number) => setMenuOpenId((cur) => (cur === id ? null : id));

  const copyLink = async (file: GalleryFile) => {
    setMenuOpenId(null);
    try {
      await navigator.clipboard.writeText(shareLink(file));
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const toggleFavorite = async (file: GalleryFile) => {
    setMenuOpenId(null);
    const next = !file.favorite;
    setFiles((prev) => {
      let updated = prev.map((x) => (x.id === file.id ? { ...x, favorite: next } : x));
      if (filterRef.current === "favorite" && !next) updated = updated.filter((x) => x.id !== file.id);
      return updated;
    });
    if (filterRef.current === "favorite" && !next) setTotal((t) => Math.max(0, t - 1));
    try {
      const res = await fetch("/api/image-host/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [file.id], favorite: next }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success(next ? "Added to favorites" : "Removed from favorites");
    } catch {
      toast.error("Couldn't update favorite");
      loadPage(filterRef.current, 0, false);
    }
  };

  const bulkFavorite = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setFiles((prev) => prev.map((x) => (selected.has(x.id) ? { ...x, favorite: true } : x)));
    setSelected(new Set());
    try {
      const res = await fetch("/api/image-host/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, favorite: true }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success(`Added ${ids.length} to favorites`);
    } catch {
      toast.error("Couldn't update favorites");
      loadPage(filterRef.current, 0, false);
    }
  };

  const runDelete = async () => {
    if (!confirmDelete) return;
    const ids = confirmDelete;
    setDeleting(true);
    try {
      const res = await fetch("/api/image-host/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = res.ok ? await res.json() : null;
      if (!data || !Array.isArray(data.deletedIds)) throw new Error("failed");
      const removed = new Set<number>(data.deletedIds as number[]);
      setFiles((prev) => prev.filter((x) => !removed.has(x.id)));
      setTotal((t) => Math.max(0, t - removed.size));
      setSelected((prev) => {
        const nextSel = new Set(prev);
        removed.forEach((id) => nextSel.delete(id));
        return nextSel;
      });
      if (typeof data.usedBytes === "number") {
        window.dispatchEvent(new CustomEvent("image-host:usage", { detail: { usedBytes: data.usedBytes } }));
      }
      toast.success(removed.size === 1 ? "File deleted" : `${removed.size} files deleted`);
    } catch {
      toast.error("Couldn't delete. Try again.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
      setMenuOpenId(null);
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Gallery</h2>
          <p className="text-white/30 text-[12px] mt-1">
            {total > 0
              ? `${total} file${total === 1 ? "" : "s"} in your image host.`
              : "All your uploaded files."}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => changeFilter(f.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key ? "bg-[#5b6cf5]/20 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5b6cf5]/20 bg-[#5b6cf5]/[0.06] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button onClick={toggleSelectAll} className="text-[12px] text-white/60 hover:text-white transition-colors">
              {allLoadedSelected ? "Deselect all" : "Select all"}
            </button>
            <span className="text-[13px] text-white/80">{selected.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={bulkFavorite}
              className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/10 transition-colors"
            >
              <StarIcon /> Add to favorites
            </button>
            <button
              onClick={() => setConfirmDelete([...selected])}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <TrashIcon /> Delete
            </button>
            <button onClick={clearSelection} className="rounded-lg px-2 py-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/5 p-1.5">
                <div className="aspect-[4/3] w-full rounded-lg bg-white/5 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-white/5 animate-pulse mt-2.5 ml-1.5" />
                <div className="h-2.5 w-1/2 rounded bg-white/5 animate-pulse mt-1.5 mb-1 ml-1.5" />
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="py-16 text-center text-white/40 text-[13px]">
            {filter === "all"
              ? "No files yet. Upload something above to get started."
              : `No ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} yet.`}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {files.map((f) => (
                <FileCard key={f.id} file={f} selected={selected.has(f.id)} menuOpen={menuOpenId === f.id}
                  onToggleSelect={toggleSelect} onToggleMenu={toggleMenu} onCopy={copyLink} onOpen={setViewer}
                  onToggleFavorite={toggleFavorite} onRequestDelete={setConfirmDelete} onCloseMenu={() => setMenuOpenId(null)} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-5 flex justify-center">
                <button onClick={loadMore} disabled={loadingMore}
                  className="rounded-xl bg-white/[0.06] border border-white/10 px-5 py-2 text-[13px] text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50">
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => !deleting && setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl"
          >
            <h3 className="text-[15px] font-medium text-white">
              Delete {confirmDelete.length} file{confirmDelete.length === 1 ? "" : "s"}?
            </h3>
            <p className="mt-2 text-[13px] text-white/50 leading-relaxed">
              This permanently removes {confirmDelete.length === 1 ? "it" : "them"} from your image host and frees the
              storage. This can’t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2 text-[13px] text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={runDelete}
                disabled={deleting}
                className="rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-2 text-[13px] text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {viewer && <Viewer file={viewer} onClose={() => setViewer(null)} />}
      </AnimatePresence>
    </div>
  );
}

function FileCard({
  file,
  selected,
  menuOpen,
  onToggleSelect,
  onToggleMenu,
  onCopy,
  onToggleFavorite,
  onRequestDelete,
  onCloseMenu,
  onOpen,
}: {
  file: GalleryFile;
  selected: boolean;
  menuOpen: boolean;
  onToggleSelect: (id: number) => void;
  onToggleMenu: (id: number) => void;
  onCopy: (file: GalleryFile) => void;
  onToggleFavorite: (file: GalleryFile) => void;
  onRequestDelete: (ids: number[]) => void;
  onCloseMenu: () => void;
  onOpen: (file: GalleryFile) => void;
}) {
  return (
    <div
      className={`group relative rounded-xl bg-white/[0.02] border p-1.5 transition-colors ${
        selected ? "border-[#5b6cf5]/60" : "border-white/5 hover:border-white/10"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(file)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(file);
          }
        }}
        aria-label={`Open ${file.name}`}
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-lg bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b6cf5]/60"
      >
        <Thumbnail file={file} />
        {file.favorite && (
          <div className="absolute bottom-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[#f5c451] backdrop-blur-sm">
            <StarIcon filled />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onToggleSelect(file.id)}
        aria-label={selected ? "Deselect file" : "Select file"}
        className={`absolute top-3 left-3 z-20 flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
          selected
            ? "bg-[#5b6cf5] border-[#5b6cf5] text-white"
            : "bg-black/40 border-white/40 text-transparent backdrop-blur-sm hover:border-white/70"
        }`}
      >
        <CheckIcon />
      </button>

      <div data-ih-menu className="absolute top-3 right-3 z-30">
        <button
          type="button"
          onClick={() => onToggleMenu(file.id)}
          aria-label="File actions"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-sm hover:bg-black/60 hover:text-white transition-colors"
        >
          <DotsIcon />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-full mt-1.5 w-44 origin-top-right rounded-xl border border-white/10 bg-[#161616] p-1 shadow-[0_10px_28px_-6px_rgba(0,0,0,0.55)]"
            >
              <a
                href={sharePath(file)}
                target="_blank"
                rel="noreferrer"
                onClick={onCloseMenu}
                className={MENU_ITEM}
              >
                <ExternalLinkIcon /> Open in new tab
              </a>
              <button type="button" onClick={() => onCopy(file)} className={MENU_ITEM}>
                <CopyIcon /> Copy link
              </button>
              <button type="button" onClick={() => onToggleFavorite(file)} className={MENU_ITEM}>
                <StarIcon filled={file.favorite} />
                {file.favorite ? "Remove favorite" : "Add to favorites"}
              </button>
              <button
                type="button"
                onClick={() => {
                  onCloseMenu();
                  onRequestDelete([file.id]);
                }}
                className={MENU_ITEM_DANGER}
              >
                <TrashIcon /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-1.5 pt-2 pb-1">
        <div className="flex items-baseline gap-1.5">
          <span className="truncate text-[13px] text-white/90">{file.name}</span>
          <span className="shrink-0 text-[11px] text-white/30">{formatBytes(file.size)}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-white/30">
          {format(new Date(file.createdAt), "MM/dd/yyyy, hh:mm a")}
        </p>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
    </svg>
  );
}

function Viewer({ file, onClose }: { file: GalleryFile; onClose: () => void }) {
  const isVideo = file.kind === "video";
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(file.url);
      if (!res.ok) throw new Error("failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = file.name || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(file.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl overflow-hidden rounded-[20px] border border-white/10 bg-[#0c0c0c] shadow-2xl"
      >
        <div className="flex items-center justify-center bg-black">
          {isVideo ? (
            <video src={file.url} controls autoPlay playsInline className="max-h-[74vh] w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt={file.name} className="max-h-[74vh] w-full object-contain" />
          )}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/5 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="truncate text-[14px] font-medium text-white/90">{file.name}</span>
              <span className="shrink-0 text-[12px] text-white/40">({formatBytes(file.size)})</span>
            </div>
            <p className="mt-0.5 truncate text-[12px] text-white/40">
              Uploaded {format(new Date(file.createdAt), "MMM d, yyyy, hh:mm a")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={sharePath(file)}
              target="_blank"
              rel="noreferrer"
              aria-label="Open in new tab"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ExternalLinkIcon />
            </a>
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              aria-label="Download"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
              ) : (
                <DownloadIcon />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

