"use client";

interface ViewsSectionProps {
  isViewsEnabled: boolean;
  setIsViewsEnabled: (v: boolean) => void;
  isViewsAnimationEnabled: boolean;
  setIsViewsAnimationEnabled: (v: boolean) => void;
  viewsAnimationDuration: number | "";
  setViewsAnimationDuration: (v: number) => void;
}

export default function ViewsSection({
  isViewsEnabled,
  setIsViewsEnabled,
  isViewsAnimationEnabled,
  setIsViewsAnimationEnabled,
  viewsAnimationDuration,
  setViewsAnimationDuration,
}: ViewsSectionProps) {
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
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
              <circle cx="12" cy="12" r="1" fill="#5b6cf5" stroke="none"/>
            </svg>
            <h2 className="text-white font-normal text-[16px] tracking-tight">
              Views
            </h2>
          </div>
          <button
            onClick={() => setIsViewsEnabled(!isViewsEnabled)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer focus:outline-none border ${
              isViewsEnabled
                ? "bg-[#111326] border-[#202442] hover:bg-[#161933] text-[#5b6cf5]"
                : "bg-[#161616] border-white/5 hover:bg-white/[0.03] text-white/40"
            }`}
          >
            <div className={`w-8 h-5 rounded-full relative flex items-center transition-colors ${isViewsEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all ${isViewsEnabled ? "right-[3px]" : "left-[3px]"}`}></div>
            </div>
            <span className={`text-[13px] font-medium pr-1 ${isViewsEnabled ? "text-[#5b6cf5]" : ""}`}>
              {isViewsEnabled ? "Enabled" : "Disabled"}
            </span>
          </button>
        </div>
        <p className="text-[13px] text-white/50">
          Show how many times your profile has been viewed.
        </p>
      </div>

      <div className={`flex flex-col gap-4 mt-2 transition-opacity duration-200 ${isViewsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="w-full h-px bg-white/5" />
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-white/90">
              Counter animation
            </label>
            <p className="text-[12px] text-white/40">
              Count views up with a short animation instead of showing the number instantly.
            </p>
          </div>
          <button
            onClick={() => setIsViewsAnimationEnabled(!isViewsAnimationEnabled)}
            disabled={!isViewsEnabled}
            className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none ${isViewsAnimationEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}
          >
            <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${isViewsAnimationEnabled ? "right-[4px]" : "left-[4px]"}`}></div>
          </button>
        </div>

        {/* Duration only means something while the counter animates. */}
        <div className={`flex flex-col gap-3 mt-1 transition-opacity duration-200 ${isViewsAnimationEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-medium text-white/90">
              Animation duration
            </label>
            <span className="text-[12px] text-white/40 font-mono">
              {viewsAnimationDuration}ms
            </span>
          </div>

          <div className="relative flex items-center h-5 group w-full">
            <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-[#5b6cf5]"
                style={{ width: `${((Number(viewsAnimationDuration) || 0) / 5000) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={viewsAnimationDuration}
              onChange={(e) => setViewsAnimationDuration(Number(e.target.value))}
              // `pointer-events-none` on the wrapper stops the mouse but leaves the
              // slider in the tab order; `disabled` takes it out for keyboards too.
              disabled={!isViewsEnabled || !isViewsAnimationEnabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-default"
            />
            <div
              className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform group-active:scale-110 shadow-lg"
              style={{
                left: `calc(${((Number(viewsAnimationDuration) || 0) / 5000) * 100}% - 8px)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
