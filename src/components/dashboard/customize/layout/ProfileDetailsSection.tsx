"use client";

import {
  type DetailKey,
  type DetailPlacement,
} from "@/components/profile/layouts/ProfilePresetLayout";

/** The slots a detail can be placed in, with the label shown on each pill. */
const PLACEMENTS: { id: Exclude<DetailPlacement, "hidden">; label: string }[] = [
  { id: "top", label: "Top of profile" },
  { id: "beside", label: "Beside profile" },
  { id: "bottom-profile", label: "Bottom of profile" },
  { id: "bottom-page", label: "Bottom of page" },
];

interface DetailRow {
  id: DetailKey;
  name: string;
  icon: React.ReactNode;
  /**
   * Restricts which slots this detail offers. Feedback is a pair of buttons rather
   * than a line of text, so the inline slots above the name would put controls in
   * the middle of the header — only the two bottom slots make sense for it.
   */
  slots?: Exclude<DetailPlacement, "hidden">[];
}

const DETAILS: DetailRow[] = [
  {
    id: "joinDate",
    name: "Join date",
    icon: (
      <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" stroke="none">
        <path d="M480 128a64 64 0 0 0-64-64h-16V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 48v16H144V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 48v16H96a64 64 0 0 0-64 64v12a4 4 0 0 0 4 4h440a4 4 0 0 0 4-4zM32 416a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V180a4 4 0 0 0-4-4H36a4 4 0 0 0-4 4z" />
      </svg>
    ),
  },
  {
    id: "location",
    name: "Location",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      </svg>
    ),
  },
  {
    id: "occupation",
    name: "Occupation",
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
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      </svg>
    ),
  },
  {
    id: "feedback",
    name: "Feedback",
    slots: ["bottom-profile", "bottom-page"],
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    ),
  },
];

/** The sentence under each detail's name, describing where it currently sits. */
function placementSummary(placement: DetailPlacement): string {
  switch (placement) {
    case "top":
      return "Shown above your name";
    case "beside":
      return "Shown beside your name and profile details";
    case "bottom-profile":
      return "Shown beneath the profile section";
    case "bottom-page":
      return "Shown at the bottom of your profile page";
    default:
      return "Not shown anywhere on your profile";
  }
}

export type DetailPlacementMap = Record<DetailKey, DetailPlacement>;

interface ProfileDetailsSectionProps {
  placements: DetailPlacementMap;
  setPlacement: (key: DetailKey, value: DetailPlacement) => void;
}

/**
 * Where each profile detail renders, or whether it renders at all.
 *
 * Join date, views and feedback also have master toggles elsewhere (Appearance).
 * Those stay the outer switch — a detail turned off there will not appear no matter
 * what is picked here, which is why this section does not duplicate them.
 */
export default function ProfileDetailsSection({
  placements,
  setPlacement,
}: ProfileDetailsSectionProps) {
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

      <div className="flex flex-col">
        {DETAILS.map((detail, index) => {
          const placement = placements[detail.id];
          const isHidden = placement === "hidden";

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
                  className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
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
                    {placementSummary(placement)}
                  </span>
                </div>

                {/* A switch rather than a text button: the bare icon-and-label had
                    no container, so it read as floating text rather than a control.
                    Matches the toggles used elsewhere in the dashboard. */}
                <button
                  type="button"
                  onClick={() =>
                    setPlacement(
                      detail.id,
                      isHidden ? detail.slots?.[0] ?? "beside" : "hidden"
                    )
                  }
                  aria-label={`${isHidden ? "Show" : "Hide"} ${detail.name}`}
                  aria-pressed={!isHidden}
                  title={isHidden ? "Show on profile" : "Hide from profile"}
                  className={`w-9 h-5 rounded-full relative flex items-center shrink-0 transition-colors cursor-pointer focus:outline-none ${
                    isHidden ? "bg-white/10 hover:bg-white/[0.14]" : "bg-[#5b6cf5]"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full absolute bg-white shadow-sm transition-all ${
                      isHidden ? "left-[3px]" : "right-[3px]"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(detail.slots
                  ? PLACEMENTS.filter((p) => detail.slots!.includes(p.id))
                  : PLACEMENTS
                ).map((slot) => {
                  const isSelected = placement === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setPlacement(detail.id, slot.id)}
                      aria-pressed={isSelected}
                      className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer focus:outline-none ${
                        isSelected
                          ? "bg-[#111326] border-[#5b6cf5]/40 text-[#5b6cf5] font-medium"
                          : isHidden
                            ? "bg-white/[0.02] border-white/5 text-white/25 hover:text-white/50"
                            : "bg-[#111111] border-white/5 text-white/50 hover:border-white/15 hover:text-white/80"
                      }`}
                    >
                      {slot.label}
                    </button>
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
