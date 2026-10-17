"use client";

import { useState, useTransition, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useTikTokUser } from "@/lib/hooks/useTikTokUser";
import { cleanTikTokUsername, formatTikTokNumber } from "@/lib/tiktok";
import TikTokCustomization from "@/components/dashboard/customize/widgets/tiktok/TikTokCustomization";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";
import {
  TikTokLogoIcon,
  TikTokFollowersIcon,
  TikTokFollowingIcon,
  TikTokHeartIcon,
  TikTokVideoIcon,
  TikTokVerifiedIcon,
  WidgetRedirectIcon,
} from "@/components/profile/widgets/WidgetIcons";
import { toast } from "sonner";
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";

export default function TikTokClient({ user }: { user: FullUser | null }) {
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
        : existingWidgets.find((w) => w.platform === "tiktok"),
    [existingWidgets, widgetIdParam]
  );

  const isEditing = Boolean(widgetIdParam && existingWidget);

  const initialTargetId = existingWidget?.targetId || idParam || "";
  const initialImageShape = existingWidget?.imageShape || "rounded";
  const initialShowFollowers = existingWidget?.tiktokShowFollowers !== undefined ? existingWidget.tiktokShowFollowers : true;
  const initialShowFollowing = existingWidget?.tiktokShowFollowing !== undefined ? existingWidget.tiktokShowFollowing : true;
  const initialShowLikes = existingWidget?.tiktokShowLikes !== undefined ? existingWidget.tiktokShowLikes : true;
  const initialShowVideos = existingWidget?.tiktokShowVideos !== undefined ? existingWidget.tiktokShowVideos : true;
  const initialShowVerifiedBadge = existingWidget?.tiktokShowVerifiedBadge !== undefined ? existingWidget.tiktokShowVerifiedBadge : true;
  const initialShowBackground = existingWidget?.tiktokShowBackground !== undefined ? existingWidget.tiktokShowBackground : false;
  const initialShowViewButton = existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;
  const initialPlacement = (existingWidget?.placement || "inside") as "inside" | "outside";

  const [username, setUsername] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showFollowers, setShowFollowers] = useState<boolean>(initialShowFollowers);
  const [showFollowing, setShowFollowing] = useState<boolean>(initialShowFollowing);
  const [showLikes, setShowLikes] = useState<boolean>(initialShowLikes);
  const [showVideos, setShowVideos] = useState<boolean>(initialShowVideos);
  const [showVerifiedBadge, setShowVerifiedBadge] = useState<boolean>(initialShowVerifiedBadge);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const cleanUsername = cleanTikTokUsername(username);
  const { data: tiktokData, loading: loadingPreview } = useTikTokUser(cleanUsername);

  const isChanged = useMemo(() => {
    if (!isEditing) {
      return Boolean(cleanUsername);
    }
    return (
      cleanUsername !== initialTargetId ||
      imageShape !== initialImageShape ||
      showFollowers !== initialShowFollowers ||
      showFollowing !== initialShowFollowing ||
      showLikes !== initialShowLikes ||
      showVideos !== initialShowVideos ||
      showVerifiedBadge !== initialShowVerifiedBadge ||
      showBackground !== initialShowBackground ||
      showViewButton !== initialShowViewButton ||
      placement !== initialPlacement
    );
  }, [
    isEditing,
    cleanUsername,
    imageShape,
    showFollowers,
    showFollowing,
    showLikes,
    showVideos,
    showVerifiedBadge,
    showBackground,
    showViewButton,
    placement,
    initialTargetId,
    initialImageShape,
    initialShowFollowers,
    initialShowFollowing,
    initialShowLikes,
    initialShowVideos,
    initialShowVerifiedBadge,
    initialShowBackground,
    initialShowViewButton,
    initialPlacement,
  ]);

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!cleanUsername) {
      toast.error("Please enter a valid TikTok username");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      targetId: cleanUsername,
      placement,
      imageShape,
      tiktokShowFollowers: showFollowers,
      tiktokShowFollowing: showFollowing,
      tiktokShowLikes: showLikes,
      tiktokShowVideos: showVideos,
      tiktokShowVerifiedBadge: showVerifiedBadge,
      tiktokShowBackground: showBackground,
      showViewButton,
    };

    if (isEditing && existingWidget) {
      updated = existingList.map((w) =>
        w.id === existingWidget.id ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "tiktok",
        type: "tiktok-profile",
        targetId: cleanUsername,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        tiktokShowFollowers: showFollowers,
        tiktokShowFollowing: showFollowing,
        tiktokShowLikes: showLikes,
        tiktokShowVideos: showVideos,
        tiktokShowVerifiedBadge: showVerifiedBadge,
        tiktokShowBackground: showBackground,
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
      setUsername(initialTargetId);
      setImageShape(initialImageShape);
      setShowFollowers(initialShowFollowers);
      setShowFollowing(initialShowFollowing);
      setShowLikes(initialShowLikes);
      setShowVideos(initialShowVideos);
      setShowVerifiedBadge(initialShowVerifiedBadge);
      setShowBackground(initialShowBackground);
      setShowViewButton(initialShowViewButton);
      setPlacement(initialPlacement);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const avatarProxyUrl = tiktokData?.avatarUrl
    ? `/api/widgets/tiktok/image?url=${encodeURIComponent(tiktokData.avatarUrl)}`
    : "";

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which TikTok account this widget should fetch.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">TikTok Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white">
                  <TikTokLogoIcon size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. charlidamelio or tiktok.com/@charlidamelio"
                  maxLength={50}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Your TikTok username or profile link.
              </p>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-4 sm:p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!cleanUsername ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <TikTokLogoIcon size={16} />
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a TikTok username to see live preview
                  </span>
                </div>
              ) : loadingPreview && !tiktokData ? (
                <WidgetSkeleton imageShape={imageShape} />
              ) : !tiktokData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Account not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find TikTok account &quot;{cleanUsername}&quot;.
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

                  {showBackground && avatarProxyUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarProxyUrl}
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
                      {avatarProxyUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarProxyUrl}
                          alt=""
                          className="w-full h-full object-cover block"
                        />
                      ) : (
                        <TikTokLogoIcon size={32} className="text-white/30" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                      <OverflowPingPong deps={[tiktokData, tiktokData?.nickname, tiktokData?.username, showVerifiedBadge]}>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                            {tiktokData?.nickname || cleanUsername || "TikTok User"}
                          </span>
                          {showVerifiedBadge && (tiktokData?.isVerified || !tiktokData) && (
                            <TikTokVerifiedIcon size={15} className="shrink-0" />
                          )}
                          {(tiktokData?.nickname || cleanUsername) && (
                            <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-0.5">
                              @{tiktokData?.username || cleanUsername}
                            </span>
                          )}
                        </div>
                      </OverflowPingPong>

                      <OverflowPingPong
                        deps={[
                          tiktokData,
                          showFollowers,
                          showFollowing,
                          showLikes,
                          showVideos,
                        ]}
                      >
                        <div className="flex items-center gap-3 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                          {showFollowers && (
                            <div className="flex items-center gap-1 shrink-0">
                              <TikTokFollowersIcon size={13} className="text-white/70" />
                              <span className="text-white/85">
                                {formatTikTokNumber(tiktokData?.followerCount ?? 1250000)}
                              </span>
                              <span className="text-white/40">followers</span>
                            </div>
                          )}
                          {showFollowing && (
                            <div className="flex items-center gap-1 shrink-0">
                              <TikTokFollowingIcon size={13} className="text-white/70" />
                              <span className="text-white/85">
                                {formatTikTokNumber(tiktokData?.followingCount ?? 340)}
                              </span>
                              <span className="text-white/40">following</span>
                            </div>
                          )}
                          {showLikes && (
                            <div className="flex items-center gap-1 shrink-0">
                              <TikTokHeartIcon size={13} className="text-[#FE2C55]" />
                              <span className="text-white/85">
                                {formatTikTokNumber(tiktokData?.heartCount ?? 40400000)}
                              </span>
                              <span className="text-white/40">likes</span>
                            </div>
                          )}
                          {showVideos && (
                            <div className="flex items-center gap-1 shrink-0">
                              <TikTokVideoIcon size={13} className="text-white/70" />
                              <span className="text-white/85">
                                {formatTikTokNumber(tiktokData?.videoCount ?? 142)}
                              </span>
                              <span className="text-white/40">videos</span>
                            </div>
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

        <TikTokCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showFollowers={showFollowers}
          onShowFollowersChange={setShowFollowers}
          showFollowing={showFollowing}
          onShowFollowingChange={setShowFollowing}
          showLikes={showLikes}
          onShowLikesChange={setShowLikes}
          showVideos={showVideos}
          onShowVideosChange={setShowVideos}
          showVerifiedBadge={showVerifiedBadge}
          onShowVerifiedBadgeChange={setShowVerifiedBadge}
          showBackground={showBackground}
          onShowBackgroundChange={setShowBackground}
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
