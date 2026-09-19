"use client";

interface TooltipsSectionProps {
  isUidTooltipEnabled: boolean;
  onToggleUidTooltip: () => void;
  isLocationTooltipEnabled: boolean;
  onToggleLocationTooltip: () => void;
  isOccupationTooltipEnabled: boolean;
  onToggleOccupationTooltip: () => void;
  isLikesTooltipEnabled: boolean;
  onToggleLikesTooltip: () => void;
  isDislikesTooltipEnabled: boolean;
  onToggleDislikesTooltip: () => void;
  isJoinDateTooltipEnabled: boolean;
  onToggleJoinDateTooltip: () => void;
  isViewsTooltipEnabled: boolean;
  onToggleViewsTooltip: () => void;
  isLinksTooltipEnabled: boolean;
  onToggleLinksTooltip: () => void;
  isBadgesTooltipEnabled: boolean;
  onToggleBadgesTooltip: () => void;
}

export default function TooltipsSection({
  isUidTooltipEnabled,
  onToggleUidTooltip,
  isLocationTooltipEnabled,
  onToggleLocationTooltip,
  isOccupationTooltipEnabled,
  onToggleOccupationTooltip,
  isLikesTooltipEnabled,
  onToggleLikesTooltip,
  isDislikesTooltipEnabled,
  onToggleDislikesTooltip,
  isJoinDateTooltipEnabled,
  onToggleJoinDateTooltip,
  isViewsTooltipEnabled,
  onToggleViewsTooltip,
  isLinksTooltipEnabled,
  onToggleLinksTooltip,
  isBadgesTooltipEnabled,
  onToggleBadgesTooltip,
}: TooltipsSectionProps) {
  const items = [
    {
      name: "Username / UID",
      desc: "Reveal your UID when visitors hover your username.",
      active: isUidTooltipEnabled,
      toggle: onToggleUidTooltip,
    },
    { 
      name: "Location", 
      desc: "Show your full location when visitors hover it.", 
      active: isLocationTooltipEnabled, 
      toggle: onToggleLocationTooltip 
    },
    { 
      name: "Occupation", 
      desc: "Show your full occupation when visitors hover it.", 
      active: isOccupationTooltipEnabled, 
      toggle: onToggleOccupationTooltip 
    },
    {
      name: "Feedback",
      desc: "Label the feedback buttons when visitors hover them.",
      active: isLikesTooltipEnabled && isDislikesTooltipEnabled,
      toggle: () => {
        const next = !(isLikesTooltipEnabled && isDislikesTooltipEnabled);
        if (isLikesTooltipEnabled !== next) onToggleLikesTooltip();
        if (isDislikesTooltipEnabled !== next) onToggleDislikesTooltip();
      },
    },
    { 
      name: "Join date", 
      desc: "Show your exact join date when visitors hover it.", 
      active: isJoinDateTooltipEnabled, 
      toggle: onToggleJoinDateTooltip 
    },
    {
      name: "Views",
      desc: "Show your exact view count when visitors hover it.",
      active: isViewsTooltipEnabled,
      toggle: onToggleViewsTooltip
    },
    {
      name: "Links",
      desc: "Show link titles when visitors hover your links.",
      active: isLinksTooltipEnabled,
      toggle: onToggleLinksTooltip
    },
    {
      name: "Badges",
      desc: "Show badge names when visitors hover your badges.",
      active: isBadgesTooltipEnabled,
      toggle: onToggleBadgesTooltip
    },
  ];

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-6 shadow-sm col-span-1 xl:col-span-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
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
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
              <circle cx="12" cy="12" r="2" fill="#5b6cf5" stroke="none" opacity="0.3"/>
            </svg>
            <h2 className="text-white font-normal text-[16px] tracking-tight">
              Tooltips
            </h2>
          </div>
        </div>
        <p className="text-[13px] text-white/50">
          Choose which hover tooltips show on your profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-[#141414] border border-white/5 rounded-2xl">
            <div className="flex flex-col gap-1 pr-2">
              <span className="text-[13px] font-medium text-white/90">{item.name}</span>
              <span className="text-[11px] text-white/40 leading-tight">{item.desc}</span>
            </div>
            <button
              type="button"
              onClick={item.toggle}
              className={`w-9 h-5 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${item.active ? "bg-[#5b6cf5]" : "bg-white/10"}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full absolute shadow-sm bg-white transition-all ${item.active ? "right-[3px]" : "left-[3px]"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
