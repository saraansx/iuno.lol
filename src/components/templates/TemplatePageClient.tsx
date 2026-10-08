"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/components/ui/toast";

export type PublicTemplateView = {
  id: number;
  slug: string;
  name: string;
  thumbnailUrl: string | null;
  shareUrl: string;
  useCount: number;
  favoriteCount: number;
  creatorUsername: string | null;
  creatorAvatarUrl: string | null;
  favorited: boolean;
};

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

interface TemplatePageClientProps {
  template: PublicTemplateView;
  isAuthenticated: boolean;
}

export default function TemplatePageClient({ template, isAuthenticated }: TemplatePageClientProps) {
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [busy, setBusy] = useState<"apply" | "save" | "fav" | null>(null);
  const [favorited, setFavorited] = useState(template.favorited);
  const [favoriteCount, setFavoriteCount] = useState(template.favoriteCount);
  const [useCount, setUseCount] = useState(template.useCount);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goToSignIn = useCallback(() => {
    const next = encodeURIComponent(`/template/${template.slug}`);
    router.push(`/signin?next=${next}`);
  }, [router, template.slug]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(template.shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      goToSignIn();
      return;
    }
    const next = !favorited;
    setBusy("fav");
    setFavorited(next);
    setFavoriteCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const r = await fetch(`/api/templates/${template.id}/favorite`, { method: next ? "POST" : "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error ?? "Failed");
    } catch (e) {
      setFavorited(!next);
      setFavoriteCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      goToSignIn();
      return;
    }
    setConfirmOpen(true);
  };

  const doApply = async () => {
    setBusy("apply");
    try {
      const r = await fetch(`/api/templates/${template.id}/apply`, { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      setUseCount((c) => c + 1);
      setConfirmOpen(false);
      toast.success("Template applied!");
      router.push("/dashboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const doSave = async () => {
    if (!isAuthenticated) {
      goToSignIn();
      return;
    }
    setBusy("save");
    const save = async (name: string) => {
      const r = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return { ok: r.ok, error: (await r.json().catch(() => ({}))).error as string | undefined };
    };
    try {
      let res = await save(template.name);
      if (!res.ok && res.error?.toLowerCase().includes("already have a template")) {
        res = await save(`${template.name} 2`);
      }
      if (!res.ok) throw new Error(res.error ?? "Failed");
      toast.success("Saved to your templates");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
          <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-10 lg:gap-14 items-center">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="block w-full aspect-[16/10] rounded-[20px] overflow-hidden bg-[#0c0c0c] border border-white/5 cursor-zoom-in transition hover:border-white/10"
              >
                {template.thumbnailUrl ? (
                  <Image src={template.thumbnailUrl} alt={template.name} width={1120} height={700} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/15 text-[11px] tracking-widest uppercase">No cover</div>
                )}
              </button>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-white/50 shrink-0">Template by</span>
                {template.creatorUsername ? (
                  <Link href={`/${template.creatorUsername}`} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
                    <span className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 overflow-hidden flex items-center justify-center text-[11px] text-white/70 shrink-0">
                      {template.creatorAvatarUrl ? (
                        <Image src={template.creatorAvatarUrl} alt={template.creatorUsername} width={28} height={28} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        (template.creatorUsername[0] ?? "?").toUpperCase()
                      )}
                    </span>
                    <span className="text-[13px] text-white/80 truncate">@{template.creatorUsername}</span>
                  </Link>
                ) : (
                  <span className="text-[13px] text-white/40">Unknown</span>
                )}
              </div>

              <h1 className="mt-4 text-[34px] leading-[1.1] tracking-tight text-white">{template.name}</h1>
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/45 max-w-[38ch]">
                Preview this profile setup, apply selected parts to your active profile, or save it for later.
              </p>

              <div className="mt-5 flex items-center gap-5 text-[12.5px] text-white/45">
                <span className="flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {useCount} {useCount === 1 ? "use" : "uses"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 1.9 4.5 5.5 4.5c2 0 3.4 1.1 4.5 2.6 1.1-1.5 2.5-2.6 4.5-2.6 3.6 0 5.1 3.9 3.5 7.2C19.5 16.4 12 21 12 21z" />
                  </svg>
                  {favoriteCount} {favoriteCount === 1 ? "favorite" : "favorites"}
                </span>
              </div>

              <div className="mt-7 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleApply}
                  className="h-11 w-full rounded-xl bg-[#5b6cf5]/25 hover:bg-[#5b6cf5]/35 border border-[#5b6cf5]/25 text-white text-[13.5px] font-normal transition cursor-pointer"
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  {isAuthenticated ? "Apply" : "Sign in to apply"}
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="h-11 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white text-[13px] transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="h-11 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white text-[13px] transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy URL
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    disabled={busy === "fav"}
                    className="h-11 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white text-[13px] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className={`text-[15px] leading-none ${favorited ? "text-white" : "text-white/45"}`}>{favorited ? "♥" : "♡"}</span>
                    {favorited ? "Favorited" : "Favorite"}
                  </button>
                  <button
                    type="button"
                    onClick={doSave}
                    disabled={busy === "save"}
                    className="h-11 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white text-[13px] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M4 21h16" />
                    </svg>
                    {busy === "save" ? "Saving…" : "Save template"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setLightboxOpen(false)}
          >
            {template.thumbnailUrl && (
              <Image
                src={template.thumbnailUrl}
                alt={template.name}
                width={1600}
                height={1000}
                className="max-w-full max-h-[88vh] w-auto h-auto object-contain rounded-[16px]"
                unoptimized
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              if (busy === null) setConfirmOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-[min(440px,92vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6"
            >
              <h2 className="text-[15px] font-normal text-white/90 tracking-tight">Apply &quot;{template.name}&quot;?</h2>
              <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
                This overwrites your current <span className="text-white/70">styling</span>. Your avatar, bio, links and music content stay as they are.
              </p>

              <button
                type="button"
                onClick={() => setDetailsOpen((v) => !v)}
                className="mt-4 w-full flex items-center justify-between h-10 px-3.5 rounded-xl bg-[#161616] border border-white/5 text-[12.5px] text-white/70 hover:text-white hover:border-white/10 transition cursor-pointer"
              >
                <span>What will change?</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${detailsOpen ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {detailsOpen && (
                <ul className="mt-2 rounded-xl bg-white/[0.02] border border-white/5 p-3 flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
                  {AFFECTED_SECTIONS.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-[12px] text-white/55">
                      <span className="w-1 h-1 rounded-full bg-[#5b6cf5] shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={busy !== null}
                  className="h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doApply}
                  disabled={busy !== null}
                  className="h-9 rounded-xl px-5 text-[13px] font-normal text-white bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  {busy === "apply" ? "Applying…" : "Apply template"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}