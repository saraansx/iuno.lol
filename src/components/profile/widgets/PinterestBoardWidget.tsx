"use client";

import { usePinterestBoard } from "@/lib/hooks/usePinterestBoard";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";

export default function PinterestBoardWidget({ widget }: { widget: WidgetItem }) {
  const cleanInput = widget.targetId
    .trim()
    .replace(/^https?:\/\/(www\.)?pinterest\.[a-z.]+\//i, "")
    .replace(/\/$/, "")
    .replace(/^@/, "");

  const parts = cleanInput.split("/").filter(Boolean);
  const username = parts[0] || "";
  const boardSlug = parts[1] || "";

  const { data: boardData, loading } = usePinterestBoard(cleanInput);

  const imageShape = widget.imageShape || "rounded";
  const showPinCount = widget.showPinCount !== undefined ? widget.showPinCount : true;
  const showBackgroundOverlay = widget.showBackgroundOverlay !== undefined ? widget.showBackgroundOverlay : true;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  const coverUrl = boardData?.cover_image
    ? `/api/widgets/pinterest/image?url=${encodeURIComponent(boardData.cover_image)}`
    : "";
  const bgImageSource = boardData?.first_pin_image || boardData?.cover_image;
  const bgImageUrl = bgImageSource
    ? `/api/widgets/pinterest/image?url=${encodeURIComponent(bgImageSource)}`
    : "";

  if (loading || !boardData) {
    return (
      <div className="w-full h-[98px] bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-4.5 py-3.5 shadow-md flex items-center justify-between gap-3 box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-[62px] h-[62px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
          </div>
        </div>
        {showViewButton && <div className="w-12 h-7 bg-white/[0.05] rounded-xl shrink-0" />}
      </div>
    );
  }

  return (
    <div className="w-full h-[98px] bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] shadow-md overflow-hidden transition-all duration-200 hover:border-white/20 flex flex-col justify-center relative box-border">
      {/* Background Image Layer */}
      {showBackgroundOverlay && bgImageUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImageUrl}
            alt=""
            className="w-full h-full object-cover opacity-35 filter blur-[14px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/60 backdrop-blur-[2px]" />
        </div>
      )}

      <div className="px-4.5 py-3.5 flex items-center justify-between gap-3 relative z-10 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Cover / Pin Image */}
          <div
            className={`relative w-[62px] h-[62px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          >
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt=""
                className="w-full h-full object-cover block"
              />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#e60023">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
              </svg>
            )}
          </div>

          {/* Board Info & Pin Count */}
          <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
            {/* Title with ping-pong overflow scroll */}
            <OverflowPingPong deps={[boardData, boardData?.name]}>
              <span className="text-[16px] font-normal text-white/95 tracking-tight shrink-0">
                {boardData.name}
              </span>
            </OverflowPingPong>

            {/* Pin count */}
            {showPinCount && (
              <OverflowPingPong deps={[boardData, showPinCount]}>
                <div className="flex items-center gap-1 text-[12px] text-white/60 font-normal whitespace-nowrap shrink-0">
                  <span className="text-white/90 font-medium">
                    {Number(boardData.pin_count || 0).toLocaleString()}+
                  </span>
                  <span className="text-white/40">pins</span>
                </div>
              </OverflowPingPong>
            )}
          </div>
        </div>

        {/* View Board Button */}
        {showViewButton && (
          <a
            href={boardData.url || `https://www.pinterest.com/${encodeURIComponent(username)}/${encodeURIComponent(boardSlug)}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3 py-1.5 rounded-xl bg-[#609fda]/20 hover:bg-[#609fda]/30 border border-[#609fda]/30 text-[12px] font-medium text-white transition-all duration-150 flex items-center gap-1.5 shadow-[0_0_12px_rgba(96,159,218,0.15)]"
          >
            <span>View</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
