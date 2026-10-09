"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toast";

interface PreviewToolbarProps {
  templateId: number;
  templateName: string;
  slug: string;
  isPublic: boolean;
  username: string;
}

export default function PreviewToolbar({
  templateId,
  templateName,
  slug,
  isPublic,
  username,
}: PreviewToolbarProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<"apply" | "save" | null>(null);

  const goToTemplate = useCallback(() => {
    router.push(`/template/${slug}`);
  }, [router, slug]);

  const apply = useCallback(async () => {
    setBusy("apply");
    try {
      const r = await fetch(`/api/templates/${templateId}/apply`, { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error ?? "Failed");
      toast.success("Template applied!");
      router.push(`/${username}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }, [router, templateId, username]);

  const save = useCallback(async () => {
    setBusy("save");
    const post = async (name: string) => {
      const r = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return { ok: r.ok, error: (await r.json().catch(() => ({}))).error as string | undefined };
    };
    try {
      let res = await post(templateName);
      if (!res.ok && res.error?.toLowerCase().includes("already have a template")) {
        res = await post(`${templateName} 2`);
      }
      if (!res.ok) throw new Error(res.error ?? "Failed");
      toast.success("Saved to your templates");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }, [templateName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] w-[min(430px,calc(100vw-2rem))]"
    >
      <div className="flex items-center gap-1 rounded-full bg-[#0c0c0c]/95 border border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.4)] p-1.5">
        <span className="min-w-0 flex-1 pl-3 pr-1 text-[13px] text-white/70 truncate">{templateName}</span>

        <button
          type="button"
          onClick={goToTemplate}
          title="Back to template"
          aria-label="Back to template"
          className="h-8 w-8 rounded-full text-white/55 hover:text-white hover:bg-white/[0.08] transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={save}
          disabled={busy !== null}
          title={busy === "save" ? "Saving…" : "Save a copy"}
          aria-label="Save a copy"
          className="h-8 w-8 rounded-full text-white/55 hover:text-white hover:bg-white/[0.08] transition cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M4 21h16" />
          </svg>
        </button>

        <button
          type="button"
          onClick={apply}
          disabled={busy !== null}
          className="h-8 px-4 rounded-full bg-[#5b6cf5]/25 hover:bg-[#5b6cf5]/35 border border-[#5b6cf5]/30 text-white text-[12.5px] font-normal transition cursor-pointer disabled:opacity-50 shrink-0"
          style={{ fontFamily: "var(--font-comfortaa)" }}
        >
          {busy === "apply" ? "Applying…" : "Apply"}
        </button>
      </div>
      {!isPublic && (
        <p className="mt-2 text-center text-[11px] text-white/30">This template is private — only you can see this preview.</p>
      )}
    </motion.div>
  );
}