"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import SaveBar from "@/components/dashboard/SaveBar";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import LinkIcon from "@/components/links/LinkIcon";
import {
  CURATED_ICONIFY_ICONS,
  DEFAULT_LINK_COLOR,
  ICONIFY_API,
  ICON_COLOR_VERSION,
  MAX_LINKS,
  iconifyNameFromUrl,
  iconifySvgUrl,
  normalizeLinkUrl,
  sanitizeProfileLink,
  type LinkVariant,
  type ProfileLink,
} from "@/lib/links";
import { deleteLinkIconFiles, saveProfileLinks } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import { type FullUser } from "@/lib/features/users/db";

function toLink(raw: NonNullable<FullUser["links"]>[number]): ProfileLink | null {
  return sanitizeProfileLink(raw);
}

interface LinkModalProps {
  open: boolean;
  initial?: ProfileLink | null;
  onClose: () => void;
  onSave: (link: ProfileLink) => void;
}

function VariantMock({ variant }: { variant: LinkVariant }) {
  if (variant === "small") {
    return (
      <div className="w-full flex items-center justify-center pt-1.5" aria-hidden="true">
        <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.05] flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full pt-1.5" aria-hidden="true">
      <div className="w-full flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
        <div className="w-6 h-6 rounded-md border border-white/10 bg-white/[0.05] flex items-center justify-center shrink-0">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <div className="h-1.5 flex-1 rounded bg-white/15" />
      </div>
    </div>
  );
}

async function uploadLinkIcon(file: File): Promise<string> {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", file);
  form.append("assetType", "link-icon");
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Failed to upload icon");
  }
  const data = await res.json();
  return data.url as string;
}

