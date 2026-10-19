"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useAppleMusicItem } from "@/lib/hooks/useAppleMusicItem";
import {
  type AppleMusicItemType,
  appleMusicTypeFromWidgetType,
  parseAppleMusicInput,
} from "@/lib/apple-music";
import AppleMusicCustomization from "@/components/dashboard/customize/widgets/apple-music/AppleMusicCustomization";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";
import {
  AppleMusicAlbumIcon,
  AppleMusicArtistIcon,
  AppleMusicCalendarIcon,
  AppleMusicGenreIcon,
  AppleMusicLogoIcon,
  AppleMusicTracksIcon,
} from "@/components/profile/widgets/AppleMusicIcons";
import { WidgetRedirectIcon } from "@/components/profile/widgets/WidgetIcons";
import { toast } from "sonner";
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";

const TYPE_OPTIONS: Array<{ id: AppleMusicItemType; name: string }> = [
  { id: "track", name: "Apple Music Track" },
  { id: "album", name: "Apple Music Album" },
  { id: "artist", name: "Apple Music Artist" },
];

const PLACEHOLDER: Record<AppleMusicItemType, string> = {
  track: "music.apple.com/.../song/... or track ID",
  album: "music.apple.com/.../album/... or album ID",
  artist: "music.apple.com/.../artist/... or artist ID",
};

