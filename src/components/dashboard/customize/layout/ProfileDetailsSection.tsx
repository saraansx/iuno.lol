"use client";

/**
 * Placement settings for each profile detail.
 *
 * Presentational for now: the rows show the shape the settings will take — which
 * slot a detail sits in, and whether it is shown at all — but nothing is wired to a
 * column, so the whole block is rendered inert. Wiring a row up means giving it
 * state and dropping the `pointer-events-none` wrapper, the same way Wrap in card
 * works in StandardProfileSection.
 */

/** The slots a detail can be placed in. */
const PLACEMENTS = [
  "Top of profile",
  "Beside profile",
  "Bottom of profile",
  "Bottom of page",
] as const;

type Placement = (typeof PLACEMENTS)[number];

interface DetailRow {
  id: string;
  name: string;
  icon: React.ReactNode;
  /** `null` renders the row as hidden — dimmed, with no slot selected. */
  placement: Placement | null;
}

const DETAILS: DetailRow[] = [
  {
    id: "join-date",
    name: "Join date",
    placement: null,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    id: "location",
    name: "Location",
    placement: "Beside profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      </svg>
    ),
  },
  {
    id: "occupation",
    name: "Occupation",
    placement: "Beside profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: "uid",
    name: "UID",
    placement: null,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9h16" />
        <path d="M4 15h16" />
        <path d="M10 3 8 21" />
        <path d="M16 3l-2 18" />
      </svg>
    ),
  },
  {
    id: "views",
    name: "Views",
    placement: "Bottom of profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      </svg>
    ),
  },
  {
    id: "feedback",
    name: "Feedback",
    placement: "Bottom of profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    ),
  },
];

/** The sentence under each detail's name, describing where it currently sits. */
function placementSummary(placement: Placement | null): string {
  switch (placement) {
    case "Top of profile":
      return "Shown above your name";
    case "Beside profile":
      return "Shown beside your name and profile details";
    case "Bottom of profile":
      return "Shown beneath the profile section";
    case "Bottom of page":
      return "Shown at the bottom of the page";
    default:
      return "Not shown anywhere on your profile";
  }
}

export default function ProfileDetailsSection() {
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
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
          </svg>
          <h2 className="text-white font-normal text-[16px] tracking-tight">
            Profile details
          </h2>
        </div>
        <p className="text-[13px] text-white/40">
          Choose where each profile detail appears, or hide it entirely.
        </p>
      </div>

      <div className="flex flex-col opacity-40 pointer-events-none select-none">
        {DETAILS.map((detail, index) => {
          const isHidden = detail.placement === null;

          return (
            <div
              key={detail.id}
              // Hairline between rows rather than around them, so the list reads as
              // one block instead of six stacked cards.
              className={`flex flex-col gap-3 py-5 ${
                index > 0 ? "border-t border-white/5" : "pt-0"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                    isHidden
                      ? "bg-white/[0.03] text-white/20"
                      : "bg-[#5b6cf5]/10 text-[#5b6cf5]"
                  }`}
                >
                  {detail.icon}
                </div>

                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span
                    className={`text-[13px] font-medium ${
                      isHidden ? "text-white/35" : "text-white/90"
                    }`}
                  >
                    {detail.name}
                  </span>
                  <span className="text-[11.5px] text-white/35 leading-snug">
                    {placementSummary(detail.placement)}
                  </span>
                </div>

                {/* Only shown for a visible detail: there is nothing to hide on a
                    row that is already hidden. */}
                {!isHidden && (
                  <div className="flex items-center gap-1.5 text-white/45 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <path d="m2 2 20 20" />
                    </svg>
                    <span className="text-[12px]">Hide</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {PLACEMENTS.map((slot) => {
                  const isSelected = detail.placement === slot;
                  return (
                    <span
                      key={slot}
                      className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
                        isSelected
                          ? "bg-[#111326] border-[#5b6cf5]/40 text-[#5b6cf5] font-medium"
                          : isHidden
                            ? "bg-white/[0.02] border-white/5 text-white/25"
                            : "bg-[#111111] border-white/5 text-white/50"
                      }`}
                    >
                      {slot}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
