"use client";

import { useTelegramUser } from "@/lib/hooks/useTelegramUser";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";
import {
  TelegramBioIcon,
  TelegramLogoIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function TelegramWidget({ widget }: { widget: WidgetItem }) {
  const cleanUsername = (widget.targetId || "").trim();
  const { user, isLoading } = useTelegramUser(cleanUsername);

  const imageShape = widget.imageShape || "rounded";
  const showBio =
    widget.telegramShowBio !== undefined ? widget.telegramShowBio : true;
  const showBackground =
    widget.telegramShowBackground !== undefined ? widget.telegramShowBackground : false;
  const showBackgroundOverlay =
    widget.showBackgroundOverlay !== undefined ? widget.showBackgroundOverlay : true;
  const showViewButton =
    widget.showViewButton !== undefined ? widget.showViewButton : true;

  if (isLoading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!user) {
    return <WidgetUnavailable imageShape={imageShape} label="Telegram profile" />;
  }

  const avatarSrc = user.avatarUrl
    ? `/api/widgets/telegram/image?url=${encodeURIComponent(user.avatarUrl)}`
    : null;

  const bgSrc = showBackground ? avatarSrc : null;

  return (
    <a
      href={`https://t.me/${encodeURIComponent(user.username)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {bgSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgSrc}
            alt=""
            className={`w-full h-full object-cover ${
              showBackgroundOverlay
                ? "opacity-35 filter blur-[12px] scale-125"
                : "opacity-100 scale-105"
            }`}
          />
          {showBackgroundOverlay && (
            <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
          )}
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        <div
          className={`relative w-[74px] h-[74px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
            imageShape === "square"
              ? "rounded-none"
              : imageShape === "circle"
              ? "rounded-full"
              : "rounded-2xl"
          }`}
        >
          {avatarSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarSrc}
              alt={user.displayName}
              className="w-full h-full object-cover block"
            />
          ) : (
            <TelegramLogoIcon size={30} className="w-[30px] h-[30px] opacity-40" />
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden pr-6">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <OverflowPingPong deps={[user, user.displayName]}>
              <div className="flex items-center gap-1.5 shrink-0">
                <TelegramLogoIcon size={14} className="w-3.5 h-3.5 shrink-0" />

                <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                  {user.displayName}
                </span>
              </div>
            </OverflowPingPong>
          </div>

          <div className="min-w-0 overflow-hidden">
            <OverflowPingPong deps={[user.bio, showBio]}>
              <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight whitespace-nowrap shrink-0">
                {showBio && user.bio ? (
                  <>
                    <TelegramBioIcon
                      size={13}
                      className="w-[13px] h-[13px] shrink-0 text-white/50"
                    />
                    <span className="text-white/60 shrink-0">{user.bio}</span>
                  </>
                ) : (
                  <span className="text-white/40 shrink-0">@{user.username}</span>
                )}
              </div>
            </OverflowPingPong>
          </div>
        </div>
      </div>
    </a>
  );
}
