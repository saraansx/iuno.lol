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
      <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
        <div className="flex items-center gap-3.5 min-w-0 w-full">
          <div
            className={`w-[60px] h-[60px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={boardData.url || `https://www.pinterest.com/${encodeURIComponent(username)}/${encodeURIComponent(boardSlug)}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {/* Top-Right Redirect Badge */}
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
      )}

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

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        {/* Cover / Pin Image */}
        <div
          className={`relative w-[60px] h-[60px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
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
            <span className="text-[15.5px] font-medium text-white tracking-tight shrink-0">
              {boardData.name}
            </span>
          </OverflowPingPong>

          {/* Pin count */}
          {showPinCount && (
            <OverflowPingPong deps={[boardData, showPinCount]}>
              <div className="flex items-center gap-1 text-[13px] text-white/60 font-normal whitespace-nowrap shrink-0">
                <span className="text-white/90 font-medium">
                  {Number(boardData.pin_count || 0).toLocaleString()}+
                </span>
                <span className="text-white/40">pins</span>
              </div>
            </OverflowPingPong>
          )}
        </div>
      </div>
    </a>
  );
}
