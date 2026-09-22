"use client";

interface IconsGlowSectionProps {
  isIconsGlowEnabled: boolean;
  setIsIconsGlowEnabled: (v: boolean) => void;
  isJoinDateIconGlow: boolean;
  setIsJoinDateIconGlow: (v: boolean) => void;
  isLocationIconGlow: boolean;
  setIsLocationIconGlow: (v: boolean) => void;
  isOccupationIconGlow: boolean;
  setIsOccupationIconGlow: (v: boolean) => void;
  isUidIconGlow: boolean;
  setIsUidIconGlow: (v: boolean) => void;
  isViewsIconGlow: boolean;
  setIsViewsIconGlow: (v: boolean) => void;
  isFeedbackIconGlow: boolean;
  setIsFeedbackIconGlow: (v: boolean) => void;
}

export default function IconsGlowSection({
  isIconsGlowEnabled,
  setIsIconsGlowEnabled,
  isJoinDateIconGlow,
  setIsJoinDateIconGlow,
  isLocationIconGlow,
  setIsLocationIconGlow,
  isOccupationIconGlow,
  setIsOccupationIconGlow,
  isUidIconGlow,
  setIsUidIconGlow,
  isViewsIconGlow,
  setIsViewsIconGlow,
  isFeedbackIconGlow,
  setIsFeedbackIconGlow,
}: IconsGlowSectionProps) {
  const items = [
    {
      name: "Join date",
      desc: "Glow the join date icon on your profile.",
      active: isJoinDateIconGlow,
      toggle: () => setIsJoinDateIconGlow(!isJoinDateIconGlow),
    },
    {
      name: "Occupation",
      desc: "Glow the occupation icon on your profile.",
      active: isOccupationIconGlow,
      toggle: () => setIsOccupationIconGlow(!isOccupationIconGlow),
    },
    {
      name: "Location",
      desc: "Glow the location icon on your profile.",
      active: isLocationIconGlow,
      toggle: () => setIsLocationIconGlow(!isLocationIconGlow),
    },
    {
      name: "UID",
      desc: "Glow the UID icon on your profile.",
      active: isUidIconGlow,
      toggle: () => setIsUidIconGlow(!isUidIconGlow),
    },
    {
      name: "Views",
      desc: "Glow the views icon on your profile.",
      active: isViewsIconGlow,
      toggle: () => setIsViewsIconGlow(!isViewsIconGlow),
    },
    {
      name: "Feedback",
      desc: "Glow the like / dislike icons on your profile.",
      active: isFeedbackIconGlow,
      toggle: () => setIsFeedbackIconGlow(!isFeedbackIconGlow),
    },
  ];

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-6 shadow-sm">
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
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <circle cx="12" cy="12" r="2" fill="#5b6cf5" stroke="none" opacity="0.5" />
            </svg>
            <h2 className="text-white font-normal text-[16px] tracking-tight">
              Icons glow
            </h2>
          </div>
          <button
            onClick={() => setIsIconsGlowEnabled(!isIconsGlowEnabled)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer focus:outline-none border ${
              isIconsGlowEnabled
                ? "bg-[#111326] border-[#202442] hover:bg-[#161933] text-[#5b6cf5]"
                : "bg-[#161616] border-white/5 hover:bg-white/[0.03] text-white/40"
            }`}
          >
            <div className={`w-8 h-5 rounded-full relative flex items-center transition-colors ${isIconsGlowEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all ${isIconsGlowEnabled ? "right-[3px]" : "left-[3px]"}`}></div>
            </div>
            <span className={`text-[13px] font-medium pr-1 ${isIconsGlowEnabled ? "text-[#5b6cf5]" : ""}`}>
              {isIconsGlowEnabled ? "Enabled" : "Disabled"}
            </span>
          </button>
        </div>
        <p className="text-[13px] text-white/50">
          Add a soft glow to the icons on your profile.
        </p>
      </div>

      <div className={`flex flex-col gap-4 transition-opacity duration-200 ${isIconsGlowEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="w-full h-px bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
