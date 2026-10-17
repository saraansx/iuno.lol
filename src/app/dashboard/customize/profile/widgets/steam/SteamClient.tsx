"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useSteamUser } from "@/lib/hooks/useSteamUser";
import { steamAssetUrl } from "@/lib/steam-asset-url";
import SaveBar from "@/components/dashboard/SaveBar";
import SteamCustomization from "@/components/dashboard/customize/widgets/steam/SteamCustomization";
import { toast } from "sonner";

export default function SteamClient({ user }: { user: FullUser | null }) {
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
  const initialShowLevel = existingWidget?.steamShowLevel !== undefined ? existingWidget.steamShowLevel : true;
  const initialShowGames = existingWidget?.steamShowGames !== undefined ? existingWidget.steamShowGames : true;
  const initialShowMemberSince = existingWidget?.steamShowMemberSince !== undefined ? existingWidget.steamShowMemberSince : true;
  const initialShowAvatarFrame = existingWidget?.steamShowAvatarFrame !== undefined ? existingWidget.steamShowAvatarFrame : true;
  const initialShowAnimatedAvatar = existingWidget?.steamShowAnimatedAvatar !== undefined ? existingWidget.steamShowAnimatedAvatar : true;
  const initialBackground = (existingWidget?.steamBackground || "large") as "none" | "large" | "small";
  const initialShowBackgroundImage = existingWidget?.steamShowBackgroundImage !== undefined ? existingWidget.steamShowBackgroundImage : false;
  const initialShowViewButton = existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;

  const [steamIdInput, setSteamIdInput] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showLevel, setShowLevel] = useState<boolean>(initialShowLevel);
  const [showGames, setShowGames] = useState<boolean>(initialShowGames);
  const [showMemberSince, setShowMemberSince] = useState<boolean>(initialShowMemberSince);
  const [showAvatarFrame, setShowAvatarFrame] = useState<boolean>(initialShowAvatarFrame);
  const [showAnimatedAvatar, setShowAnimatedAvatar] = useState<boolean>(initialShowAnimatedAvatar);
  const [background, setBackground] = useState<"none" | "large" | "small">(initialBackground);
  const [showBackgroundImage, setShowBackgroundImage] = useState<boolean>(initialShowBackgroundImage);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const [, startTransition] = useTransition();

  const cleanSteamInput = steamIdInput
    .trim()
    .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "")
    .replace(/\/$/, "");

  const { data: steamData, loading: loadingPreview, isValidId } = useSteamUser(cleanSteamInput);

  const isChanged =
    !isEditing ||
    cleanSteamInput !== initialTargetId ||
    placement !== initialPlacement ||
    imageShape !== initialImageShape ||
    showLevel !== initialShowLevel ||
    showGames !== initialShowGames ||
    showMemberSince !== initialShowMemberSince ||
    showAvatarFrame !== initialShowAvatarFrame ||
    showAnimatedAvatar !== initialShowAnimatedAvatar ||
    background !== initialBackground ||
    showBackgroundImage !== initialShowBackgroundImage ||
    showViewButton !== initialShowViewButton;

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidId) {
      toast.error("Please enter a valid Steam ID or custom URL vanity");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      targetId: cleanSteamInput,
      placement,
      imageShape,
      steamShowLevel: showLevel,
      steamShowGames: showGames,
      steamShowMemberSince: showMemberSince,
      steamShowAvatarFrame: showAvatarFrame,
      steamShowAnimatedAvatar: showAnimatedAvatar,
      steamBackground: background,
      steamShowBackgroundImage: showBackgroundImage,
      showViewButton,
    };

    if (isEditing && widgetIdParam) {
      updated = existingList.map((w) =>
        w.id === widgetIdParam ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "steam",
        type: "steam-profile",
        targetId: cleanSteamInput,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        steamShowLevel: showLevel,
        steamShowGames: showGames,
        steamShowMemberSince: showMemberSince,
        steamShowAvatarFrame: showAvatarFrame,
        steamShowAnimatedAvatar: showAnimatedAvatar,
        steamBackground: background,
        steamShowBackgroundImage: showBackgroundImage,
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
      setSteamIdInput(initialTargetId);
      setPlacement(initialPlacement);
      setImageShape(initialImageShape);
      setShowLevel(initialShowLevel);
      setShowGames(initialShowGames);
      setShowMemberSince(initialShowMemberSince);
      setShowAvatarFrame(initialShowAvatarFrame);
      setShowAnimatedAvatar(initialShowAnimatedAvatar);
      setBackground(initialBackground);
      setShowBackgroundImage(initialShowBackgroundImage);
      setShowViewButton(initialShowViewButton);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const rawAvatarSrc = (showAnimatedAvatar && steamData?.animated_avatar) || steamData?.avatarfull;
  const avatarSrc = rawAvatarSrc ? steamAssetUrl(rawAvatarSrc) : null;

  const rawBgSrc =
    background === "large"
      ? steamData?.profile_background || steamData?.avatarfull
      : background === "small"
      ? steamData?.mini_profile_background || steamData?.profile_background || steamData?.avatarfull
      : null;
  const bgImageSrc = rawBgSrc ? steamAssetUrl(rawBgSrc) : null;

  const rawBgWebm =
    background === "large"
      ? steamData?.profile_background_webm
      : background === "small"
      ? steamData?.mini_profile_background_webm || steamData?.profile_background_webm
      : null;
  const bgWebmSrc = rawBgWebm ? steamAssetUrl(rawBgWebm) : null;

  const rawBgMp4 =
    background === "large"
      ? steamData?.profile_background_mp4
      : background === "small"
      ? steamData?.mini_profile_background_mp4 || steamData?.profile_background_mp4
      : null;
  const bgMp4Src = rawBgMp4 ? steamAssetUrl(rawBgMp4) : null;

  const frameSrc = steamData?.avatarframe ? steamAssetUrl(steamData.avatarframe) : null;

  const rawAvatarBg = showBackgroundImage ? steamData?.avatarfull : null;
  const avatarBgSrc = rawAvatarBg ? steamAssetUrl(rawAvatarBg) : null;

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which account this widget should fetch.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Steam ID or vanity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.707L.436 14.87C1.727 20.098 6.41 24 11.979 24c6.627 0 12-5.373 12-12S18.605 0 11.979 0zM7.54 18.216c-.954 0-1.73-.775-1.73-1.73s.776-1.73 1.73-1.73 1.73.776 1.73 1.73-.776 1.73-1.73 1.73zm8.4-9.306c-1.391 0-2.52-1.129-2.52-2.52s1.129-2.52 2.52-2.52 2.52 1.129 2.52 2.52-1.129 2.52-2.52 2.52z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={steamIdInput}
                  onChange={(e) => setSteamIdInput(e.target.value)}
                  placeholder="e.g. thatkewldude or 76561198000000000"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Your SteamID64 (17 digits) or your Steam vanity name from steamcommunity.com/id/yourname. Game count and hours need your Steam &apos;Game details&apos; set to public.
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
              {!isValidId ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a Steam ID or vanity name to see live preview
                  </span>
                </div>
              ) : loadingPreview && !steamData ? (
                <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
                  <div className="flex items-center gap-3.5 min-w-0 w-full">
                    <div
                      className={`w-[74px] h-[74px] shrink-0 bg-white/[0.05] ${
                        imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
                      }`}
                    />
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
                      <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
                    </div>
                  </div>
                </div>
              ) : !steamData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Steam profile not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find a public Steam profile with that name.
                    </span>
                  </div>
                </div>
              ) : (
                <a
                  href={steamData.profileurl || `https://steamcommunity.com/id/${encodeURIComponent(cleanSteamInput)}/`}
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

                  {background !== "none" && (bgWebmSrc || bgMp4Src || bgImageSrc) && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {bgWebmSrc || bgMp4Src ? (
                        <video
                          key={bgWebmSrc || bgMp4Src || "steam-bg-preview-video"}
                          autoPlay
                          loop
                          muted
                          playsInline
                          poster={bgImageSrc || undefined}
                          className="w-full h-full object-cover opacity-85 scale-105"
                          ref={(el) => {
                            if (el && el.paused) {
                              el.play().catch(() => {});
                            }
                          }}
                        >
                          {bgWebmSrc && <source src={bgWebmSrc} type="video/webm" />}
                          {bgMp4Src && <source src={bgMp4Src} type="video/mp4" />}
                        </video>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={bgImageSrc!}
                          alt=""
                          className="w-full h-full object-cover opacity-85 scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25 backdrop-blur-[0.5px]" />
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
                    <div className="relative w-[74px] h-[74px] shrink-0 flex items-center justify-center">
                      <div
                        className={`relative w-full h-full overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
                          imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
                        }`}
                      >
                        {avatarSrc && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={avatarSrc}
                            alt={steamData.personaname}
                            className="w-full h-full object-cover block"
                          />
                        )}
                      </div>

                      {showAvatarFrame && frameSrc && (
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-visible">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={frameSrc}
                            alt=""
                            className="w-[114%] h-[114%] max-w-none max-h-none object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                      <span className="text-[14.5px] font-normal text-white/95 tracking-tight truncate">
                        {steamData.personaname}
                      </span>

                      {steamData.is_private ? (
                        <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight text-white/50">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-white/50">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3H6A3.75 3.75 0 002.25 13.5v6.75A3.75 3.75 0 006 24h12a3.75 3.75 0 003.75-3.75V13.5A3.75 3.75 0 0018 9.75h-.75v-3A5.25 5.25 0 0012 1.5zm3.25 8.25v-3a3.25 3.25 0 10-6.5 0v3h6.5zM12 14.25a1.5 1.5 0 00-.75 2.8v2.2a.75.75 0 001.5 0v-2.2a1.5 1.5 0 00-.75-2.8z" />
                          </svg>
                          <span>This profile is private</span>
                        </div>
                      ) : (showLevel || showGames || showMemberSince) && (
                        <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap truncate">
                          {showLevel && typeof steamData.level === "number" && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span className="text-white/40">Level</span>
                              <span className="text-white/85">{steamData.level}</span>
                            </div>
                          )}

                          {showGames && (typeof steamData.game_count === "number" ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                                <path fillRule="evenodd" clipRule="evenodd" d="M17.65 4.74C19.82 5.37 21.6 7.21 21.92 9.87l.95 7.82a3.75 3.75 0 01-3.66 4.2c-1.46 0-2.8-.75-3.56-1.99l-1.35-2.2c-.32-.52-.89-.85-1.5-.85H11.2c-.61 0-1.18.33-1.5.85l-1.35 2.2a4.17 4.17 0 01-3.56 1.99 3.75 3.75 0 01-3.66-4.2l.95-7.82c.32-2.66 2.1-4.5 4.27-5.13 1.84-.53 3.82-.04 5.65.61.64.23 1.36.23 2 0 1.83-.65 3.81-1.14 5.65-.61zM7 9a1 1 0 011 1v1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h1v-1a1 1 0 011-1zm10 1a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm-2 2.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
                              </svg>
                              <span className="text-white/85">{steamData.game_count.toLocaleString()}</span>
                              <span className="text-white/40">Games</span>
                            </div>
                          ) : steamData.library_private ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3H6A3.75 3.75 0 002.25 13.5v6.75A3.75 3.75 0 006 24h12a3.75 3.75 0 003.75-3.75V13.5A3.75 3.75 0 0018 9.75h-.75v-3A5.25 5.25 0 0012 1.5zm3.25 8.25v-3a3.25 3.25 0 10-6.5 0v3h6.5zM12 14.25a1.5 1.5 0 00-.75 2.8v2.2a.75.75 0 001.5 0v-2.2a1.5 1.5 0 00-.75-2.8z" />
                              </svg>
                              <span className="text-white/40">Library private</span>
                            </div>
                          ) : null)}

                          {showMemberSince && steamData.member_since && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                                <path fillRule="evenodd" clipRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a3 3 0 00-3 3v13a3 3 0 003 3h16a3 3 0 003-3V7a3 3 0 00-3-3h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm15 7H3v10a1 1 0 001 1h16a1 1 0 001-1V9zm-14 3a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm5-4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm5-4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2z" />
                              </svg>
                              <span className="text-white/40">Since</span>
                              <span className="text-white/85">{steamData.member_since}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <SteamCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showLevel={showLevel}
          onShowLevelChange={setShowLevel}
          showGames={showGames}
          onShowGamesChange={setShowGames}
          showMemberSince={showMemberSince}
          onShowMemberSinceChange={setShowMemberSince}
          showAvatarFrame={showAvatarFrame}
          onShowAvatarFrameChange={setShowAvatarFrame}
          showAnimatedAvatar={showAnimatedAvatar}
          onShowAnimatedAvatarChange={setShowAnimatedAvatar}
          background={background}
          onBackgroundChange={setBackground}
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
