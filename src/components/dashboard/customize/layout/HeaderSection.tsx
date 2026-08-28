"use client";

/**
 * Header placement settings for the standard profile.
 *
 * Presentational for now: both dropdowns show the shape the settings will take but
 * neither is wired to a column, so they are rendered inert rather than interactive.
 * Wiring one up means giving it state and dropping the `pointer-events-none`
 * wrapper, the same way Wrap in card works in StandardProfileSection.
 */

/** The value each dropdown currently displays. */
const AVATAR_PLACEMENT = "Right";
const BADGES_PLACEMENT = "Header footer";

/** Label with a hint icon, matching the layout rows in StandardProfileSection. */
function RowLabel({ text, hint }: { text: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5 w-[130px] shrink-0">
      <span className="text-[12.5px] font-medium text-white/35">{text}</span>
      <span className="text-white/25" title={hint}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </span>
    </div>
  );
}

/** A dropdown trigger rendered without a menu, since nothing is selectable yet. */
function InertDropdown({ value }: { value: string }) {
  return (
    <div className="flex-1 flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5">
      <span className="text-[13.5px] text-white/70">{value}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/40"
      >
        <path d="m7 15 5 5 5-5" />
        <path d="m7 9 5-5 5 5" />
      </svg>
    </div>
  );
}

export default function HeaderSection() {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <circle cx="7.5" cy="6" r="1.25" fill="#5b6cf5" stroke="none" />
          </svg>
          <h2 className="text-white font-normal text-[16px] tracking-tight">
            Header
          </h2>
        </div>
        <p className="text-[13px] text-white/40">
          Choose where your avatar and badges appear in the header.
        </p>
      </div>

      <div className="flex flex-col gap-5 opacity-40 pointer-events-none select-none">
        <div className="flex items-center gap-4">
          <RowLabel text="Avatar" hint="Not available yet." />
          <InertDropdown value={AVATAR_PLACEMENT} />
        </div>

        <div className="flex items-center gap-4">
          <RowLabel text="Badges" hint="Not available yet." />
          <InertDropdown value={BADGES_PLACEMENT} />
        </div>
      </div>
    </div>
  );
}
