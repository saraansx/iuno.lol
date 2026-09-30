"use client";

import { useYouTubeChannel } from "@/lib/hooks/useYouTubeChannel";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { formatYouTubeNumber, formatUploadDate } from "@/lib/youtube";
import OverflowPingPong from "./OverflowPingPong";
import {
  YouTubeLogoIcon,
  YouTubeSubscribersIcon,
  YouTubeViewsIcon,
  YouTubeVideoIcon,
  YouTubeLikesIcon,
  YouTubeCalendarIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function YouTubeWidget({ widget }: { widget: WidgetItem }) {
  const { data, loading } = useYouTubeChannel(widget.targetId);

  const imageShape = widget.imageShape || "rounded";
  const mode = widget.youtubeMode || "channel";
  const imageSource = widget.youtubeImageSource || "channel-avatar";
  const showSubscribers = widget.youtubeShowSubscribers !== undefined ? widget.youtubeShowSubscribers : true;
  const showVideoCount = widget.youtubeShowVideoCount !== undefined ? widget.youtubeShowVideoCount : true;
  const showTotalViews = widget.youtubeShowTotalViews !== undefined ? widget.youtubeShowTotalViews : true;
  const showVideoViews = widget.youtubeShowVideoViews !== undefined ? widget.youtubeShowVideoViews : true;
  const showVideoLikes = widget.youtubeShowVideoLikes !== undefined ? widget.youtubeShowVideoLikes : true;
  const showUploadDate = widget.youtubeShowUploadDate !== undefined ? widget.youtubeShowUploadDate : true;
  const showBackground = widget.youtubeShowBackground !== undefined ? widget.youtubeShowBackground : false;
  const showBanner = widget.youtubeShowBanner !== undefined ? widget.youtubeShowBanner : false;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  const isVideoMode = mode === "latest-video";

  const rawImageUrl =
    imageSource === "video-thumbnail"
      ? data?.video?.thumbnailUrl || data?.avatarUrl || ""
      : data?.avatarUrl || "";

  const imageUrl = rawImageUrl
    ? `/api/widgets/youtube/image?url=${encodeURIComponent(rawImageUrl)}`
    : "";

  const bannerUrl = data?.bannerUrl
    ? `/api/widgets/youtube/image?url=${encodeURIComponent(data.bannerUrl)}`
    : "";

  const bannerSrc = showBanner && bannerUrl ? bannerUrl : null;
  const bgSrc = !bannerSrc && showBackground ? imageUrl : null;

  if (loading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!data) {
    return <WidgetUnavailable imageShape={imageShape} label="YouTube channel" />;
  }

  const channelUrl = data.handle
    ? `https://www.youtube.com/${data.handle}`
    : `https://www.youtube.com/channel/${data.channelId}`;
  const videoUrl = data.video
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(data.video.id)}`
    : channelUrl;
  const profileUrl = isVideoMode ? videoUrl : channelUrl;

  const title = isVideoMode ? data.video?.title || data.title : data.title;
  const subtitle = isVideoMode ? data.title : data.handle;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {bannerSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy"
            src={bannerSrc}
            alt=""
            className="w-full h-full object-cover opacity-50 filter blur-[2px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/85 via-[#101010]/65 to-[#101010]/40" />
        </div>
      )}

      {bgSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy"
            src={bgSrc}
            alt=""
            className="w-full h-full object-cover opacity-35 filter blur-[12px] scale-125"
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
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy"
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover block"
            />
          ) : (
            <YouTubeLogoIcon size={32} className="text-[#FF0000]/80" />
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          <OverflowPingPong deps={[data, title, subtitle, isVideoMode]}>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                {title}
              </span>
              {subtitle && (
                <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-0.5">
                  {subtitle}
                </span>
              )}
            </div>
          </OverflowPingPong>

          <OverflowPingPong
            deps={[
              data,
              isVideoMode,
              showSubscribers,
              showVideoCount,
              showTotalViews,
              showVideoViews,
              showVideoLikes,
              showUploadDate,
            ]}
          >
            <div className="flex items-center gap-3 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
              {!isVideoMode && (
                <>
                  {showSubscribers && (
                    <div className="flex items-center gap-1 shrink-0">
                      <YouTubeSubscribersIcon size={13} className="text-white/70" />
                      <span className="text-white/85">
                        {formatYouTubeNumber(data.subscriberCount)}
                      </span>
                      <span className="text-white/40">subscribers</span>
                    </div>
                  )}
                  {showVideoCount && (
                    <div className="flex items-center gap-1 shrink-0">
                      <YouTubeVideoIcon size={13} className="text-white/70" />
                      <span className="text-white/85">
                        {formatYouTubeNumber(data.videoCount)}
                      </span>
                      <span className="text-white/40">videos</span>
                    </div>
                  )}
                  {showTotalViews && (
                    <div className="flex items-center gap-1 shrink-0">
                      <YouTubeViewsIcon size={13} className="text-white/70" />
                      <span className="text-white/85">
                        {formatYouTubeNumber(data.viewCount)}
                      </span>
                      <span className="text-white/40">views</span>
                    </div>
                  )}
                </>
              )}
              {isVideoMode && data.video && (
                <>
                  {showVideoViews && (
                    <div className="flex items-center gap-1 shrink-0">
                      <YouTubeViewsIcon size={13} className="text-white/70" />
                      <span className="text-white/85">
                        {formatYouTubeNumber(data.video.viewCount)}
                      </span>
                      <span className="text-white/40">views</span>
                    </div>
                  )}
                  {showVideoLikes && (
                    <div className="flex items-center gap-1 shrink-0">
                      <YouTubeLikesIcon size={13} className="text-[#FF0000]" />
                      <span className="text-white/85">
                        {formatYouTubeNumber(data.video.likeCount)}
                      </span>
                      <span className="text-white/40">likes</span>
                    </div>
                  )}
                  {showUploadDate && data.video.publishedAt && (
                    <div className="flex items-center gap-1 shrink-0">
                      <YouTubeCalendarIcon size={13} className="text-white/70" />
                      <span className="text-white/85">
                        {formatUploadDate(data.video.publishedAt)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </OverflowPingPong>
        </div>
      </div>
    </a>
  );
}
