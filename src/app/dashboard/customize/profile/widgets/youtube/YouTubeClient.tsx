"use client";

import { useState, useTransition, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useYouTubeChannel } from "@/lib/hooks/useYouTubeChannel";
import { cleanYouTubeInput, formatYouTubeNumber, formatUploadDate } from "@/lib/youtube";
import YouTubeCustomization from "@/components/dashboard/customize/widgets/youtube/YouTubeCustomization";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";
import {
  YouTubeLogoIcon,
  YouTubeSubscribersIcon,
  YouTubeViewsIcon,
  YouTubeVideoIcon,
  YouTubeLikesIcon,
  YouTubeCalendarIcon,
  WidgetRedirectIcon,
} from "@/components/profile/widgets/WidgetIcons";
import { toast } from "sonner";
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";

export default function YouTubeClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetIdParam = searchParams.get("widgetId");
  const idParam = searchParams.get("id") || "";

  const existingWidgets = useMemo(
    () => ((user?.widgets as WidgetItem[]) || []),
    [user?.widgets]
  );

  const existingWidget = useMemo(
    () =>
      widgetIdParam
        ? existingWidgets.find((w) => w.id === widgetIdParam)
        : existingWidgets.find((w) => w.platform === "youtube"),
    [existingWidgets, widgetIdParam]
  );

  const isEditing = Boolean(widgetIdParam && existingWidget);

  const initialTargetId = existingWidget?.targetId || idParam || "";
  const initialImageShape = existingWidget?.imageShape || "rounded";
  const initialMode = (existingWidget?.youtubeMode || "channel") as "channel" | "latest-video";
  const initialImageSource = (existingWidget?.youtubeImageSource || "channel-avatar") as "channel-avatar" | "video-thumbnail";
  const initialShowSubscribers = existingWidget?.youtubeShowSubscribers !== undefined ? existingWidget.youtubeShowSubscribers : true;
  const initialShowVideoCount = existingWidget?.youtubeShowVideoCount !== undefined ? existingWidget.youtubeShowVideoCount : true;
  const initialShowTotalViews = existingWidget?.youtubeShowTotalViews !== undefined ? existingWidget.youtubeShowTotalViews : true;
  const initialShowVideoViews = existingWidget?.youtubeShowVideoViews !== undefined ? existingWidget.youtubeShowVideoViews : true;
  const initialShowVideoLikes = existingWidget?.youtubeShowVideoLikes !== undefined ? existingWidget.youtubeShowVideoLikes : true;
  const initialShowUploadDate = existingWidget?.youtubeShowUploadDate !== undefined ? existingWidget.youtubeShowUploadDate : true;
  const initialShowBackground = existingWidget?.youtubeShowBackground !== undefined ? existingWidget.youtubeShowBackground : false;
  const initialShowBanner = existingWidget?.youtubeShowBanner !== undefined ? existingWidget.youtubeShowBanner : false;
  const initialShowViewButton = existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;
  const initialPlacement = (existingWidget?.placement || "inside") as "inside" | "outside";

  const [channelInput, setChannelInput] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [mode, setMode] = useState<"channel" | "latest-video">(initialMode);
  const [imageSource, setImageSource] = useState<"channel-avatar" | "video-thumbnail">(initialImageSource);
  const [showSubscribers, setShowSubscribers] = useState<boolean>(initialShowSubscribers);
  const [showVideoCount, setShowVideoCount] = useState<boolean>(initialShowVideoCount);
  const [showTotalViews, setShowTotalViews] = useState<boolean>(initialShowTotalViews);
  const [showVideoViews, setShowVideoViews] = useState<boolean>(initialShowVideoViews);
  const [showVideoLikes, setShowVideoLikes] = useState<boolean>(initialShowVideoLikes);
  const [showUploadDate, setShowUploadDate] = useState<boolean>(initialShowUploadDate);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);
  const [showBanner, setShowBanner] = useState<boolean>(initialShowBanner);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const handleShowBackgroundChange = (val: boolean) => {
    setShowBackground(val);
    if (val) setShowBanner(false);
  };

  const handleShowBannerChange = (val: boolean) => {
    setShowBanner(val);
    if (val) setShowBackground(false);
  };

  const cleanInput = cleanYouTubeInput(channelInput);
  const { data, loading: loadingPreview } = useYouTubeChannel(cleanInput);

  const isChanged = useMemo(() => {
    if (!isEditing) {
      return Boolean(cleanInput);
    }
    return (
      cleanInput !== initialTargetId ||
      imageShape !== initialImageShape ||
      mode !== initialMode ||
      imageSource !== initialImageSource ||
      showSubscribers !== initialShowSubscribers ||
      showVideoCount !== initialShowVideoCount ||
      showTotalViews !== initialShowTotalViews ||
      showVideoViews !== initialShowVideoViews ||
      showVideoLikes !== initialShowVideoLikes ||
      showUploadDate !== initialShowUploadDate ||
      showBackground !== initialShowBackground ||
      showBanner !== initialShowBanner ||
      showViewButton !== initialShowViewButton ||
      placement !== initialPlacement
    );
  }, [
    isEditing,
    cleanInput,
    imageShape,
    mode,
    imageSource,
    showSubscribers,
    showVideoCount,
    showTotalViews,
    showVideoViews,
    showVideoLikes,
    showUploadDate,
    showBackground,
    showBanner,
    showViewButton,
    placement,
    initialTargetId,
    initialImageShape,
    initialMode,
    initialImageSource,
    initialShowSubscribers,
    initialShowVideoCount,
    initialShowTotalViews,
    initialShowVideoViews,
    initialShowVideoLikes,
    initialShowUploadDate,
    initialShowBackground,
    initialShowBanner,
    initialShowViewButton,
    initialPlacement,
  ]);

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!cleanInput) {
      toast.error("Please enter a valid YouTube channel");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      targetId: cleanInput,
      placement,
      imageShape,
      youtubeMode: mode,
      youtubeImageSource: imageSource,
      youtubeShowSubscribers: showSubscribers,
      youtubeShowVideoCount: showVideoCount,
      youtubeShowTotalViews: showTotalViews,
      youtubeShowVideoViews: showVideoViews,
      youtubeShowVideoLikes: showVideoLikes,
      youtubeShowUploadDate: showUploadDate,
      youtubeShowBackground: showBackground,
      youtubeShowBanner: showBanner,
      showViewButton,
    };

    if (isEditing && existingWidget) {
      updated = existingList.map((w) =>
        w.id === existingWidget.id ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "youtube",
        type: "youtube-profile",
        targetId: cleanInput,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        youtubeMode: mode,
        youtubeImageSource: imageSource,
        youtubeShowSubscribers: showSubscribers,
        youtubeShowVideoCount: showVideoCount,
        youtubeShowTotalViews: showTotalViews,
        youtubeShowVideoViews: showVideoViews,
        youtubeShowVideoLikes: showVideoLikes,
        youtubeShowUploadDate: showUploadDate,
        youtubeShowBackground: showBackground,
        youtubeShowBanner: showBanner,
        showViewButton,
      };
      updated = [newWidget, ...existingList];
    }

    startTransition(async () => {
      try {
        const res = await updateProfileWidgets({
          widgets: updated,
        });
        if (res?.success) {
          toast.success(isEditing ? "Widget updated" : "Widget added");
          router.push("/dashboard/customize/profile/widgets");
        } else {
          toast.error("Failed to save widget");
        }
      } catch {
        toast.error("Failed to save widget");
      }
    });
  };

  const handleRevert = () => {
    if (isEditing) {
      setChannelInput(initialTargetId);
      setImageShape(initialImageShape);
      setMode(initialMode);
      setImageSource(initialImageSource);
      setShowSubscribers(initialShowSubscribers);
      setShowVideoCount(initialShowVideoCount);
      setShowTotalViews(initialShowTotalViews);
      setShowVideoViews(initialShowVideoViews);
      setShowVideoLikes(initialShowVideoLikes);
      setShowUploadDate(initialShowUploadDate);
      setShowBackground(initialShowBackground);
      setShowBanner(initialShowBanner);
      setShowViewButton(initialShowViewButton);
      setPlacement(initialPlacement);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const isVideoMode = mode === "latest-video";
  const rawImageUrl =
    imageSource === "video-thumbnail"
      ? data?.video?.thumbnailUrl || data?.avatarUrl || ""
      : data?.avatarUrl || "";
  const imageProxyUrl = rawImageUrl
    ? `/api/widgets/youtube/image?url=${encodeURIComponent(rawImageUrl)}`
    : "";
  const bannerProxyUrl = data?.bannerUrl
    ? `/api/widgets/youtube/image?url=${encodeURIComponent(data.bannerUrl)}`
    : "";
  const previewBannerSrc = showBanner && bannerProxyUrl ? bannerProxyUrl : null;
  const previewTitle = isVideoMode ? data?.video?.title || data?.title : data?.title;
  const previewSubtitle = isVideoMode ? data?.title : data?.handle;

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which YouTube channel this widget should fetch.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">YouTube Channel</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF0000]">
                  <YouTubeLogoIcon size={16} />
                </div>
                <input
                  type="text"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  placeholder="e.g. @MrBeast or youtube.com/@MrBeast"
                  maxLength={80}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                A channel handle (@name), channel ID (UC…), or profile link.
              </p>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!cleanInput ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[#FF0000] mb-2">
                    <YouTubeLogoIcon size={16} />
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a YouTube channel to see live preview
                  </span>
                </div>
              ) : loadingPreview && !data ? (
                <WidgetSkeleton imageShape={imageShape} />
              ) : !data ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Channel not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find YouTube channel &quot;{cleanInput}&quot;.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden flex items-center justify-between relative box-border">
                  {showViewButton && (
                    <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
                      <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
                    </div>
                  )}

                  {previewBannerSrc && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewBannerSrc}
                        alt=""
                        className="w-full h-full object-cover opacity-50 filter blur-[2px] scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/85 via-[#101010]/65 to-[#101010]/40" />
                    </div>
                  )}

                  {!previewBannerSrc && showBackground && imageProxyUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageProxyUrl}
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
                      {imageProxyUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageProxyUrl}
                          alt=""
                          className="w-full h-full object-cover block"
                        />
                      ) : (
                        <YouTubeLogoIcon size={32} className="text-[#FF0000]/80" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                      <OverflowPingPong deps={[data, previewTitle, previewSubtitle, isVideoMode]}>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                            {previewTitle}
                          </span>
                          {previewSubtitle && (
                            <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-0.5">
                              {previewSubtitle}
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
                          {isVideoMode && !data.video && (
                            <span className="text-white/35">No videos published yet</span>
                          )}
                        </div>
                      </OverflowPingPong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <YouTubeCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          mode={mode}
          onModeChange={setMode}
          imageSource={imageSource}
          onImageSourceChange={setImageSource}
          showSubscribers={showSubscribers}
          onShowSubscribersChange={setShowSubscribers}
          showVideoCount={showVideoCount}
          onShowVideoCountChange={setShowVideoCount}
          showTotalViews={showTotalViews}
          onShowTotalViewsChange={setShowTotalViews}
          showVideoViews={showVideoViews}
          onShowVideoViewsChange={setShowVideoViews}
          showVideoLikes={showVideoLikes}
          onShowVideoLikesChange={setShowVideoLikes}
          showUploadDate={showUploadDate}
          onShowUploadDateChange={setShowUploadDate}
          showBackground={showBackground}
          onShowBackgroundChange={handleShowBackgroundChange}
          showBanner={showBanner}
          onShowBannerChange={handleShowBannerChange}
          showViewButton={showViewButton}
          onShowViewButtonChange={setShowViewButton}
        />
      </div>

      <SaveBar
        show={isChanged || !isEditing}
        onSave={handleSaveWidgetConfirm}
        onRevert={handleRevert}
        saveLabel={isEditing ? "Save" : "Add widget"}
        revertLabel={isEditing ? "Revert" : "Cancel"}
      />
    </>
  );
}