function LinkModal({ open, initial, onClose, onSave }: LinkModalProps) {
  const [variant, setVariant] = useState<LinkVariant>(initial?.variant ?? "small");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [iconSource, setIconSource] = useState<"custom" | "iconify">(
    !initial ? "iconify" : initial.icon.startsWith(`${ICONIFY_API}/`) ? "iconify" : "custom"
  );
  const [iconifyQuery, setIconifyQuery] = useState("");
  const [iconifyResults, setIconifyResults] = useState<string[]>([]);
  const [iconifyLoading, setIconifyLoading] = useState(false);
  const [iconifyError, setIconifyError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [color, setColor] = useState(initial?.color ?? DEFAULT_LINK_COLOR);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const revokePreview = () => {
    setPendingPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  useEffect(() => {
    const q = iconifyQuery.trim();
    if (!q) {
      setIconifyResults([]);
      setIconifyError(null);
      setIconifyLoading(false);
      return;
    }
    setIconifyLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/icons/search?query=${encodeURIComponent(q)}&limit=48`
        );
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setIconifyResults(Array.isArray(data.icons) ? data.icons.slice(0, 48) : []);
        setIconifyError(null);
      } catch {
        setIconifyError("Couldn't search icons. Try again.");
        setIconifyResults([]);
      } finally {
        setIconifyLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [iconifyQuery]);

  const displayNames = useMemo(
    () => (iconifyQuery.trim() ? iconifyResults : CURATED_ICONIFY_ICONS),
    [iconifyQuery, iconifyResults]
  );
  const [batchSvgs, setBatchSvgs] = useState<Record<string, string>>({});
  const batchPrevRef = useRef<Record<string, string>>({});

  // Batch-load grid SVGs (one upstream call per icon set) and render via
  // blob URLs — avoids the request burst that gets throttled upstream.
  useEffect(() => {
    let cancelled = false;
    Object.values(batchPrevRef.current).forEach((u) => URL.revokeObjectURL(u));
    batchPrevRef.current = {};
    setBatchSvgs({});
    if (displayNames.length === 0) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/icons/batch?icons=${encodeURIComponent(displayNames.join(","))}&v=${ICON_COLOR_VERSION}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data || typeof data.icons !== "object") return;
        const map: Record<string, string> = {};
        for (const [iconName, svg] of Object.entries(data.icons)) {
          if (typeof svg === "string" && svg.includes("<svg")) {
            map[iconName] = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
          }
        }
        if (cancelled) {
          Object.values(map).forEach((u) => URL.revokeObjectURL(u));
          return;
        }
        batchPrevRef.current = map;
        setBatchSvgs(map);
      } catch {
        // Grid cells keep their skeleton placeholders.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [displayNames]);

  useEffect(
    () => () => {
      Object.values(batchPrevRef.current).forEach((u) => URL.revokeObjectURL(u));
    },
    []
  );

  const reset = () => {
    setVariant(initial?.variant ?? "small");
    setIcon(initial?.icon ?? "");
    setIconSource(
      !initial ? "iconify" : initial.icon.startsWith(`${ICONIFY_API}/`) ? "iconify" : "custom"
    );
    setIconifyQuery("");
    setIconifyResults([]);
    setIconifyError(null);
    setPendingFile(null);
    revokePreview();
    setTitle(initial?.title ?? "");
    setUrl(initial?.url ?? "");
    setColor(initial?.color ?? DEFAULT_LINK_COLOR);
    setError(null);
    setSaving(false);
  };

  const handleFilePick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.type === "image/gif") {
      setError("Icon must be a static image (PNG, JPG or WebP).");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Icon must be under 1MB.");
      return;
    }
    setError(null);
    setPendingFile(file);
    revokePreview();
    setPendingPreview(URL.createObjectURL(file));
  };

  const clearIcon = () => {
    setIcon("");
    setPendingFile(null);
    revokePreview();
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    if (saving) return;
    const cleanTitle = title.trim().slice(0, 60);
    if (!cleanTitle) {
      setError("Give your link a title.");
      return;
    }
    const cleanUrl = normalizeLinkUrl(url);
    if (!cleanUrl) {
      setError("Enter a valid URL (e.g. https://example.com).");
      return;
    }
    let finalIcon = icon;
    if (iconSource === "custom" && pendingFile) {
      setSaving(true);
      setError(null);
      try {
        finalIcon = await uploadLinkIcon(pendingFile);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to upload icon");
        setSaving(false);
        return;
      }
    }
    if (!finalIcon) {
      setError(
        iconSource === "iconify" ? "Pick an icon from the library." : "Upload a custom icon."
      );
      setSaving(false);
      return;
    }
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      title: cleanTitle,
      url: cleanUrl,
      icon: finalIcon,
      variant,
      color: /^#[0-9a-f]{6}$/i.test(color.trim()) ? color.trim().toLowerCase() : DEFAULT_LINK_COLOR,
    });
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px]"
            onClick={() => {
              reset();
              onClose();
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[101] top-1/2 left-1/2 w-[min(640px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0c] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[14px] font-medium text-white/90">
                {initial ? "Edit link" : "Add link"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/75"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-5 px-5 py-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-2">
                <span className="text-[12.5px] font-medium text-white/90">Size</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {(["small", "big"] as LinkVariant[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVariant(v)}
                      className={`flex flex-col rounded-xl border px-2.5 py-2 text-left transition-all cursor-pointer ${
                        variant === v
                          ? "bg-[#111326] border-[#5b6cf5]/40"
                          : "bg-[#141414]/70 border-white/5 hover:border-white/15"
                      }`}
                    >
                      <span className="text-[12px] font-medium text-white/90">
                        {v === "big" ? "Big" : "Small"}
                      </span>
                      <span className="text-[10px] text-white/35">
                        {v === "big" ? "Full-width long button" : "Compact icon button"}
                      </span>
                      <VariantMock variant={v} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[12.5px] font-medium text-white/90">Icon</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIconSource("iconify")}
                    className={`flex flex-col rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                      iconSource === "iconify"
                        ? "bg-[#111326] border-[#5b6cf5]/40"
                        : "bg-[#141414]/70 border-white/5 hover:border-white/15"
                    }`}
                  >
                    <span className="text-[13px] font-medium text-white/90">Iconify</span>
                    <span className="text-[11px] text-white/35">Pick from icon library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconSource("custom")}
                    className={`flex flex-col rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                      iconSource === "custom"
                        ? "bg-[#111326] border-[#5b6cf5]/40"
                        : "bg-[#141414]/70 border-white/5 hover:border-white/15"
                    }`}
                  >
                    <span className="text-[13px] font-medium text-white/90">Custom icon</span>
                    <span className="text-[11px] text-white/35">Upload your own image</span>
                  </button>
                </div>

                {iconSource === "custom" ? (
                  <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleFilePick(e.target.files?.[0])}
                />
                {pendingPreview || icon ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#141414]/70 p-3">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0 text-white/85 overflow-hidden">
                      <LinkIcon icon={pendingPreview ?? icon} size={22} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[13px] font-normal text-white/90 tracking-tight truncate">
                        {pendingFile ? pendingFile.name : "Custom icon"}
                      </span>
                      <span className="text-[11px] text-white/35">
                        {pendingFile ? `${(pendingFile.size / 1024).toFixed(0)} KB · uploads on save` : "Uploaded"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-[12px] font-normal transition-all cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={clearIcon}
                      title="Remove icon"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-white/50 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-2xl border border-dashed border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-5 flex items-center justify-center gap-2.5 text-white/40 hover:text-white/70 transition-all cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-[12.5px] font-normal">Upload icon · PNG / JPG / WebP · up to 1MB</span>
                  </button>
                )}
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        value={iconifyQuery}
                        onChange={(e) => setIconifyQuery(e.target.value)}
                        placeholder="Search 200,000+ icons…"
                        className="bg-[#161616] border border-white/5 rounded-xl h-10 pl-10 pr-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors w-full"
                      />
                    </div>
                    {iconifyLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-white/10 border-t-[#609fda] rounded-full animate-spin" />
                      </div>
                    ) : iconifyError ? (
                      <p className="text-[12px] text-red-400/80 text-center py-4">{iconifyError}</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-0.5">
                          {displayNames.map((name) => {
                            const svgUrl = iconifySvgUrl(name);
                            const selected = icon === svgUrl;
                            const blobSrc = batchSvgs[name];
                            return (
                              <button
                                key={name}
                                type="button"
                                title={name}
                                onClick={() => {
                                  setIcon(svgUrl);
                                  setError(null);
                                }}
                                className={`flex h-10 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                                  selected
                                    ? "bg-[#609fda]/20 border-[#609fda]/50 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]"
                                    : "bg-white/[0.03] border-white/5 text-white/60 hover:text-white hover:border-white/15"
                                }`}
                              >
                                {blobSrc ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={blobSrc} alt={name} width={18} height={18} draggable={false} className="w-[18px] h-[18px]" />
                                ) : (
                                  <span className="w-[18px] h-[18px] rounded-full bg-white/10 animate-pulse" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {iconifyQuery.trim() !== "" && iconifyResults.length === 0 && (
                          <p className="text-[12px] text-white/30 text-center">No icons found.</p>
                        )}
                      </>
                    )}
                    {iconifyNameFromUrl(icon) && (
                      <p className="text-[11.5px] text-white/40 px-1">
                        Selected: <span className="text-[#609fda] font-mono">{iconifyNameFromUrl(icon)}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="link-title" className="text-[12.5px] font-medium text-white/90">Title</label>
                <input
                  id="link-title"
                  type="text"
                  value={title}
                  maxLength={60}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My awesome link"
                  className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="link-url" className="text-[12.5px] font-medium text-white/90">URL</label>
                <input
                  id="link-url"
                  type="text"
                  value={url}
                  maxLength={2048}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>

              {iconSource === "iconify" && (
                <div className="flex flex-col gap-2">
                  <span className="text-[12.5px] font-medium text-white/90">Color</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {["#609fda", "#5b6cf5", "#a78bfa", "#f472b6", "#fb7185", "#fb923c", "#facc15", "#4ade80", "#2dd4bf", "#ffffff"].map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        title={swatch}
                        onClick={() => setColor(swatch)}
                        className={`w-8 h-8 rounded-full border transition-all cursor-pointer ${
                          color.toLowerCase() === swatch
                            ? "border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                            : "border-white/15 hover:scale-105 hover:border-white/40"
                        }`}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                    <label
                      title="Custom color"
                      className="relative w-8 h-8 rounded-full border border-dashed border-white/25 hover:border-white/50 transition-all cursor-pointer overflow-hidden flex items-center justify-center text-white/60 hover:text-white"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <input
                        type="color"
                        value={/^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_LINK_COLOR}
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                    <span className="text-[11px] font-mono text-white/35 uppercase ml-1">{color}</span>
                  </div>
                </div>
              )}

              {error && <p className="text-[12px] text-red-400/80">{error}</p>}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="h-10 px-5 rounded-xl border border-white/10 bg-white/[0.04] text-[13px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 px-6 rounded-xl bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white font-normal text-sm transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Uploading..." : initial ? "Save link" : "Add link"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function LinksProfileClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const initialLinks: ProfileLink[] = (user?.links ?? [])
    .map((l) => toLink(l))
    .filter((l): l is ProfileLink => l !== null);

  const [links, setLinks] = useState<ProfileLink[]>(initialLinks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProfileLink | null>(null);

  const hasChanges =
    JSON.stringify(links) !== JSON.stringify(initialLinks);

  const openAdd = () => {
    if (links.length >= MAX_LINKS) return;
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (link: ProfileLink) => {
    setEditing(link);
    setModalOpen(true);
  };

  const handleModalSave = (link: ProfileLink) => {
    setLinks((prev) => {
      const idx = prev.findIndex((l) => l.id === link.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = link;
        return next;
      }
      if (prev.length >= MAX_LINKS) return prev;
      return [...prev, link];
    });
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const count = links.length;

  return (
    <>
      <div
        className="flex flex-col gap-8 w-full"
        style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}
      >
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
                Your links ({count}/{MAX_LINKS})
              </h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Add up to {MAX_LINKS} links to your profile.
              </p>
            </div>

            <button
              type="button"
              disabled={count >= MAX_LINKS}
              onClick={openAdd}
              title={count >= MAX_LINKS ? `You can only add ${MAX_LINKS} links` : undefined}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-normal transition-all duration-200 ${
                count >= MAX_LINKS
                  ? "bg-white/5 border border-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer active:scale-95"
              }`}
            >
              <span className={`text-[13px] leading-none font-normal ${count >= MAX_LINKS ? "text-white/30" : "text-white"}`}>+</span>
              <span>Add link</span>
            </button>
          </div>

          {count > 0 ? (
            <div className="flex flex-col gap-2.5">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="group flex items-center justify-between gap-3 p-3.5 bg-[#141414]/70 hover:bg-[#161616] border border-white/5 rounded-2xl transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0 text-white/80">
                      <LinkIcon icon={link.icon} size={17} color={link.color} />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-[13.5px] font-normal text-white/95 tracking-tight truncate">
                        {link.title}
                      </span>
                      <span className="text-[11.5px] font-mono text-white/35 truncate">
                        {link.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(link)}
                      title="Edit link"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      title="Remove link"
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full border border-dashed border-white/[0.08] rounded-2xl bg-[#141414]/30 py-12 px-6 flex flex-col items-center justify-center text-center transition-colors hover:border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 mb-3 shadow-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>

              <h3 className="text-[13.5px] font-normal text-white/90 tracking-tight">
                No links yet.
              </h3>
              <p className="text-[12.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">
                Add your first link so visitors can find you elsewhere.
              </p>
            </div>
          )}
        </div>
      </div>

      <DashboardProfilePreview user={user} overrides={{ links }} />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            await saveProfileLinks({ links });
            toast.success("Profile Saved Sucessfully");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save links");
          }
        }}
        onRevert={() => {
          // Best-effort cleanup of icons uploaded this session but reverted.
          const initialUrls = new Set(initialLinks.map((l) => l.icon));
          const added = [
            ...new Set(
              links
                .map((l) => l.icon)
                .filter((u) => u && !initialUrls.has(u) && u.includes("files.catbox.moe"))
            ),
          ];
          if (added.length > 0) {
            deleteLinkIconFiles(added).catch(() => {});
          }
          setLinks(initialLinks);
        }}
      />

      <LinkModal
        key={editing ? editing.id : "new"}
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleModalSave}
      />
    </>
  );
}