export default function AppleMusicClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetIdParam = searchParams.get("widgetId");
  const idParam = searchParams.get("id") || "";
  const typeParam = searchParams.get("type") || "";

  const existingWidgets = useMemo(
    () => ((user?.widgets as WidgetItem[]) || []),
    [user?.widgets]
  );

  const existingWidget = useMemo(
    () =>
      widgetIdParam
        ? existingWidgets.find((w) => w.id === widgetIdParam)
        : existingWidgets.find((w) => w.platform === "apple-music"),
    [existingWidgets, widgetIdParam]
  );

  const isEditing = Boolean(widgetIdParam && existingWidget);

  const initialTargetId = existingWidget?.targetId || idParam || "";
  const initialType = appleMusicTypeFromWidgetType(
    existingWidget?.type || typeParam || "apple-music-track"
  );
  const initialImageShape = existingWidget?.imageShape || "rounded";
  const initialShowArtist =
    existingWidget?.appleMusicShowArtist !== undefined
      ? existingWidget.appleMusicShowArtist
      : true;
  const initialShowAlbum =
    existingWidget?.appleMusicShowAlbum !== undefined
      ? existingWidget.appleMusicShowAlbum
      : true;
  const initialShowReleaseYear =
    existingWidget?.appleMusicShowReleaseYear !== undefined
      ? existingWidget.appleMusicShowReleaseYear
      : true;
  const initialShowTrackCount =
    existingWidget?.appleMusicShowTrackCount !== undefined
      ? existingWidget.appleMusicShowTrackCount
      : true;
  const initialShowGenre =
    existingWidget?.appleMusicShowGenre !== undefined
      ? existingWidget.appleMusicShowGenre
      : true;
  const initialShowBackground =
    existingWidget?.appleMusicShowBackground !== undefined
      ? existingWidget.appleMusicShowBackground
      : false;
  const initialShowViewButton =
    existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;
  const initialPlacement = (existingWidget?.placement || "inside") as "inside" | "outside";

  const [input, setInput] = useState(initialTargetId);
  const [selectedType, setSelectedType] = useState<AppleMusicItemType>(initialType);
  const [typeOverride, setTypeOverride] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showArtist, setShowArtist] = useState<boolean>(initialShowArtist);
  const [showAlbum, setShowAlbum] = useState<boolean>(initialShowAlbum);
  const [showReleaseYear, setShowReleaseYear] = useState<boolean>(initialShowReleaseYear);
  const [showTrackCount, setShowTrackCount] = useState<boolean>(initialShowTrackCount);
  const [showGenre, setShowGenre] = useState<boolean>(initialShowGenre);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const parsed = parseAppleMusicInput(input);
  const cleanId = parsed.id;
  const activeType = typeOverride ? selectedType : parsed.type ?? selectedType;

  const { data: itemData, isLoading: loadingPreview } = useAppleMusicItem(
    activeType,
    cleanId
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    setTypeOverride(false);
    const detected = parseAppleMusicInput(value).type;
    if (detected) setSelectedType(detected);
  };

  const handleTypeSelect = (type: AppleMusicItemType) => {
    setSelectedType(type);
    setTypeOverride(true);
    setTypeDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isChanged = useMemo(() => {
    if (!isEditing) {
      return Boolean(cleanId);
    }
    return (
      cleanId !== initialTargetId ||
      activeType !== initialType ||
      imageShape !== initialImageShape ||
      showArtist !== initialShowArtist ||
      showAlbum !== initialShowAlbum ||
      showReleaseYear !== initialShowReleaseYear ||
      showTrackCount !== initialShowTrackCount ||
      showGenre !== initialShowGenre ||
      showBackground !== initialShowBackground ||
      showViewButton !== initialShowViewButton ||
      placement !== initialPlacement
    );
  }, [
    isEditing,
    cleanId,
    activeType,
    imageShape,
    showArtist,
    showAlbum,
    showReleaseYear,
    showTrackCount,
    showGenre,
    showBackground,
    showViewButton,
    placement,
    initialTargetId,
    initialType,
    initialImageShape,
    initialShowArtist,
    initialShowAlbum,
    initialShowReleaseYear,
    initialShowTrackCount,
    initialShowGenre,
    initialShowBackground,
    initialShowViewButton,
    initialPlacement,
  ]);

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!cleanId) {
      toast.error("Please paste a valid Apple Music link or ID");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    const widgetType = `apple-music-${activeType}`;
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      type: widgetType,
      targetId: cleanId,
      placement,
      imageShape,
      appleMusicShowArtist: showArtist,
      appleMusicShowAlbum: showAlbum,
      appleMusicShowReleaseYear: showReleaseYear,
      appleMusicShowTrackCount: showTrackCount,
      appleMusicShowGenre: showGenre,
      appleMusicShowBackground: showBackground,
      showViewButton,
    };

    if (isEditing && existingWidget) {
      updated = existingList.map((w) =>
        w.id === existingWidget.id ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: "apple-music",
        type: widgetType,
        targetId: cleanId,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        appleMusicShowArtist: showArtist,
        appleMusicShowAlbum: showAlbum,
        appleMusicShowReleaseYear: showReleaseYear,
        appleMusicShowTrackCount: showTrackCount,
        appleMusicShowGenre: showGenre,
        appleMusicShowBackground: showBackground,
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
      setInput(initialTargetId);
      setSelectedType(initialType);
      setTypeOverride(false);
      setImageShape(initialImageShape);
      setShowArtist(initialShowArtist);
      setShowAlbum(initialShowAlbum);
      setShowReleaseYear(initialShowReleaseYear);
      setShowTrackCount(initialShowTrackCount);
      setShowGenre(initialShowGenre);
      setShowBackground(initialShowBackground);
      setShowViewButton(initialShowViewButton);
      setPlacement(initialPlacement);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const artworkProxyUrl = itemData?.imageUrl
    ? `/api/widgets/apple-music/image?url=${encodeURIComponent(itemData.imageUrl)}`
    : "";

  const previewSubtitle = itemData
    ? activeType === "track"
      ? [showArtist ? itemData.artistName : null, showAlbum ? itemData.albumName : null]
          .filter(Boolean)
          .join(" • ")
      : activeType === "album"
        ? [
            showArtist ? itemData.artistName : null,
            showReleaseYear ? itemData.releaseYear : null,
            showTrackCount && itemData.trackCount
              ? `${itemData.trackCount} track${itemData.trackCount === 1 ? "" : "s"}`
              : null,
          ]
            .filter(Boolean)
            .join(" • ")
        : showGenre
          ? itemData.genre || ""
          : ""
    : "";

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Item</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Paste an Apple Music link to a track, album or artist.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Type</label>
              <div className="relative" ref={typeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 h-10 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <AppleMusicLogoIcon size={16} className="shrink-0" />
                    <span>
                      {TYPE_OPTIONS.find((t) => t.id === activeType)?.name || "Apple Music Track"}
                    </span>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-white/40 transition-transform duration-200 ${typeDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {typeDropdownOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 p-1 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col gap-0.5">
                    {TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleTypeSelect(option.id)}
                        className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-[13px] transition-colors ${
                          activeType === option.id
                            ? "bg-white/10 text-white font-normal cursor-pointer"
                            : "text-white/50 hover:bg-white/5 hover:text-white cursor-pointer"
                        }`}
                      >
                        <span>{option.name}</span>
                        {activeType === option.id ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FC3C44]" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">
                Apple Music Link or ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <AppleMusicLogoIcon size={16} />
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={PLACEHOLDER[activeType]}
                  maxLength={300}
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                The type is detected from the link automatically. For a bare ID, pick the type above.
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
              {!cleanId ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-2">
                    <AppleMusicLogoIcon size={16} className="opacity-60" />
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Paste an Apple Music link to see live preview
                  </span>
                </div>
              ) : loadingPreview && !itemData ? (
                <WidgetSkeleton imageShape={imageShape} />
              ) : !itemData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Item not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not load this {activeType}. Check the link or try another release.
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

                  {showBackground && artworkProxyUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={artworkProxyUrl}
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
                      {artworkProxyUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={artworkProxyUrl}
                          alt=""
                          className="w-full h-full object-cover block"
                        />
                      ) : (
                        <AppleMusicLogoIcon size={30} className="opacity-60" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden pr-6">
                      <OverflowPingPong
                        pauseDuration={0.35}
                        speed={26}
                        deps={[itemData, itemData?.title, activeType]}
                      >
                        <div className="flex items-center gap-1.5 shrink-0">
                          <AppleMusicLogoIcon size={14} className="w-3.5 h-3.5" />
                          <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                            {itemData?.title || "Apple Music"}
                          </span>
                        </div>
                      </OverflowPingPong>

                      <OverflowPingPong
                        pauseDuration={0.35}
                        speed={26}
                        deps={[
                          itemData,
                          activeType,
                          showArtist,
                          showAlbum,
                          showReleaseYear,
                          showTrackCount,
                          showGenre,
                        ]}
                      >
                        <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                          {activeType === "track" && showArtist && itemData?.artistName && (
                            <span className="inline-flex items-center gap-1.5 text-white/85">
                              <AppleMusicArtistIcon size={12} className="text-white/50" />
                              {itemData.artistName}
                            </span>
                          )}
                          {activeType === "track" && showAlbum && itemData?.albumName && (
                            <span className="inline-flex items-center gap-1.5 text-white/85">
                              <AppleMusicAlbumIcon size={12} className="text-white/50" />
                              {itemData.albumName}
                            </span>
                          )}
                          {activeType === "album" && showArtist && itemData?.artistName && (
                            <span className="inline-flex items-center gap-1.5 text-white/85">
                              <AppleMusicArtistIcon size={12} className="text-white/50" />
                              {itemData.artistName}
                            </span>
                          )}
                          {activeType === "album" && showReleaseYear && itemData?.releaseYear && (
                            <span className="inline-flex items-center gap-1.5 text-white/85">
                              <AppleMusicCalendarIcon size={12} className="text-white/50" />
                              {itemData.releaseYear}
                            </span>
                          )}
                          {activeType === "album" &&
                            showTrackCount &&
                            itemData &&
                            itemData.trackCount > 0 && (
                              <span className="inline-flex items-center gap-1.5 text-white/85">
                                <AppleMusicTracksIcon size={12} className="text-white/50" />
                                {itemData.trackCount} track
                                {itemData.trackCount === 1 ? "" : "s"}
                              </span>
                            )}
                          {activeType === "artist" && showGenre && itemData?.genre && (
                            <span className="inline-flex items-center gap-1.5 text-white/85">
                              <AppleMusicGenreIcon size={12} className="text-white/50" />
                              {itemData.genre}
                            </span>
                          )}
                          {!previewSubtitle && (
                            <span className="text-white/50">
                              {itemData?.subtitle || `Apple Music ${activeType}`}
                            </span>
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

        <AppleMusicCustomization
          activeType={activeType}
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showArtist={showArtist}
          onShowArtistChange={setShowArtist}
          showAlbum={showAlbum}
          onShowAlbumChange={setShowAlbum}
          showReleaseYear={showReleaseYear}
          onShowReleaseYearChange={setShowReleaseYear}
          showTrackCount={showTrackCount}
          onShowTrackCountChange={setShowTrackCount}
          showGenre={showGenre}
          onShowGenreChange={setShowGenre}
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
        revertLabel={isEditing ? "Cancel" : "Cancel"}
      />
    </>
  );
}
