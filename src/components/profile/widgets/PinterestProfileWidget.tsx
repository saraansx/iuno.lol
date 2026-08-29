"use client";

import { usePinterestUser } from "@/lib/hooks/usePinterestUser";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";
import { WidgetRedirectIcon } from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function PinterestProfileWidget({ widget }: { widget: WidgetItem }) {
  const cleanUsername = widget.targetId
    .trim()
    .replace(/^https?:\/\/(www\.)?pinterest\.[a-z.]+\//i, "")
    .replace(/\/$/, "")
    .replace(/^@/, "");

  const { data: pinterestData, loading } = usePinterestUser(cleanUsername);

  const imageShape = widget.imageShape || "rounded";
  const showPinCount = widget.showPinCount !== undefined ? widget.showPinCount : true;
  const showBackgroundOverlay = widget.showBackgroundOverlay !== undefined ? widget.showBackgroundOverlay : true;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  const avatarUrl = pinterestData?.avatar_url
    ? `/api/widgets/pinterest/image?url=${encodeURIComponent(pinterestData.avatar_url)}`
    : "";
  const bgImageSource = pinterestData?.first_pin_image || pinterestData?.avatar_url;
  const bgImageUrl = bgImageSource
    ? `/api/widgets/pinterest/image?url=${encodeURIComponent(bgImageSource)}`
    : "";

  if (loading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!pinterestData) {
    return <WidgetUnavailable imageShape={imageShape} label="Pinterest account" />;
  }

  return (
    <a
      href={pinterestData.url || `https://www.pinterest.com/${encodeURIComponent(cleanUsername)}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {showBackgroundOverlay && bgImageUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImageUrl}
            alt=""
            className="w-full h-full object-cover opacity-45 filter blur-[10px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        <div
          className={`relative w-[74px] h-[74px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
            imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover block"
            />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#e60023">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
            </svg>
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          <OverflowPingPong deps={[pinterestData, pinterestData?.name, pinterestData?.username]}>
            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
              {pinterestData.name || pinterestData.username}
            </span>
            {pinterestData.name && (
              <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-1.5">
                @{pinterestData.username}
              </span>
            )}
          </OverflowPingPong>

          {showPinCount && (
            <OverflowPingPong deps={[pinterestData, showPinCount]}>
              <div className="flex items-center gap-1 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                <span className="text-white/85">
                  {Number(pinterestData.pin_count || 0).toLocaleString()}+
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
