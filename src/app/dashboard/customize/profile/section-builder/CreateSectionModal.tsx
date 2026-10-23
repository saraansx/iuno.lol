"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  type ProfileSection,
  type SectionCategory,
} from "@/lib/profile-sections";
import CategorySelect from "./CategorySelect";

interface CreateSectionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (section: ProfileSection) => void;
  usedCategories: Record<string, string>;
}

export default function CreateSectionModal({ open, onClose, onCreate, usedCategories }: CreateSectionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState<SectionCategory[]>([]);

  function handleClose() {
    setTitle("");
    setDescription("");
    setBio("");
    setCategories([]);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  if (!open) return null;

  const canCreate = title.trim().length > 0 && categories.length > 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create section"
        className="relative w-full max-w-[460px] max-h-[85vh] overflow-y-auto bg-[#0c0c0c] border border-white/10 rounded-[24px] p-4 sm:p-6 shadow-2xl z-10 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="text-[16px] font-normal text-white/95 tracking-tight">Create section</h3>
            <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
              Add a title, optional description and up to 3 categories.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="section-title" className="text-[12.5px] text-white/40">
              Title
            </label>
            <input
              id="section-title"
              value={title}
              onChange={(event) => setTitle(event.target.value.slice(0, 60))}
              maxLength={60}
              autoFocus
              placeholder="e.g. Socials, About me, Setup"
              className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="section-description" className="text-[12.5px] text-white/40">
              Description <span className="text-white/25">(optional)</span>
            </label>
            <input
              id="section-description"
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, 160))}
              maxLength={160}
              placeholder="A small line under the title"
              className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-white/40">Categories</span>
            <CategorySelect
              value={categories}
              onChange={(next) => {
                setCategories(next);
                if (!next.includes("bio")) setBio("");
              }}
              usedCategories={usedCategories}
            />
          </div>

          {categories.includes("bio") && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="section-bio" className="text-[12.5px] text-white/40">
                Section bio <span className="text-white/25">(separate from your card bio)</span>
              </label>
              <textarea
                id="section-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value.slice(0, 500))}
                maxLength={500}
                rows={4}
                placeholder="Write something for this section..."
                className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10 resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-3.5 py-2 text-[13px] text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => {
              if (!canCreate) return;
              onCreate({
                id: `section-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
                title: title.trim(),
                description: description.trim(),
                bio: bio.trim(),
                categories,
              });
              handleClose();
            }}
            className="rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 px-4 py-2 text-[13px] font-normal text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create section
          </button>
        </div>
      </div>
    </div>
  );
}
