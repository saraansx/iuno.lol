"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useGenshinPlayer } from "@/lib/hooks/useGenshinPlayer";
import SaveBar from "@/components/dashboard/SaveBar";
import GenshinCustomization from "@/components/dashboard/customize/widgets/genshin/GenshinCustomization";
import { toast } from "sonner";
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";

export default function GenshinClient({ user }: { user: FullUser | null }) {
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
  const initialShowAr = existingWidget?.genshinShowAr !== undefined ? existingWidget.genshinShowAr : true;
  const initialShowWorldLevel = existingWidget?.genshinShowWorldLevel !== undefined ? existingWidget.genshinShowWorldLevel : true;
  const initialShowAchievements = existingWidget?.genshinShowAchievements !== undefined ? existingWidget.genshinShowAchievements : true;
  const initialShowRegion = existingWidget?.genshinShowRegion !== undefined ? existingWidget.genshinShowRegion : true;
  const initialShowBackground = existingWidget?.genshinShowBackground !== undefined ? existingWidget.genshinShowBackground : true;
  const initialShowBackgroundImage = existingWidget?.genshinShowBackgroundImage !== undefined ? existingWidget.genshinShowBackgroundImage : false;
  const initialShowViewButton = existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;

  const [uidInput, setUidInput] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showAr, setShowAr] = useState<boolean>(initialShowAr);
  const [showWorldLevel, setShowWorldLevel] = useState<boolean>(initialShowWorldLevel);
  const [showAchievements, setShowAchievements] = useState<boolean>(initialShowAchievements);
  const [showRegion, setShowRegion] = useState<boolean>(initialShowRegion);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);
  const [showBackgroundImage, setShowBackgroundImage] = useState<boolean>(initialShowBackgroundImage);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const [, startTransition] = useTransition();

  const cleanUid = uidInput.trim();
  const { data: genshinData, loading: loadingPreview, isValidUid } = useGenshinPlayer(cleanUid);

  const isChanged =
    !isEditing ||
    cleanUid !== initialTargetId ||
    placement !== initialPlacement ||
    imageShape !== initialImageShape ||
    showAr !== initialShowAr ||
    showWorldLevel !== initialShowWorldLevel ||
    showAchievements !== initialShowAchievements ||
    showRegion !== initialShowRegion ||
    showBackground !== initialShowBackground ||
    showBackgroundImage !== initialShowBackgroundImage ||
    showViewButton !== initialShowViewButton;

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidUid) {
      toast.error("Please enter a valid 9-10 digit Genshin Impact UID");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      targetId: cleanUid,
      placement,
      imageShape,
      genshinShowAr: showAr,
      genshinShowWorldLevel: showWorldLevel,
      genshinShowAchievements: showAchievements,
      genshinShowRegion: showRegion,
      genshinShowBackground: showBackground,
      genshinShowBackgroundImage: showBackgroundImage,
      showViewButton,
    };

    if (isEditing && widgetIdParam) {
      updated = existingList.map((w) =>
        w.id === widgetIdParam ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "genshin",
        type: "genshin-profile",
        targetId: cleanUid,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        genshinShowAr: showAr,
        genshinShowWorldLevel: showWorldLevel,
        genshinShowAchievements: showAchievements,
        genshinShowRegion: showRegion,
        genshinShowBackground: showBackground,
        genshinShowBackgroundImage: showBackgroundImage,
        showViewButton,
      };
      updated = [newWidget, ...existingList];
    }

    startTransition(async () => {
      try {
        const res = await updateProfileWidgets({
          username: user.username,
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
      setUidInput(initialTargetId);
      setPlacement(initialPlacement);
      setImageShape(initialImageShape);
      setShowAr(initialShowAr);
      setShowWorldLevel(initialShowWorldLevel);
      setShowAchievements(initialShowAchievements);
      setShowRegion(initialShowRegion);
      setShowBackground(initialShowBackground);
      setShowBackgroundImage(initialShowBackgroundImage);
      setShowViewButton(initialShowViewButton);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const avatarSrc = genshinData?.avatar_url
    ? `/api/widgets/genshin/image?url=${encodeURIComponent(genshinData.avatar_url)}`
    : null;

  const namecardBgSrc =
    showBackground && (genshinData?.namecard_bg_url || genshinData?.namecard_url)
      ? `/api/widgets/genshin/image?url=${encodeURIComponent((genshinData.namecard_bg_url || genshinData.namecard_url)!)}`
      : null;

  const avatarBgSrc = showBackgroundImage ? avatarSrc : null;

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which account this widget should fetch.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Genshin Impact UID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={uidInput}
                  onChange={(e) => setUidInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="e.g. 800000024"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Your 9 or 10 digit in-game UID displayed at the bottom right corner in Genshin Impact. Fetches publicly via Enka.Network.
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
              {!isValidUid ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a 9-10 digit UID to see live preview
                  </span>
                </div>
              ) : loadingPreview && !genshinData ? (
                <WidgetSkeleton imageShape={imageShape} />
              ) : !genshinData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Player not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find public player data on Enka.Network for UID {cleanUid}.
                    </span>
                  </div>
                </div>
              ) : (
                <a
                  href={`https://enka.network/u/${encodeURIComponent(cleanUid)}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
                >
                  {showViewButton && (
                    <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </div>
                  )}

                  {namecardBgSrc && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={namecardBgSrc}
                        alt=""
                        className="w-full h-full object-cover opacity-85 scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 backdrop-blur-[0.5px]" />
                    </div>
                  )}

                  {avatarBgSrc && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarBgSrc}
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
                      {avatarSrc && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={avatarSrc}
                          alt={genshinData.nickname}
                          className="w-full h-full object-cover block"
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-[#609fda] shrink-0"
                          >
                            <path
                              d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="text-[14.5px] font-normal text-white/95 tracking-tight truncate">
                            {genshinData.nickname}
                          </span>
                        </div>
                        {showRegion && genshinData.region && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 shrink-0 font-medium">
                            {genshinData.region}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 truncate">
                        {showAr && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-white/40">AR</span>
                            <span className="text-white/85">{genshinData.level}</span>
                          </div>
                        )}

                        {showWorldLevel && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-white/40">WL</span>
                            <span className="text-white/85">{genshinData.world_level}</span>
                          </div>
                        )}

                        {showAchievements && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                              <path fillRule="evenodd" clipRule="evenodd" d="M5.166 2.25c-.414 0-.75.336-.75.75v1.5a3 3 0 00-3 3v1.5a4.5 4.5 0 004.14 4.484A6.745 6.745 0 009 16.592V18H7.5a.75.75 0 000 1.5h9a.75.75 0 000-1.5H15v-1.408a6.745 6.745 0 003.444-3.108A4.5 4.5 0 0022.584 9V7.5a3 3 0 00-3-3V3a.75.75 0 00-.75-.75h-13.668zM3.666 7.5a1.5 1.5 0 011.5-1.5v4.354a3.003 3.003 0 01-1.5-2.854V7.5zm16.668 0v-.5a1.5 1.5 0 00-1.5-1.5v4.354c.915-.224 1.5-1.026 1.5-1.854z" />
                            </svg>
                            <span className="text-white/85">{genshinData.achievements.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <GenshinCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showAr={showAr}
          onShowArChange={setShowAr}
          showWorldLevel={showWorldLevel}
          onShowWorldLevelChange={setShowWorldLevel}
          showAchievements={showAchievements}
          onShowAchievementsChange={setShowAchievements}
          showRegion={showRegion}
          onShowRegionChange={setShowRegion}
          showBackground={showBackground}
          onShowBackgroundChange={setShowBackground}
          showBackgroundImage={showBackgroundImage}
          onShowBackgroundImageChange={setShowBackgroundImage}
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
