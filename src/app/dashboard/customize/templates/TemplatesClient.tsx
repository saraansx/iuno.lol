"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/toast";
import FilterSelect from "@/components/ui/filter-select";

type Tab = "public" | "favorites" | "mine";

const AFFECTED_SECTIONS = [
  "Avatar image",
  "Banner & background images",
  "Music tracks (audio & artwork)",
  "Embed images, favicon & cursor",
  "Layout & structure",
  "Profile card (background, border, blur, shadow)",
  "Background & card effects",
  "Fonts & typography",
  "Text & section colors",
  "Avatar decoration & profile effect",
  "Badges, links, music & widgets styling",
  "Join date, views & tooltips",
];

const UNCHANGED_SECTIONS = [
  "Bio & display name",
  "Your links & their URLs",
  "Username & UID",
  "Badges you own",
  "Views, likes & comments",
];

type Tpl = {
  id: number;
  slug: string;
  name: string;
  thumbnailUrl: string | null;
  isPublic: boolean;
  useCount: number;
  createdAt: string;
  creatorUsername: string | null;
  favorited?: boolean;
  favoriteCount?: number;
  creatorId?: number | null;
};

type AssetKind = "image" | "video" | "audio";
type TemplateAsset = { label: string; url: string; kind: AssetKind; filename: string; size?: number | null };

function fileNameFromUrl(url: string): string {
  try {
    const p = new URL(url).pathname.replace(/^\//, "");
    return decodeURIComponent(p.split("/").pop() || url);
  } catch {
    return url;
  }
}

function kindFromUrl(url: string): AssetKind {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "audio";
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) return "video";
  return "image";
}

