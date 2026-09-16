"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLayoutProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";

interface SectionVisibilityButtonProps {
  name: string;
  field: "aboutSectionEnabled" | "widgetsSectionEnabled" | "linksSectionEnabled";
  hidden: boolean;
}

export default function SectionVisibilityButton({
  name,
  field,
  hidden,
}: SectionVisibilityButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () =>
    startTransition(async () => {
      try {
        await updateLayoutProfile({ [field]: hidden });
        toast.success(hidden ? `${name} section shown` : `${name} section hidden`);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to update section");
      }
    });

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={`${hidden ? "Show" : "Hide"} ${name} section`}
      className="flex items-center justify-center w-8 h-8 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] rounded-xl text-white/60 hover:text-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {hidden ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.6 6.6A18.5 18.5 0 0 0 2 12s3 8 10 8a9.1 9.1 0 0 0 5.4-1.6" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <path d="M2 2l20 20" />
        </svg>
      )}
    </button>
  );
}
