"use client";

interface FeedbackSectionProps {
  isFeedbackEnabled: boolean;
  setIsFeedbackEnabled: (v: boolean) => void;
  isShowFeedbackPublicly: boolean;
  setIsShowFeedbackPublicly: (v: boolean) => void;
}

export default function FeedbackSection({
  isFeedbackEnabled,
  setIsFeedbackEnabled,
  isShowFeedbackPublicly,
  setIsShowFeedbackPublicly,
}: FeedbackSectionProps) {
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
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              <circle cx="12" cy="12" r="3" fill="#5b6cf5" stroke="none" opacity="0.3"/>
            </svg>
            <h2 className="text-white font-normal text-[16px] tracking-tight">
              Feedback
            </h2>
          </div>
          <button
            onClick={() => setIsFeedbackEnabled(!isFeedbackEnabled)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer focus:outline-none border ${
              isFeedbackEnabled
                ? "bg-[#111326] border-[#202442] hover:bg-[#161933] text-[#5b6cf5]"
                : "bg-[#161616] border-white/5 hover:bg-white/[0.03] text-white/40"
            }`}
          >
            <div className={`w-8 h-5 rounded-full relative flex items-center transition-colors ${isFeedbackEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all ${isFeedbackEnabled ? "right-[3px]" : "left-[3px]"}`}></div>
            </div>
            <span className={`text-[13px] font-medium pr-1 ${isFeedbackEnabled ? "text-[#5b6cf5]" : ""}`}>
              {isFeedbackEnabled ? "Enabled" : "Disabled"}
            </span>
          </button>
        </div>
        <p className="text-[13px] text-white/50">
          Collect feedback from visitors.
        </p>
      </div>

      <div className={`flex flex-col gap-4 mt-2 transition-opacity duration-200 ${isFeedbackEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="w-full h-px bg-white/5" />
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-white/90">
              Show feedback publicly
            </label>
            <p className="text-[12px] text-white/40">
              Let visitors see the feedback others have submitted.
            </p>
          </div>
          <button
            onClick={() => setIsShowFeedbackPublicly(!isShowFeedbackPublicly)}
            className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none ${isShowFeedbackPublicly ? "bg-[#5b6cf5]" : "bg-white/10"}`}
          >
            <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${isShowFeedbackPublicly ? "right-[4px]" : "left-[4px]"}`}></div>
          </button>
        </div>
      </div>
    </div>
  );
}
