"use client";

import React from "react";

interface CommentsSectionProps {
  isCommentsEnabled: boolean;
  setIsCommentsEnabled: (v: boolean) => void;
  isShowCommentsPublicly: boolean;
  setIsShowCommentsPublicly: (v: boolean) => void;
  isAllowNewComments: boolean;
  setIsAllowNewComments: (v: boolean) => void;
}

export default function CommentsSection({
  isCommentsEnabled,
  setIsCommentsEnabled,
  isShowCommentsPublicly,
  setIsShowCommentsPublicly,
  isAllowNewComments,
  setIsAllowNewComments,
}: CommentsSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-medium text-[16px] tracking-tight">
            Comments
          </h2>
          <button
            onClick={() => setIsCommentsEnabled(!isCommentsEnabled)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer focus:outline-none border ${
              isCommentsEnabled
                ? "bg-[#111326] border-[#202442] hover:bg-[#161933] text-[#5b6cf5]"
                : "bg-[#161616] border-white/5 hover:bg-white/[0.03] text-white/40"
            }`}
          >
            <div className={`w-8 h-5 rounded-full relative flex items-center transition-colors ${isCommentsEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all ${isCommentsEnabled ? "right-[3px]" : "left-[3px]"}`}></div>
            </div>
            <span className={`text-[13px] font-medium pr-1 ${isCommentsEnabled ? "text-[#5b6cf5]" : ""}`}>
              {isCommentsEnabled ? "Enabled" : "Disabled"}
            </span>
          </button>
        </div>
        <p className="text-[13px] text-white/50">
          Let visitors leave comments on your profile.
        </p>
      </div>

      <div className={`flex flex-col gap-4 mt-2 transition-opacity duration-200 ${isCommentsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="w-full h-px bg-white/5" />
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-white/90">
              Show comments publicly
            </label>
            <p className="text-[12px] text-white/40">
              Let visitors see the comments others have left.
            </p>
          </div>
          <button
            onClick={() => setIsShowCommentsPublicly(!isShowCommentsPublicly)}
            className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none ${isShowCommentsPublicly ? "bg-[#5b6cf5]" : "bg-white/10"}`}
          >
            <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${isShowCommentsPublicly ? "right-[4px]" : "left-[4px]"}`}></div>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-white/90">
              Allow new comments
            </label>
            <p className="text-[12px] text-white/40">
              Let visitors write new comments on your page.
            </p>
          </div>
          <button
            onClick={() => setIsAllowNewComments(!isAllowNewComments)}
            className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none ${isAllowNewComments ? "bg-[#5b6cf5]" : "bg-white/10"}`}
          >
            <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${isAllowNewComments ? "right-[4px]" : "left-[4px]"}`}></div>
          </button>
        </div>
      </div>
    </div>
  );
}
