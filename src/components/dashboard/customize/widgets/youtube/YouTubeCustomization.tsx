"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import ModeSetting from "./settings/ModeSetting";
import ImageSourceSetting from "./settings/ImageSourceSetting";
import ShowSubscribersSetting from "./settings/ShowSubscribersSetting";
import ShowVideoCountSetting from "./settings/ShowVideoCountSetting";
import ShowTotalViewsSetting from "./settings/ShowTotalViewsSetting";
import ShowVideoViewsSetting from "./settings/ShowVideoViewsSetting";
import ShowVideoLikesSetting from "./settings/ShowVideoLikesSetting";
import ShowUploadDateSetting from "./settings/ShowUploadDateSetting";
import ShowBackgroundSetting from "./settings/ShowBackgroundSetting";
import ShowBannerSetting from "./settings/ShowBannerSetting";
import ShowViewButtonSetting from "./settings/ShowViewButtonSetting";

interface YouTubeCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  mode: "channel" | "latest-video";
  onModeChange: (val: "channel" | "latest-video") => void;
  imageSource: "channel-avatar" | "video-thumbnail";
  onImageSourceChange: (val: "channel-avatar" | "video-thumbnail") => void;
  showSubscribers: boolean;
  onShowSubscribersChange: (val: boolean) => void;
  showVideoCount: boolean;
  onShowVideoCountChange: (val: boolean) => void;
  showTotalViews: boolean;
  onShowTotalViewsChange: (val: boolean) => void;
  showVideoViews: boolean;
  onShowVideoViewsChange: (val: boolean) => void;
  showVideoLikes: boolean;
  onShowVideoLikesChange: (val: boolean) => void;
  showUploadDate: boolean;
  onShowUploadDateChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showBanner: boolean;
  onShowBannerChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function YouTubeCustomization({
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  mode,
  onModeChange,
  imageSource,
  onImageSourceChange,
  showSubscribers,
  onShowSubscribersChange,
  showVideoCount,
  onShowVideoCountChange,
  showTotalViews,
  onShowTotalViewsChange,
  showVideoViews,
  onShowVideoViewsChange,
  showVideoLikes,
  onShowVideoLikesChange,
  showUploadDate,
  onShowUploadDateChange,
  showBackground,
  onShowBackgroundChange,
  showBanner,
  onShowBannerChange,
  showViewButton,
  onShowViewButtonChange,
}: YouTubeCustomizationProps) {
  const isChannel = mode === "channel";
  const channelStatsDisabled = !isChannel;
  const videoStatsDisabled = isChannel;

  const bannerDisabled = showBackground && !showBanner;
  const backgroundDisabled = showBanner && !showBackground;

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">YouTube Settings</h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize how your YouTube widget appears on your page.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />
        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />
        <ModeSetting value={mode} onChange={onModeChange} />
        <ImageSourceSetting value={imageSource} onChange={onImageSourceChange} />
        <ShowSubscribersSetting value={showSubscribers} onChange={onShowSubscribersChange} disabled={channelStatsDisabled} />
        <ShowVideoCountSetting value={showVideoCount} onChange={onShowVideoCountChange} disabled={channelStatsDisabled} />
        <ShowTotalViewsSetting value={showTotalViews} onChange={onShowTotalViewsChange} disabled={channelStatsDisabled} />
        <ShowVideoViewsSetting value={showVideoViews} onChange={onShowVideoViewsChange} disabled={videoStatsDisabled} />
        <ShowVideoLikesSetting value={showVideoLikes} onChange={onShowVideoLikesChange} disabled={videoStatsDisabled} />
        <ShowUploadDateSetting value={showUploadDate} onChange={onShowUploadDateChange} disabled={videoStatsDisabled} />
        <ShowBackgroundSetting value={showBackground} onChange={onShowBackgroundChange} disabled={backgroundDisabled} />
        <ShowBannerSetting value={showBanner} onChange={onShowBannerChange} disabled={bannerDisabled} />
        <ShowViewButtonSetting value={showViewButton} onChange={onShowViewButtonChange} />
      </div>
    </div>
  );
}
