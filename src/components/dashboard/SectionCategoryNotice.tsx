import Link from "next/link";

type SectionCategory = "widgets" | "music" | "links";

const CATEGORY_COPY: Record<SectionCategory, { label: string; description: string }> = {
  widgets: {
    label: "Widgets",
    description: "Add the Widgets category to a section — widgets only show where a section includes them.",
  },
  music: {
    label: "Music",
    description: "Add the Music category to a section — your music player only shows where a section includes it.",
  },
  links: {
    label: "Links",
    description: "Add the Links category to a section — your big links only show where a section includes them.",
  },
};

export default function SectionCategoryNotice({ category }: { category: SectionCategory }) {
  const { label, description } = CATEGORY_COPY[category];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[#e0a355]/[0.04] border border-[#e0a355]/15 rounded-xl px-3.5 py-2.5">
      <svg
        className="text-[#e0a355]/70 shrink-0"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[12.5px] font-normal text-white/90 tracking-tight">
          {`${label} won't appear on your profile yet`}
        </span>
        <p className="text-[11.5px] leading-snug text-white/40">{description}</p>
      </div>
      <Link
        href="/dashboard/customize/profile/section-builder"
        className="ml-auto shrink-0 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] text-[11.5px] text-white/80 font-normal rounded-lg px-3 py-1.5 transition-colors w-fit"
      >
        Create section
      </Link>
    </div>
  );
}
