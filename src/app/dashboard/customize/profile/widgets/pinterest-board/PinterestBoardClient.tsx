"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { usePinterestBoard } from "@/lib/hooks/usePinterestBoard";
import PinterestBoardCustomization from "@/components/dashboard/customize/widgets/pinterest-board/PinterestBoardCustomization";
import { toast } from "sonner";

export default function PinterestBoardClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("widgetId");
  const isEditing = Boolean(widgetId);

  const initialTargetId = searchParams.get("id") || "";
  const currentWidget = ((user?.widgets as WidgetItem[]) || []).find((w) => w.id === widgetId);
  const initialImageShape = currentWidget?.imageShape || "rounded";
  const initialShowPinCount = currentWidget?.showPinCount !== undefined ? currentWidget.showPinCount : true;
  const initialImageBackground = currentWidget?.imageBackground !== undefined ? currentWidget.imageBackground : true;
  const initialShowBackgroundOverlay = currentWidget?.showBackgroundOverlay !== undefined ? currentWidget.showBackgroundOverlay : true;
  const initialShowViewButton = currentWidget?.showViewButton !== undefined ? currentWidget.showViewButton : true;
  const initialPlacement = currentWidget?.placement || "inside";

  const [boardInput, setBoardInput] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showPinCount, setShowPinCount] = useState<boolean>(initialShowPinCount);
  const [imageBackground, setImageBackground] = useState<boolean>(initialImageBackground);
  const [showBackgroundOverlay, setShowBackgroundOverlay] = useState<boolean>(initialShowBackgroundOverlay);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const cleanBoardInput = boardInput
    .trim()
    .replace(/^https?:\/\/(www\.)?pinterest\.[a-z.]+\//i, "")
    .replace(/\/$/, "")
    .replace(/^@/, "");

  const parts = cleanBoardInput.split("/").filter(Boolean);
  const username = parts[0] || "";
  const boardSlug = parts[1] || "";

  const { data: boardData, loading: loadingPreview, isValidBoard } = usePinterestBoard(cleanBoardInput);

  const isChanged =
    cleanBoardInput !== initialTargetId ||
    imageShape !== initialImageShape ||
    showPinCount !== initialShowPinCount ||
    imageBackground !== initialImageBackground ||
    showBackgroundOverlay !== initialShowBackgroundOverlay ||
    showViewButton !== initialShowViewButton ||
    placement !== initialPlacement;

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidBoard) {
      toast.error("Please enter a valid Pinterest board (e.g. username/board)");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    if (isEditing) {
      updated = existingList.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              targetId: `${username}/${boardSlug}`,
              imageShape,
              showPinCount,
              imageBackground,
              showBackgroundOverlay,
              showViewButton,
              placement,
            }
          : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}`,
        platform: "pinterest",
        type: "pinterest-board",
        targetId: `${username}/${boardSlug}`,
        useLinked: false,
        enabled: true,
        imageShape,
        showPinCount,
        imageBackground,
        showBackgroundOverlay,
        showViewButton,
        placement,
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
      setBoardInput(initialTargetId);
      setImageShape(initialImageShape);
      setShowPinCount(initialShowPinCount);
      setImageBackground(initialImageBackground);
      setShowBackgroundOverlay(initialShowBackgroundOverlay);
      setShowViewButton(initialShowViewButton);
      setPlacement(initialPlacement);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const coverUrl = boardData?.cover_image
    ? `/api/widgets/pinterest/image?url=${encodeURIComponent(boardData.cover_image)}`
    : "";
  const bgImageSource = boardData?.first_pin_image || boardData?.cover_image;
  const bgImageUrl = bgImageSource
    ? `/api/widgets/pinterest/image?url=${encodeURIComponent(bgImageSource)}`
    : "";

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        {/* Top 2-Column Grid: Account on Left, Live Preview on Right */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Account Settings Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which board this widget should fetch.
              </p>
            </div>

            {/* Board Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Pinterest Board</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={boardInput}
                  onChange={(e) => setBoardInput(e.target.value)}
                  placeholder="e.g. username/board"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                The board in username/board format or full Pinterest board URL.
              </p>
            </div>
          </div>

          {/* Right Side: Live Pinterest Board Preview Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!isValidBoard ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a valid Pinterest board (username/board) to see live preview
                  </span>
                </div>
              ) : loadingPreview && !boardData ? (
                <div className={`w-full ${showViewButton ? "py-3.5" : "h-[98px]"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[20px] px-4 shadow-md flex flex-col justify-center gap-2.5`}>
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <div
                      className={`w-[52px] h-[52px] shrink-0 bg-white/[0.05] ${
                        imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
                      }`}
                    />
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
                      <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
                    </div>
                  </div>
                  {showViewButton && <div className="w-full h-8 bg-white/[0.05] rounded-xl shrink-0" />}
                </div>
              ) : !boardData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Board not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find a Pinterest board with that name.
                    </span>
                  </div>
                </div>
              ) : (
                /* Live Pinterest Board Widget Card */
                <div className={`relative w-full overflow-hidden rounded-[20px] bg-[#101010] border border-white/10 ${showViewButton ? "py-3.5 px-4" : "h-[98px] px-4"} flex flex-col justify-center gap-2.5 transition-all duration-200 shadow-md`}>
                  {/* Blurred Background Layer */}
                  {showBackgroundOverlay && bgImageUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bgImageUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-35 filter blur-[14px] scale-125"
                      />
                      <div className="absolute inset-0 bg-[#101010]/60 backdrop-blur-[2px]" />
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col gap-2.5 w-full">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      {/* Cover / Pin Image */}
                      <div
                        className={`relative w-[52px] h-[52px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
                          imageShape === "square"
                            ? "rounded-none"
                            : imageShape === "circle"
                            ? "rounded-full"
                            : "rounded-2xl"
                        }`}
                      >
                        {coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coverUrl}
                            alt=""
                            className="w-full h-full object-cover block"
                          />
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#e60023">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                          </svg>
                        )}
                      </div>

                      {/* Info + Counts */}
                      <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[15px] font-normal text-white tracking-tight truncate">
                            {boardData.name}
                          </span>
                        </div>

                        {showPinCount && (
                          <div className="flex items-center gap-1 text-[12px] text-white/60 font-normal">
                            <span className="text-white/90 font-medium">
                              {Number(boardData.pin_count || 0).toLocaleString()}+
                            </span>
                            <span className="text-white/40">pins</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    {showViewButton && (
                      <a
                        href={boardData.url || `https://www.pinterest.com/${encodeURIComponent(username)}/${encodeURIComponent(boardSlug)}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-8 px-7 py-2.5 bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-[#80bbf2] border border-[#609fda]/25 rounded-xl font-normal text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <span>View Board</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Dedicated Full-Width Board Customization Container */}
        <PinterestBoardCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showPinCount={showPinCount}
          onShowPinCountChange={setShowPinCount}
          showBackgroundOverlay={showBackgroundOverlay}
          onShowBackgroundOverlayChange={setShowBackgroundOverlay}
          showViewButton={showViewButton}
          onShowViewButtonChange={setShowViewButton}
        />
      </div>

      {/* Floating Save/Add Widget Bar */}
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
