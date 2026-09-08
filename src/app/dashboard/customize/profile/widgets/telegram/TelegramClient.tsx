"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useTelegramUser } from "@/lib/hooks/useTelegramUser";
import { cleanTelegramUsername, isValidTelegramUsername } from "@/lib/telegram";
import SaveBar from "@/components/dashboard/SaveBar";
import TelegramCustomization from "@/components/dashboard/customize/widgets/telegram/TelegramCustomization";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";
import {
  TelegramBioIcon,
  TelegramLogoIcon,
  WidgetRedirectIcon,
} from "@/components/profile/widgets/WidgetIcons";
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";
import { toast } from "sonner";

export default function TelegramClient({ user }: { user: FullUser | null }) {
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
  const initialShowBio = existingWidget?.telegramShowBio !== undefined ? existingWidget.telegramShowBio : true;
  const initialShowBackground = existingWidget?.telegramShowBackground !== undefined ? existingWidget.telegramShowBackground : false;
  const initialShowBackgroundOverlay = existingWidget?.showBackgroundOverlay !== undefined ? existingWidget.showBackgroundOverlay : true;
  const initialShowViewButton = existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;

  const [usernameInput, setUsernameInput] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showBio, setShowBio] = useState<boolean>(initialShowBio);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);
  const [showBackgroundOverlay, setShowBackgroundOverlay] = useState<boolean>(initialShowBackgroundOverlay);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const [, startTransition] = useTransition();

  const cleanUsername = cleanTelegramUsername(usernameInput);
  const isValidUsername = isValidTelegramUsername(cleanUsername);

  const { user: telegramUser, isLoading: loadingPreview } = useTelegramUser(
    cleanUsername,
    { enabled: isValidUsername }
  );

  const isChanged =
    !isEditing ||
    cleanUsername !== initialTargetId ||
    placement !== initialPlacement ||
    imageShape !== initialImageShape ||
    showBio !== initialShowBio ||
    showBackground !== initialShowBackground ||
    showBackgroundOverlay !== initialShowBackgroundOverlay ||
    showViewButton !== initialShowViewButton;

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidUsername) {
      toast.error(
        "Please enter a valid Telegram username (5-32 characters, letters/numbers/underscore, must start with a letter)"
      );
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      targetId: cleanUsername,
      placement,
      imageShape,
      telegramShowBio: showBio,
      telegramShowBackground: showBackground,
      showBackgroundOverlay,
      showViewButton,
    };

    if (isEditing && widgetIdParam) {
      updated = existingList.map((w) =>
        w.id === widgetIdParam ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "telegram",
        type: "telegram-profile",
        targetId: cleanUsername,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        telegramShowBio: showBio,
        telegramShowBackground: showBackground,
        showBackgroundOverlay,
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
      setUsernameInput(initialTargetId);
      setPlacement(initialPlacement);
      setImageShape(initialImageShape);
      setShowBio(initialShowBio);
      setShowBackground(initialShowBackground);
      setShowBackgroundOverlay(initialShowBackgroundOverlay);
      setShowViewButton(initialShowViewButton);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const avatarSrc = telegramUser?.avatarUrl
    ? `/api/widgets/telegram/image?url=${encodeURIComponent(telegramUser.avatarUrl)}`
    : null;

  const bgSrc = showBackground ? avatarSrc : null;

  const shapeClass =
    imageShape === "square"
      ? "rounded-none"
      : imageShape === "circle"
      ? "rounded-full"
      : "rounded-2xl";

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which Telegram profile this widget should fetch.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Telegram Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <TelegramLogoIcon size={15} className="w-[15px] h-[15px]" />
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. durov"
                  maxLength={64}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                The Telegram handle without the @ (e.g. &apos;durov&apos; from t.me/durov).
                Profile must exist and be public.
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
              {!isValidUsername ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a Telegram username to see live preview
                  </span>
                </div>
              ) : loadingPreview && !telegramUser ? (
                <WidgetSkeleton imageShape={imageShape} />
              ) : !telegramUser ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Profile not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find Telegram profile &quot;{cleanUsername}&quot;.
                    </span>
                  </div>
                </div>
              ) : (
                <a
                  href={`https://t.me/${encodeURIComponent(telegramUser.username)}`}
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
                      className={`relative w-[74px] h-[74px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${shapeClass}`}
                    >
                      {avatarSrc ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={avatarSrc}
                          alt={telegramUser.displayName}
                          className="w-full h-full object-cover block"
                        />
                      ) : (
                        <TelegramLogoIcon size={30} className="w-[30px] h-[30px] opacity-40" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden pr-6">
                      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        <OverflowPingPong deps={[telegramUser, telegramUser.displayName]}>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <TelegramLogoIcon size={14} className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                              {telegramUser.displayName}
                            </span>
                          </div>
                        </OverflowPingPong>
                      </div>

                      <div className="min-w-0 overflow-hidden">
                        <OverflowPingPong deps={[telegramUser.bio, showBio]}>
                          <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight whitespace-nowrap shrink-0">
                            {showBio && telegramUser.bio ? (
                              <>
                                <TelegramBioIcon
                                  size={13}
                                  className="w-[13px] h-[13px] shrink-0 text-white/50"
                                />
                                <span className="text-white/60 shrink-0">
                                  {telegramUser.bio}
                                </span>
                              </>
                            ) : (
                              <span className="text-white/40 shrink-0">
                                @{telegramUser.username}
                              </span>
                            )}
                          </div>
                        </OverflowPingPong>
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <TelegramCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showBio={showBio}
          onShowBioChange={setShowBio}
          showBackground={showBackground}
          onShowBackgroundChange={setShowBackground}
          showBackgroundOverlay={showBackgroundOverlay}
          onShowBackgroundOverlayChange={setShowBackgroundOverlay}
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