function formatBytes(n: number | null | undefined): string {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function extractAssets(config: Record<string, unknown>): TemplateAsset[] {
  const out: TemplateAsset[] = [];
  const push = (label: string, v: unknown) => {
    if (typeof v === "string" && v.length > 0 && !v.startsWith("animated:")) {
      out.push({ label, url: v, kind: kindFromUrl(v), filename: fileNameFromUrl(v) });
    }
  };
  push("Avatar", config.avatarUrl);
  push("Banner", config.bannerImageUrl);
  push("Embed background", config.embedBackgroundUrl);
  push("Embed icon", config.embedIconUrl);
  push("Favicon", config.faviconUrl);
  push("Cursor", config.cursorUrl);
  if (Array.isArray(config.backgrounds)) {
    config.backgrounds.forEach((u) => push("Background", u));
  }
  if (Array.isArray(config.musicTracks)) {
    config.musicTracks.forEach((t) => {
      if (t && typeof t === "object") {
        const track = t as { streamUrl?: string; artwork?: string };
        push("Audio", track.streamUrl);
        push("Audio cover", track.artwork);
      }
    });
  }
  return out;
}

export default function TemplatesClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("public");
  const [items, setItems] = useState<Tpl[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "popular">("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareName, setShareName] = useState("");
  const [sharePublic, setSharePublic] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [usingId, setUsingId] = useState<number | null>(null);
  const [useTarget, setUseTarget] = useState<Tpl | null>(null);
  const [useDetailsOpen, setUseDetailsOpen] = useState(false);
  const [useKeepOpen, setUseKeepOpen] = useState(false);
  const [favBusy, setFavBusy] = useState<number | null>(null);
  const [visBusy, setVisBusy] = useState<number | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Tpl | null>(null);
  const [assetsTarget, setAssetsTarget] = useState<Tpl | null>(null);
  const [assets, setAssets] = useState<TemplateAsset[] | null>(null);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      sp.set("sort", sort);
      sp.set("tab", tab);
      sp.set("page", String(page));
      sp.set("limit", "24");
      const r = await fetch(`/api/templates?${sp.toString()}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      setItems(j.items ?? []);
      setTotal(j.total ?? 0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      if (String(msg).includes("Unauthorized") && tab !== "public") {
      } else toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [q, sort, tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  const copyCoverUrl = async (t: Tpl) => {
    setMenuId(null);
    if (!t.thumbnailUrl) {
      toast.error("No cover image");
      return;
    }
    try {
      await navigator.clipboard.writeText(t.thumbnailUrl);
      toast.success("Cover URL copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const openAssets = async (t: Tpl) => {
    setMenuId(null);
    setAssetsTarget(t);
    setAssets(null);
    setAssetsLoading(true);
    try {
      const r = await fetch(`/api/templates/${t.id}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      const list = extractAssets((j.config as Record<string, unknown>) ?? {});
      setAssets(list);
      list.forEach((a, idx) => {
        fetch(a.url, { method: "HEAD" })
          .then((res) => {
            const len = res.headers.get("content-length");
            if (len) {
              setAssets((cur) => cur && cur.map((x, i) => (i === idx ? { ...x, size: Number(len) } : x)));
            }
          })
          .catch(() => {});
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setAssetsTarget(null);
    } finally {
      setAssetsLoading(false);
    }
  };

  const downloadAsset = async (a: TemplateAsset) => {
    try {
      const res = await fetch(a.url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = a.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch {
      window.open(a.url, "_blank", "noopener");
    }
  };

  const doUse = async (id: number) => {
    setUsingId(id);
    try {
      const r = await fetch(`/api/templates/${id}/apply`, { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      toast.success("Template applied!");
      setUseTarget(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setUsingId(null);
    }
  };

  const toggleFav = async (t: Tpl) => {
    const next = !t.favorited;
    setFavBusy(t.id);
    setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, favorited: next, favoriteCount: Math.max(0, (x.favoriteCount ?? 0) + (next ? 1 : -1)) } : x)));
    try {
      const r = await fetch(`/api/templates/${t.id}/favorite`, { method: next ? "POST" : "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      if (tab === "favorites" && !next) {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
        setTotal((n) => Math.max(0, n - 1));
      }
    } catch (e) {
      setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, favorited: !next, favoriteCount: Math.max(0, (x.favoriteCount ?? 0) + (next ? -1 : 1)) } : x)));
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setFavBusy(null);
    }
  };

  const toggleVisibility = async (t: Tpl) => {
    const next = !t.isPublic;
    setVisBusy(t.id);
    setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, isPublic: next } : x)));
    try {
      const r = await fetch(`/api/templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      toast.success(next ? "Template is now public" : "Template is now private");
    } catch (e) {
      setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, isPublic: !next } : x)));
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setVisBusy(null);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<Tpl | null>(null);
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    const t = deleteTarget;
    if (!t || deleting) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/templates/${t.id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      toast.success("Deleted");
      setItems((prev) => prev.filter((x) => x.id !== t.id));
      setTotal((n) => Math.max(0, n - 1));
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setDeleting(false);
    }
  };

  const doShare = async () => {
    const name = shareName.trim();
    if (name.length < 3 || name.length > 32) {
      toast.error("Name must be 3-32 characters");
      return;
    }
    setSharing(true);
    try {
      const r = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isPublic: sharePublic }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      toast.success("Template shared!");
      setShareOpen(false);
      setShareName("");
      setTab("mine");
      setPage(1);
      setTimeout(load, 200);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to share");
    } finally {
      setSharing(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "public", label: "Public" },
    { id: "favorites", label: "Favorites" },
    { id: "mine", label: "My templates" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      {}
      <div className="flex items-center gap-1.5">
        <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.02] border border-white/[0.06] p-1 relative">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
              className={`relative z-10 px-4 py-1.5 rounded-full text-[13px] font-light transition cursor-pointer ${tab === t.id ? "text-white" : "text-white/60 hover:text-white"}`}
              style={{ fontFamily: "var(--font-comfortaa)" }}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="templates-tab-bubble"
                  className="absolute inset-0 bg-[#5b6cf5]/20 rounded-full z-0"
                  transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setShareName("");
            setSharePublic(true);
            setShareOpen(true);
          }}
          className="ml-auto h-9 px-5 rounded-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white text-[13px] font-normal transition border border-white/10 cursor-pointer"
          style={{ fontFamily: "var(--font-comfortaa)" }}
        >
          Share Your Template
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search templates…"
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#161616] border border-white/5 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-white/10"
          />
        </div>
        <FilterSelect
          label="Sort"
          value={sort}
          options={[
            { id: "newest", label: "Newest" },
            { id: "popular", label: "Popular" },
          ]}
          onChange={(v) => {
            setSort(v);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[20px] overflow-hidden bg-[#0c0c0c] border border-white/5 flex flex-col animate-pulse">
              <div className="aspect-[16/10] bg-white/[0.04]" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-3.5 w-2/3 rounded-full bg-white/[0.05]" />
                <div className="h-2.5 w-2/5 rounded-full bg-white/[0.04]" />
                <div className="h-9 w-full rounded-xl bg-white/[0.04] mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[20px] border border-white/5 bg-[#0c0c0c] p-10 text-center">
          <p className="text-[14px] text-white/80 font-medium">
            {tab === "mine" ? "You haven't shared any templates" : tab === "favorites" ? "No favorites yet" : "No templates yet"}
          </p>
          <p className="text-[13px] text-white/35 mt-1">
            {tab === "mine" ? "Share your current profile as a template." : tab === "favorites" ? "Heart a template to save it here." : "Share your current profile as the first template."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((t) => (
              <div key={t.id} className="rounded-[20px] overflow-hidden bg-[#0c0c0c] border border-white/5 flex flex-col">
                <div className="aspect-[16/10] bg-[#111] relative overflow-hidden">
                  {t.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/15 text-[11px] tracking-widest uppercase">No cover</div>
                  )}
                  {!t.isPublic && (
                    <span className="absolute top-2 left-2 text-[10px] tracking-[0.12em] uppercase bg-black/50 border border-white/10 text-white/70 px-2 py-1 rounded-full backdrop-blur">Private</span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{t.name}</p>
                    <div className="flex items-center gap-2.5 text-[11px] text-white/35">
                      <span className="truncate">{t.creatorUsername ? `@${t.creatorUsername}` : "—"}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                        </svg>
                        {t.useCount}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 1.9 4.5 5.5 4.5c2 0 3.4 1.1 4.5 2.6 1.1-1.5 2.5-2.6 4.5-2.6 3.6 0 5.1 3.9 3.5 7.2C19.5 16.4 12 21 12 21z" />
                        </svg>
                        {t.favoriteCount ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFav(t)}
                      disabled={favBusy === t.id}
                      aria-label={t.favorited ? "Unfavorite" : "Favorite"}
                      className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/[0.1] transition disabled:opacity-50 shrink-0"
                    >
                      <span className={`text-[15px] leading-none ${t.favorited ? "text-white" : "text-white/40"}`}>{t.favorited ? "♥" : "♡"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUseDetailsOpen(false);
                        setUseKeepOpen(false);
                        setUseTarget(t);
                      }}
                      disabled={usingId === t.id}
                      className="flex-1 h-9 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 disabled:opacity-50 text-white text-[12px] font-normal transition cursor-pointer border border-white/10"
                      style={{ fontFamily: "var(--font-comfortaa)" }}
                    >
                      {usingId === t.id ? "Applying…" : "Use template"}
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMenuId((cur) => (cur === t.id ? null : t.id))}
                        aria-label="More options"
                        className="h-9 w-9 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {menuId === t.id && (
                          <>
                            <button type="button" aria-label="Close menu" className="fixed inset-0 z-[40] cursor-default" onClick={() => setMenuId(null)} />
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className="absolute right-0 bottom-full mb-1.5 z-[50] w-44 rounded-xl bg-[#161616] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-1 flex flex-col"
                            >
                              <button type="button" onClick={() => copyCoverUrl(t)} className="w-full text-left px-3 py-2 rounded-lg text-[12.5px] text-white/75 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer">
                                Copy URL
                              </button>
                              <button type="button" onClick={() => { setMenuId(null); setPreviewTarget(t); }} className="w-full text-left px-3 py-2 rounded-lg text-[12.5px] text-white/75 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer">
                                Preview
                              </button>
                              <button type="button" onClick={() => openAssets(t)} className="w-full text-left px-3 py-2 rounded-lg text-[12.5px] text-white/75 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer">
                                View assets
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    {tab === "mine" && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleVisibility(t)}
                          disabled={visBusy === t.id}
                          title={t.isPublic ? "Make private" : "Make public"}
                          className="h-9 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:text-white text-[12px] transition cursor-pointer disabled:opacity-50"
                        >
                          {visBusy === t.id ? "…" : t.isPublic ? "Make private" : "Make public"}
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(t)} className="h-9 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:text-white text-[12px] transition cursor-pointer">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {total > 24 && (
            <div className="flex items-center justify-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-9 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white/80 text-[13px] disabled:opacity-30 cursor-pointer">
                Prev
              </button>
              <span className="text-[12px] text-white/40">
                Page {page} · {Math.ceil(total / 24)} · {total} total
              </span>
              <button type="button" disabled={page >= Math.ceil(total / 24)} onClick={() => setPage((p) => p + 1)} className="h-9 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white/80 text-[13px] disabled:opacity-30 cursor-pointer">
                Next
              </button>
            </div>
          )}
        </>
      )}

      {shareOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button type="button" aria-label="Close" onClick={() => setShareOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[440px] rounded-[20px] bg-[#0c0c0c] border border-white/10 p-6 shadow-xl">
            <h3 className="text-[15px] font-medium text-white">Share Your Template</h3>
            <p className="text-[12px] text-white/40 mt-1 leading-relaxed">We&apos;ll take a screenshot of your saved profile — that becomes the cover. Your styling, avatar, banner, backgrounds &amp; music are shared — not your bio, links, username or stats.</p>
            <label className="mt-4 block">
              <span className="text-[12px] text-white/50">Layout name</span>
              <input
                value={shareName}
                onChange={(e) => setShareName(e.target.value)}
                placeholder="e.g. Midnight Glass"
                maxLength={32}
                className="mt-1.5 w-full h-10 rounded-xl bg-[#161616] border border-white/5 px-3.5 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/10"
              />
            </label>

            <div className="mt-4">
              <span className="text-[12px] text-white/50">Visibility</span>
              <div className="mt-1.5">
                <FilterSelect
                  label="Visibility"
                  fullWidth
                  value={sharePublic ? "public" : "private"}
                  options={[
                    { id: "public", label: "Public" },
                    { id: "private", label: "Private" },
                  ]}
                  onChange={(v) => setSharePublic(v === "public")}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/30">{sharePublic ? "Anyone can find & use this template." : "Only you can see it — it won't show in Public."}</p>
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <button type="button" onClick={() => setShareOpen(false)} disabled={sharing} className="h-10 px-5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-[13px] disabled:opacity-40 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={doShare} disabled={sharing} className="h-10 px-6 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-white/10 text-white text-[13px] font-normal disabled:opacity-40 cursor-pointer" style={{ fontFamily: "var(--font-comfortaa)" }}>
                {sharing ? "Sharing…" : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}

      {useTarget && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { if (usingId === null) setUseTarget(null); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-[min(440px,90vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6">
            <h3 className="text-[15px] font-normal text-white/90 tracking-tight">Apply &quot;{useTarget.name}&quot;?</h3>
            <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
              This overwrites your current <span className="text-white/70">styling</span>. Your avatar, bio, links and music content stay as they are.
            </p>

            <button
              type="button"
              onClick={() => setUseDetailsOpen((v) => !v)}
              className="mt-4 w-full flex items-center justify-between h-10 px-3.5 rounded-xl bg-[#161616] border border-white/5 text-[12.5px] text-white/70 hover:text-white hover:border-white/10 transition cursor-pointer"
            >
              <span>What will change?</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${useDetailsOpen ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {useDetailsOpen && (
              <ul className="mt-2 rounded-xl bg-white/[0.02] border border-white/5 p-3 flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
                {AFFECTED_SECTIONS.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-[12px] text-white/55">
                    <span className="w-1 h-1 rounded-full bg-[#5b6cf5] shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => setUseKeepOpen((v) => !v)}
              className="mt-2 w-full flex items-center justify-between h-10 px-3.5 rounded-xl bg-[#161616] border border-white/5 text-[12.5px] text-white/70 hover:text-white hover:border-white/10 transition cursor-pointer"
            >
              <span>What stays the same?</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${useKeepOpen ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {useKeepOpen && (
              <ul className="mt-2 rounded-xl bg-white/[0.02] border border-white/5 p-3 flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
                {UNCHANGED_SECTIONS.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-[12px] text-white/55">
                    <span className="w-1 h-1 rounded-full bg-emerald-400/70 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUseTarget(null)}
                disabled={usingId !== null}
                className="h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => doUse(useTarget.id)}
                disabled={usingId !== null}
                className="h-9 rounded-xl px-5 text-[13px] font-normal text-white bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                style={{ fontFamily: "var(--font-comfortaa)" }}
              >
                {usingId === useTarget.id ? "Applying…" : "Apply template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewTarget && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-[min(760px,92vw)] max-h-[88vh] rounded-[20px] overflow-hidden bg-[#0c0c0c] border border-white/10">
            {previewTarget.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewTarget.thumbnailUrl} alt={previewTarget.name} className="w-full max-h-[78vh] object-contain bg-black" />
            ) : (
              <div className="h-64 flex items-center justify-center text-white/30 text-[12px] uppercase tracking-widest">No cover</div>
            )}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-[13px] text-white/80 truncate">{previewTarget.name}</p>
              <button type="button" onClick={() => setPreviewTarget(null)} className="h-8 px-4 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:text-white text-[12px] transition cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {assetsTarget && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAssetsTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[min(640px,94vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[15px] font-normal text-white/90 tracking-tight">Template assets</h3>
                <p className="text-[12px] text-white/40 mt-1">Browse and download every asset bundled with this template.</p>
              </div>
              <button type="button" onClick={() => setAssetsTarget(null)} aria-label="Close" className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mt-4 max-h-[440px] overflow-y-auto flex flex-col gap-2 pr-0.5">
              {assetsLoading ? (
                <p className="text-[12.5px] text-white/40 py-10 text-center">Loading…</p>
              ) : assets && assets.length > 0 ? (
                assets.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/5 p-2.5 hover:bg-white/[0.04] transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                      {a.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.url} alt={a.label} className="w-full h-full object-cover" />
                      ) : a.kind === "audio" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m10 9 5 3-5 3z" /></svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] text-white/85 truncate">{a.filename}</p>
                      <p className="text-[11px] text-white/35">{a.label}{a.size != null ? ` · ${formatBytes(a.size)}` : ""}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadAsset(a)}
                      aria-label="Download"
                      className="shrink-0 w-9 h-9 rounded-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/35 border border-[#5b6cf5]/25 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M4 21h16" /></svg>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[12.5px] text-white/40 py-10 text-center">No media assets in this template.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[min(420px,90vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6">
            <h3 className="text-[15px] font-normal text-white/90 tracking-tight">Delete template?</h3>
            <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">Delete &quot;{deleteTarget.name}&quot;? This cannot be undone.</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doDelete}
                disabled={deleting}
                className="h-9 rounded-xl px-4 text-[13px] font-normal text-red-300 bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 transition-colors cursor-pointer disabled:opacity-50"
                style={{ fontFamily: "var(--font-comfortaa)" }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
