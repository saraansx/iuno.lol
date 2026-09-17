"use client";

import Link from "next/link";

interface SectionedProfileSectionProps {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
}

export default function SectionedProfileSection({
  enabled,
  setEnabled,
}: SectionedProfileSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5b6cf5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20" />
            <path d="m8 6 4-4 4 4" />
            <path d="m8 18 4 4 4-4" />
          </svg>
          <h2 className="text-white font-normal text-[16px] tracking-tight">
            Sectioned profile
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          aria-pressed={enabled}
          aria-label="Sectioned profile"
          className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 cursor-pointer focus:outline-none ${
            enabled ? "bg-[#5b6cf5]" : "bg-white/10"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${
              enabled ? "right-[4px]" : "left-[4px]"
            }`}
          />
        </button>
      </div>

      <p className="text-[13px] text-white/40">
        Split your content into sections you scroll through.
      </p>

      {enabled && (
        <div className="mt-2 flex items-center gap-2.5 bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5">
          <svg
            className="text-[#5b6cf5] shrink-0"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="text-[12.5px] text-white/50">
            Head to the{" "}
            <Link
              href="/dashboard/customize/profile/section-builder"
              className="text-[#5b6cf5] hover:underline"
            >
              section builder
            </Link>{" "}
            to customize your sections and everything else.
          </span>
        </div>
      )}
    </div>
  );
}
