"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toast";
import FilterSelect from "@/components/ui/filter-select";

type Tab = "public" | "favorites" | "mine";

// Shown in the "Use template" confirm popup so the user knows what gets
// overwritten. Templates only carry style — not avatar, bio, or links content.
const AFFECTED_SECTIONS = [
  "Layout & structure",
  "Profile card (background, border, blur, shadow)",
  "Background & card effects",
  "Fonts & typography",
  "Text & section colors",
  "Avatar decoration & profile effect",
  "Badges styling",
  "Links styling",
  "Music player styling",
  "Widgets styling",
  "Join date, views & tooltips",
];

// What stays untouched when applying a template — shown in a second dropdown.
const UNCHANGED_SECTIONS = [
  "Your avatar image",
  "Banner & background images",
  "Bio & display name",
  "Your links & their URLs",
  "Music tracks (audio & artwork)",
  "Username & UID",
  "Badges you own",
  "Views, likes & comments",
];

type Tpl = {
  id: number;
  slug: string;
  name: string;
  thumbnailUrl: string | null;
  isOfficial: boolean;
  isPublic: boolean;
  useCount: number;
  createdAt: string;
  creatorUsername: string | null;
  favorited?: boolean;
  creatorId?: number | null;
};

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
    setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, favorited: next } : x)));
    try {
      const r = await fetch(`/api/templates/${t.id}/favorite`, { method: next ? "POST" : "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      if (tab === "favorites" && !next) {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
        setTotal((n) => Math.max(0, n - 1));
      }
    } catch (e) {
      setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, favorited: !next } : x)));
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
                  {t.isOfficial && (
                    <span className="absolute top-2 left-2 text-[10px] tracking-[0.12em] uppercase bg-white/10 border border-white/10 text-white/80 px-2 py-1 rounded-full backdrop-blur">Official</span>
                  )}
                  {!t.isPublic && (
                    <span className="absolute top-2 left-2 text-[10px] tracking-[0.12em] uppercase bg-black/50 border border-white/10 text-white/70 px-2 py-1 rounded-full backdrop-blur">Private</span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleFav(t)}
                    disabled={favBusy === t.id}
                    aria-label={t.favorited ? "Unfavorite" : "Favorite"}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/45 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-black/60 transition disabled:opacity-50"
                  >
                    <span className={`text-[15px] leading-none ${t.favorited ? "text-white" : "text-white/40"}`}>{t.favorited ? "♥" : "♡"}</span>
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{t.name}</p>
                    <p className="text-[11px] text-white/35">
                      {t.creatorUsername ? `@${t.creatorUsername}` : "—"} · {t.useCount} uses
                    </p>
                  </div>
                  <div className="flex gap-2">
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
            <p className="text-[12px] text-white/40 mt-1 leading-relaxed">We&apos;ll take a screenshot of your saved profile — that becomes the cover. Only style is shared, not your bio/links.</p>
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
