"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useTwitchChannel } from "@/lib/hooks/useTwitchChannel";
import { formatNumber } from "@/lib/twitch";
import SaveBar from "@/components/dashboard/SaveBar";
import TwitchCustomization from "@/components/dashboard/customize/widgets/twitch/TwitchCustomization";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";
import { toast } from "sonner";
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";

export default function TwitchClient({ user }: { user: FullUser | null }) {
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
        : undefined,
    [existingWidgets, widgetIdParam]
  );

  const isEditing = Boolean(widgetIdParam && existingWidget);

  const initialTargetId = existingWidget?.targetId || idParam || "";
  const initialPlacement = (existingWidget?.placement || "inside") as "inside" | "outside";
  const initialImageShape = (existingWidget?.imageShape || "rounded") as "circle" | "rounded" | "square";
  const initialShowLiveStatus = existingWidget?.twitchShowLiveStatus !== undefined ? existingWidget.twitchShowLiveStatus : true;
  const initialShowFollowers = existingWidget?.twitchShowFollowers !== undefined ? existingWidget.twitchShowFollowers : true;
  const initialShowPartnerBadge = existingWidget?.twitchShowPartnerBadge !== undefined ? existingWidget.twitchShowPartnerBadge : true;
  const initialShowBackground = existingWidget?.twitchShowBackground !== undefined ? existingWidget.twitchShowBackground : false;
  const initialShowViewButton = existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;

  const [usernameInput, setUsernameInput] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showLiveStatus, setShowLiveStatus] = useState<boolean>(initialShowLiveStatus);
  const [showFollowers, setShowFollowers] = useState<boolean>(initialShowFollowers);
  const [showPartnerBadge, setShowPartnerBadge] = useState<boolean>(initialShowPartnerBadge);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const [, startTransition] = useTransition();

  const cleanLogin = usernameInput
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
    .replace(/\/$/, "");

  const isValidLogin = /^[a-zA-Z0-9_]{3,25}$/.test(cleanLogin);
  const { channel, isLoading: loadingPreview } = useTwitchChannel(cleanLogin, {
    enabled: isValidLogin,
  });

  const isChanged =
    !isEditing ||
    cleanLogin !== initialTargetId ||
    placement !== initialPlacement ||
    imageShape !== initialImageShape ||
    showLiveStatus !== initialShowLiveStatus ||
    showFollowers !== initialShowFollowers ||
    showPartnerBadge !== initialShowPartnerBadge ||
    showBackground !== initialShowBackground ||
    showViewButton !== initialShowViewButton;

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidLogin) {
      toast.error("Please enter a valid Twitch username (3-25 alphanumeric/underscore)");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      targetId: cleanLogin,
      placement,
      imageShape,
      twitchShowLiveStatus: showLiveStatus,
      twitchShowFollowers: showFollowers,
      twitchShowPartnerBadge: showPartnerBadge,
      twitchShowBackground: showBackground,
      showViewButton,
    };

    if (isEditing && widgetIdParam) {
      updated = existingList.map((w) =>
        w.id === widgetIdParam ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "twitch",
        type: "twitch-channel",
        targetId: cleanLogin,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        twitchShowLiveStatus: showLiveStatus,
        twitchShowFollowers: showFollowers,
        twitchShowPartnerBadge: showPartnerBadge,
        twitchShowBackground: showBackground,
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
          toast.success(isEditing ? "Widget saved successfully" : "Widget added successfully");
          router.push("/dashboard/customize/profile/widgets");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save widget");
      }
    });
  };

  const handleRevert = () => {
    if (isEditing) {
      setUsernameInput(initialTargetId);
      setPlacement(initialPlacement);
      setImageShape(initialImageShape);
      setShowLiveStatus(initialShowLiveStatus);
      setShowFollowers(initialShowFollowers);
      setShowPartnerBadge(initialShowPartnerBadge);
      setShowBackground(initialShowBackground);
      setShowViewButton(initialShowViewButton);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const avatarSrc = channel?.profileImageUrl
    ? `/api/widgets/twitch/image?url=${encodeURIComponent(channel.profileImageUrl)}`
    : null;

  const bgSrc = showBackground ? avatarSrc : null;
  const isCurrentlyLive = Boolean(channel?.isLive && showLiveStatus);

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which Twitch channel this widget should fetch.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Twitch Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#9146FF">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. shroud"
                  maxLength={25}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Your Twitch username or channel URL. Channel must exist and be public.
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
              {!isValidLogin ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a Twitch username to see live preview
                  </span>
                </div>
              ) : loadingPreview && !channel ? (
                <WidgetSkeleton imageShape={imageShape} />
              ) : !channel ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Channel not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find Twitch channel &quot;{cleanLogin}&quot;.
                    </span>
                  </div>
                </div>
              ) : (
                <a
                  href={`https://twitch.tv/${encodeURIComponent(channel.login)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
                >
                  {showViewButton && (
                    <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </div>
                  )}

                  {bgSrc && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bgSrc}
                        alt=""
                        className="w-full h-full object-cover opacity-35 filter blur-[12px] scale-125"
                      />
                      <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
                    </div>
                  )}

                  <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
                    <div className="relative shrink-0">
                      <div
                        className={`relative w-[74px] h-[74px] overflow-hidden bg-[#181818] border ${
                          isCurrentlyLive ? "border-[#eb0400]" : "border-white/10"
                        } shadow-sm flex items-center justify-center ${
                          imageShape === "square"
                            ? "rounded-none"
                            : imageShape === "circle"
                            ? "rounded-full"
                            : "rounded-2xl"
                        }`}
                      >
                        {avatarSrc && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={avatarSrc}
                            alt={channel.displayName}
                            className="w-full h-full object-cover block"
                          />
                        )}
                      </div>

                      {isCurrentlyLive && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#eb0400] text-white text-[9px] font-bold uppercase rounded-[4px] tracking-wider shadow-sm z-20">
                          LIVE
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden pr-6">
                      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        <OverflowPingPong
                          deps={[channel, channel.displayName, isCurrentlyLive]}
                        >
                          <div className="flex items-center gap-1.5 shrink-0">
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="#9146FF"
                              className="shrink-0"
                            >
                              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                            </svg>

                            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                              {channel.displayName}
                            </span>

                            {showPartnerBadge && channel.isPartner && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="#9146FF"
                                className="shrink-0"
                              >
                                <path d="M12 2L14.8 4.2L18.4 4.5L19.5 7.8L22.5 9.8L21.7 13.3L23 16.5L20 18.5L19 22L15.5 21.5L13 23.5L10.5 21.5L7 22L6 18.5L3 16.5L4.3 13.3L3.5 9.8L6.5 7.8L7.6 4.5L11.2 4.2L12 2Z" />
                                <path
                                  d="M9.5 12L11 13.5L15 9.5"
                                  stroke="#FFFFFF"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}

                            {isCurrentlyLive && channel.viewersCount !== null && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 shrink-0 ml-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] text-red-400 font-medium">
                                  {formatNumber(channel.viewersCount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </OverflowPingPong>
                      </div>

                      <div className="min-w-0 overflow-hidden">
                        {isCurrentlyLive ? (
                          <OverflowPingPong
                            deps={[
                              channel.streamTitle,
                              channel.gameName,
                              isCurrentlyLive,
                            ]}
                          >
                            <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight whitespace-nowrap shrink-0">
                              {channel.gameName && (
                                <span className="text-white/85 shrink-0">
                                  {channel.gameName}
                                </span>
                              )}
                              {channel.gameName && channel.streamTitle && (
                                <span className="text-white/35">•</span>
                              )}
                              {channel.streamTitle && (
                                <span className="text-[12px] text-white/50 shrink-0">
                                  {channel.streamTitle}
                                </span>
                              )}
                            </div>
                          </OverflowPingPong>
                        ) : (
                          <OverflowPingPong
                            deps={[channel.followersCount, showFollowers]}
                          >
                            <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight whitespace-nowrap shrink-0">
                              {showFollowers && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-white/85">
                                    {formatNumber(channel.followersCount)}
                                  </span>
                                  <span className="text-white/40">
                                    {channel.followersCount === 1
                                      ? "follower"
                                      : "followers"}
                                  </span>
                                </div>
                              )}
                              {!showFollowers && (
                                <span className="text-white/40">Twitch Channel</span>
                              )}
                            </div>
                          </OverflowPingPong>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <TwitchCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showLiveStatus={showLiveStatus}
          onShowLiveStatusChange={setShowLiveStatus}
          showFollowers={showFollowers}
          onShowFollowersChange={setShowFollowers}
          showPartnerBadge={showPartnerBadge}
          onShowPartnerBadgeChange={setShowPartnerBadge}
          showBackground={showBackground}
          onShowBackgroundChange={setShowBackground}
          showViewButton={showViewButton}
          onShowViewButtonChange={setShowViewButton}
        />
      </div>

      <SaveBar
        show={isChanged}
        onSave={handleSaveWidgetConfirm}
        onRevert={handleRevert}
      />
    </>
  );
}
