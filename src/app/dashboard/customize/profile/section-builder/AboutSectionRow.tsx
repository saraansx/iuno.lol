"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLayoutProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import SectionVisibilityButton from "./SectionVisibilityButton";

interface AboutSectionRowProps {
  username: string;
  hidden: boolean;
  title: string;
  description: string;
}

export default function AboutSectionRow({ username, hidden, title, description }: AboutSectionRowProps) {
  const [open, setOpen] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [descValue, setDescValue] = useState(description);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const dirty = titleValue !== title || descValue !== description;

  const save = () =>
    startTransition(async () => {
      try {
        await updateLayoutProfile({
          username,
          aboutSectionTitle: titleValue,
          aboutSectionDescription: descValue,
        });
        toast.success("About section updated");
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to update section");
      }
    });

  const cancel = () => {
    setTitleValue(title);
    setDescValue(description);
    setOpen(false);
  };

  return (
    <div className={`bg-[#0c0c0c] border border-white/5 rounded-[16px] ${hidden ? "opacity-40" : ""}`}>
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <svg className="text-white/20 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.6" />
          <circle cx="15" cy="5" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="19" r="1.6" />
          <circle cx="15" cy="19" r="1.6" />
        </svg>

        <span className="text-[#609fda] shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-normal text-white/90 tracking-tight">
              {title || "About"}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-white/30 bg-white/[0.04] border border-white/5 rounded-md px-1.5 py-0.5">
              Built-in section
            </span>
          </div>
          <p className="text-[12.5px] text-white/40 truncate">
            {description || "No subtitle — add a short line under the heading."}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Edit About section"
            aria-expanded={open}
            className="flex items-center justify-center w-8 h-8 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] rounded-xl text-white/60 hover:text-white/90 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <SectionVisibilityButton
            username={username}
            name="About"
            field="aboutSectionEnabled"
            hidden={hidden}
          />
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="about-title" className="text-[12.5px] text-white/40">Title</label>
            <input
              id="about-title"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              maxLength={60}
              placeholder="About"
              className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="about-description" className="text-[12.5px] text-white/40">Subtitle</label>
            <textarea
              id="about-description"
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              maxLength={120}
              rows={2}
              placeholder="A short line under the heading — the bio stays in the card"
              className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 resize-y focus:outline-none focus:border-white/10"
            />
            <span className="text-[11px] text-white/25 self-end">{descValue.length}/120</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancel}
              disabled={pending}
              className="bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] text-[13px] text-white/80 font-normal rounded-xl px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending || !dirty}
              className="bg-[#609fda]/20 hover:bg-[#609fda]/30 text-[13px] text-white font-normal rounded-xl px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
