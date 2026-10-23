"use client";

import { useState, useTransition, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useSoundcloudArtist } from "@/lib/hooks/useSoundcloudArtist";
import { cleanSoundcloudHandle, formatSoundcloudNumber } from "@/lib/soundcloud";
import SoundcloudCustomization from "@/components/dashboard/customize/widgets/soundcloud/SoundcloudCustomization";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";
import {
  SoundcloudFollowersIcon,
  SoundcloudLogoIcon,
  SoundcloudTrackIcon,
  SoundcloudVerifiedIcon,
  WidgetRedirectIcon,
} from "@/components/profile/widgets/WidgetIcons";
import { toast } from "sonner";
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";

export default function SoundcloudClient({ user }: { user: FullUser | null }) {
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
        : existingWidgets.find((w) => w.platform === "soundcloud"),
    [existingWidgets, widgetIdParam]
  );

  const isEditing = Boolean(widgetIdParam && existingWidget);

  const initialTargetId = existingWidget?.targetId || idParam || "";
  const initialImageShape = existingWidget?.imageShape || "rounded";
  const initialShowFollowers =
    existingWidget?.soundcloudShowFollowers !== undefined
      ? existingWidget.soundcloudShowFollowers
      : true;
  const initialShowTracks =
    existingWidget?.soundcloudShowTracks !== undefined
      ? existingWidget.soundcloudShowTracks
      : true;
  const initialShowVerifiedBadge =
    existingWidget?.soundcloudShowVerifiedBadge !== undefined
      ? existingWidget.soundcloudShowVerifiedBadge
      : true;
  const initialShowBackground =
    existingWidget?.soundcloudShowBackground !== undefined
      ? existingWidget.soundcloudShowBackground
      : false;
  const initialShowViewButton =
    existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;
  const initialPlacement = (existingWidget?.placement || "inside") as "inside" | "outside";

  const [handle, setHandle] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showFollowers, setShowFollowers] = useState<boolean>(initialShowFollowers);
  const [showTracks, setShowTracks] = useState<boolean>(initialShowTracks);
  const [showVerifiedBadge, setShowVerifiedBadge] = useState<boolean>(initialShowVerifiedBadge);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const cleanHandle = cleanSoundcloudHandle(handle);
  const { data: artistData, loading: loadingPreview } = useSoundcloudArtist(cleanHandle);

  const isChanged = useMemo(() => {
    if (!isEditing) {
      return Boolean(cleanHandle);
    }
    return (
      cleanHandle !== initialTargetId ||
      imageShape !== initialImageShape ||
      showFollowers !== initialShowFollowers ||
      showTracks !== initialShowTracks ||
      showVerifiedBadge !== initialShowVerifiedBadge ||
      showBackground !== initialShowBackground ||
      showViewButton !== initialShowViewButton ||
      placement !== initialPlacement
    );
  }, [
    isEditing,
    cleanHandle,
    imageShape,
    showFollowers,
    showTracks,
    showVerifiedBadge,
    showBackground,
    showViewButton,
    placement,
    initialTargetId,
    initialImageShape,
    initialShowFollowers,
    initialShowTracks,
    initialShowVerifiedBadge,
    initialShowBackground,
    initialShowViewButton,
    initialPlacement,
  ]);

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!cleanHandle) {
      toast.error("Please enter a valid SoundCloud artist handle");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      targetId: cleanHandle,
      placement,
      imageShape,
      soundcloudShowFollowers: showFollowers,
      soundcloudShowTracks: showTracks,
      soundcloudShowVerifiedBadge: showVerifiedBadge,
      soundcloudShowBackground: showBackground,
      showViewButton,
    };

    if (isEditing && existingWidget) {
      updated = existingList.map((w) =>
        w.id === existingWidget.id ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "soundcloud",
        type: "soundcloud-profile",
        targetId: cleanHandle,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        soundcloudShowFollowers: showFollowers,
        soundcloudShowTracks: showTracks,
        soundcloudShowVerifiedBadge: showVerifiedBadge,
        soundcloudShowBackground: showBackground,
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
      setHandle(initialTargetId);
      setImageShape(initialImageShape);
      setShowFollowers(initialShowFollowers);
      setShowTracks(initialShowTracks);
      setShowVerifiedBadge(initialShowVerifiedBadge);
      setShowBackground(initialShowBackground);
      setShowViewButton(initialShowViewButton);
      setPlacement(initialPlacement);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const avatarProxyUrl = artistData?.avatarUrl
    ? `/api/widgets/soundcloud/image?url=${encodeURIComponent(artistData.avatarUrl)}`
    : "";
  const backgroundSource = artistData?.bannerUrl || artistData?.avatarUrl || "";
  const backgroundProxyUrl = backgroundSource
    ? `/api/widgets/soundcloud/image?url=${encodeURIComponent(backgroundSource)}`
    : "";

  const displayName = artistData?.username || cleanHandle || "SoundCloud Artist";

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Artist</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which SoundCloud artist this widget should fetch.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">SoundCloud Handle</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FF5500]">
                  <SoundcloudLogoIcon size={16} />
                </div>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. kehlanimusic or soundcloud.com/kehlanimusic"
                  maxLength={80}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Your SoundCloud permalink or profile link.
              </p>
              <p className="text-[11.5px] leading-normal text-amber-400/80">
                Only public artists are supported. Follower and track counts come from SoundCloud and
                update automatically.
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
              {!cleanHandle ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <SoundcloudLogoIcon size={16} />
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a SoundCloud handle to see live preview
                  </span>
                </div>
              ) : loadingPreview && !artistData ? (
                <WidgetSkeleton imageShape={imageShape} />
              ) : !artistData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Artist not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not load &quot;{cleanHandle}&quot;. The handle may be wrong.
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

                  {showBackground && backgroundProxyUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={backgroundProxyUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-35 filter blur-[12px] scale-125"
                      />
                      <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
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
                      {avatarProxyUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarProxyUrl}
                          alt=""
                          className="w-full h-full object-cover block"
                        />
                      ) : (
                        <SoundcloudLogoIcon size={32} className="text-white/30" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                      <OverflowPingPong
                        deps={[artistData, displayName, cleanHandle, showVerifiedBadge]}
                      >
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                            {displayName}
                          </span>
                          {showVerifiedBadge && artistData?.isVerified && (
                            <SoundcloudVerifiedIcon size={15} className="shrink-0" />
                          )}
                          <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-0.5">
                            @{artistData?.handle || cleanHandle}
                          </span>
                        </div>
                      </OverflowPingPong>

                      <OverflowPingPong deps={[artistData, showFollowers, showTracks]}>
                        <div className="flex items-center gap-3 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                          {showFollowers && (
                            <div className="flex items-center gap-1 shrink-0">
                              <SoundcloudFollowersIcon size={13} className="text-white/70" />
                              <span className="text-white/85">
                                {formatSoundcloudNumber(artistData?.followerCount ?? 0)}
                              </span>
                              <span className="text-white/40">followers</span>
                            </div>
                          )}
                          {showTracks && (
                            <div className="flex items-center gap-1 shrink-0">
                              <SoundcloudTrackIcon size={13} className="text-white/70" />
                              <span className="text-white/85">
                                {formatSoundcloudNumber(artistData?.trackCount ?? 0)}
                              </span>
                              <span className="text-white/40">tracks</span>
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

        <SoundcloudCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showFollowers={showFollowers}
          onShowFollowersChange={setShowFollowers}
          showTracks={showTracks}
          onShowTracksChange={setShowTracks}
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
        dirty={isChanged}
        onSave={handleSaveWidgetConfirm}
        onRevert={handleRevert}
        saveLabel={isEditing ? "Save" : "Add widget"}
        revertLabel={isEditing ? "Revert" : "Cancel"}
      />
    </>
  );
}
