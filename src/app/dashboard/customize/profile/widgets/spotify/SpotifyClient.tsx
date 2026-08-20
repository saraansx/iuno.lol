"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useSpotifyItem } from "@/lib/hooks/useSpotifyItem";
import { formatNumber, parseSpotifyIdentifier } from "@/lib/spotify";
import SaveBar from "@/components/dashboard/SaveBar";
import SpotifyCustomization from "@/components/dashboard/customize/widgets/spotify/SpotifyCustomization";
import OverflowPingPong from "@/components/profile/widgets/OverflowPingPong";
import {
  SpotifyArtistIcon,
  SpotifyAlbumIcon,
  SpotifyFollowersIcon,
  SpotifyListenersIcon,
  SpotifyTracksIcon,
  SpotifyCalendarIcon,
  SpotifyLogoIcon,
} from "@/components/profile/widgets/spotify/SpotifyIcons";
import { toast } from "sonner";

export default function SpotifyClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetIdParam = searchParams.get("widgetId");
  const typeParam = searchParams.get("type") || "spotify-track";
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

  const initialRawType = existingWidget?.type || typeParam || "spotify-track";
  const initialItemType = (initialRawType.replace("spotify-", "") || "track") as
    | "track"
    | "album"
    | "playlist"
    | "artist"
    | "user";
  const initialTargetId = existingWidget?.targetId || idParam || "";
  const initialPlacement = (existingWidget?.placement || "inside") as "inside" | "outside";
  const initialImageShape = (existingWidget?.imageShape || "rounded") as "circle" | "rounded" | "square";
  const initialShowArtist = existingWidget?.spotifyShowArtist !== undefined ? existingWidget.spotifyShowArtist : true;
  const initialShowAlbum = existingWidget?.spotifyShowAlbum !== undefined ? existingWidget.spotifyShowAlbum : true;
  const initialShowTrackCount = existingWidget?.spotifyShowTrackCount !== undefined ? existingWidget.spotifyShowTrackCount : true;
  const initialShowReleaseYear = existingWidget?.spotifyShowReleaseYear !== undefined ? existingWidget.spotifyShowReleaseYear : true;
  const initialShowOwner = existingWidget?.spotifyShowOwner !== undefined ? existingWidget.spotifyShowOwner : true;
  const initialShowFollowers = existingWidget?.spotifyShowFollowers !== undefined ? existingWidget.spotifyShowFollowers : true;
  const initialShowMonthlyListeners = existingWidget?.spotifyShowMonthlyListeners !== undefined ? existingWidget.spotifyShowMonthlyListeners : true;
  const initialShowBackground = existingWidget?.spotifyShowBackground !== undefined ? existingWidget.spotifyShowBackground : false;
  const initialShowViewButton = existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;

  const [itemType, setItemType] = useState<"track" | "album" | "playlist" | "artist" | "user">(initialItemType);
  const [inputVal, setInputVal] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showArtist, setShowArtist] = useState<boolean>(initialShowArtist);
  const [showAlbum, setShowAlbum] = useState<boolean>(initialShowAlbum);
  const [showTrackCount, setShowTrackCount] = useState<boolean>(initialShowTrackCount);
  const [showReleaseYear, setShowReleaseYear] = useState<boolean>(initialShowReleaseYear);
  const [showOwner, setShowOwner] = useState<boolean>(initialShowOwner);
  const [showFollowers, setShowFollowers] = useState<boolean>(initialShowFollowers);
  const [showMonthlyListeners, setShowMonthlyListeners] = useState<boolean>(initialShowMonthlyListeners);
  const [showBackground, setShowBackground] = useState<boolean>(initialShowBackground);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const [, startTransition] = useTransition();

  const parsed = parseSpotifyIdentifier(inputVal.trim());
  const effectiveType = parsed.type || itemType;
  const effectiveId = parsed.id || inputVal.trim();

  const isValidInput = Boolean(effectiveId && effectiveId.length >= 3);
  const { data: itemData, isLoading: loadingPreview } = useSpotifyItem(
    effectiveType,
    effectiveId,
    { enabled: isValidInput }
  );

  const isChanged =
    !isEditing ||
    effectiveType !== initialItemType ||
    effectiveId !== initialTargetId ||
    placement !== initialPlacement ||
    imageShape !== initialImageShape ||
    showArtist !== initialShowArtist ||
    showAlbum !== initialShowAlbum ||
    showTrackCount !== initialShowTrackCount ||
    showReleaseYear !== initialShowReleaseYear ||
    showOwner !== initialShowOwner ||
    showFollowers !== initialShowFollowers ||
    showMonthlyListeners !== initialShowMonthlyListeners ||
    showBackground !== initialShowBackground ||
    showViewButton !== initialShowViewButton;

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidInput) {
      toast.error("Please enter a valid Spotify ID or link");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    const widgetPayload: Partial<WidgetItem> = {
      type: `spotify-${effectiveType}`,
      targetId: effectiveId,
      placement,
      imageShape,
      spotifyShowArtist: showArtist,
      spotifyShowAlbum: showAlbum,
      spotifyShowTrackCount: showTrackCount,
      spotifyShowReleaseYear: showReleaseYear,
      spotifyShowOwner: showOwner,
      spotifyShowFollowers: showFollowers,
      spotifyShowMonthlyListeners: showMonthlyListeners,
      spotifyShowBackground: showBackground,
      showViewButton,
    };

    if (isEditing && widgetIdParam) {
      updated = existingList.map((w) =>
        w.id === widgetIdParam ? ({ ...w, ...widgetPayload } as WidgetItem) : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}`,
        platform: "spotify",
        type: `spotify-${effectiveType}`,
        targetId: effectiveId,
        useLinked: false,
        enabled: true,
        placement,
        imageShape,
        spotifyShowArtist: showArtist,
        spotifyShowAlbum: showAlbum,
        spotifyShowTrackCount: showTrackCount,
        spotifyShowReleaseYear: showReleaseYear,
        spotifyShowOwner: showOwner,
        spotifyShowFollowers: showFollowers,
        spotifyShowMonthlyListeners: showMonthlyListeners,
        spotifyShowBackground: showBackground,
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
      setItemType(initialItemType);
      setInputVal(initialTargetId);
      setPlacement(initialPlacement);
      setImageShape(initialImageShape);
      setShowArtist(initialShowArtist);
      setShowAlbum(initialShowAlbum);
      setShowTrackCount(initialShowTrackCount);
      setShowReleaseYear(initialShowReleaseYear);
      setShowOwner(initialShowOwner);
      setShowFollowers(initialShowFollowers);
      setShowMonthlyListeners(initialShowMonthlyListeners);
      setShowBackground(initialShowBackground);
      setShowViewButton(initialShowViewButton);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const imageSrc = itemData?.imageUrl
    ? `/api/widgets/spotify/image?url=${encodeURIComponent(itemData.imageUrl)}`
    : null;

  const bgSrc = showBackground ? imageSrc : null;

  // Compute subtitle display based on type and toggles
  const renderSubtitle = () => {
    if (!itemData) return null;

    if (effectiveType === "track") {
      const parts: React.ReactNode[] = [];
      if (showArtist && itemData.artistName) {
        parts.push(
          <span key="artist" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyArtistIcon size={12} className="text-white/50 shrink-0" />
            <span>{itemData.artistName}</span>
          </span>
        );
      }
      if (showAlbum && itemData.albumName && itemData.albumName !== itemData.title) {
        parts.push(
          <span key="album" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyAlbumIcon size={12} className="text-white/50 shrink-0" />
            <span>{itemData.albumName}</span>
          </span>
        );
      }
      if (parts.length > 0) {
        return (
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            {parts.map((p, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 shrink-0">
                {idx > 0 && <span className="text-white/20">•</span>}
                {p}
              </span>
            ))}
          </div>
        );
      }
      return <span className="text-white/50">{itemData.subtitle || "Spotify Track"}</span>;
    }

    if (effectiveType === "album") {
      const parts: React.ReactNode[] = [];
      if (showArtist && itemData.artistName) {
        parts.push(
          <span key="artist" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyArtistIcon size={12} className="text-white/50 shrink-0" />
            <span>{itemData.artistName}</span>
          </span>
        );
      }
      if (showReleaseYear && itemData.releaseYear) {
        parts.push(
          <span key="year" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyCalendarIcon size={12} className="text-white/50 shrink-0" />
            <span>{itemData.releaseYear}</span>
          </span>
        );
      }
      if (showTrackCount && itemData.trackCount) {
        parts.push(
          <span key="tracks" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyTracksIcon size={12} className="text-white/50 shrink-0" />
            <span>{itemData.trackCount} tracks</span>
          </span>
        );
      }
      if (parts.length > 0) {
        return (
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            {parts.map((p, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 shrink-0">
                {idx > 0 && <span className="text-white/20">•</span>}
                {p}
              </span>
            ))}
          </div>
        );
      }
      return <span className="text-white/50">{itemData.subtitle || "Spotify Album"}</span>;
    }

    if (effectiveType === "playlist") {
      const parts: React.ReactNode[] = [];
      if (showOwner && itemData.ownerName) {
        parts.push(
          <span key="owner" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyArtistIcon size={12} className="text-white/50 shrink-0" />
            <span>By {itemData.ownerName}</span>
          </span>
        );
      }
      if (showTrackCount && itemData.trackCount !== undefined && itemData.trackCount !== null) {
        parts.push(
          <span key="tracks" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyTracksIcon size={12} className="text-white/50 shrink-0" />
            <span>{itemData.trackCount} track{itemData.trackCount === 1 ? "" : "s"}</span>
          </span>
        );
      }
      if (parts.length > 0) {
        return (
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            {parts.map((p, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 shrink-0">
                {idx > 0 && <span className="text-white/20">•</span>}
                {p}
              </span>
            ))}
          </div>
        );
      }
      return <span className="text-white/50">{itemData.subtitle || "Spotify Playlist"}</span>;
    }

    if (effectiveType === "artist") {
      const parts: React.ReactNode[] = [];
      if (showFollowers && itemData.followersCount !== undefined && itemData.followersCount !== null && itemData.followersCount > 0) {
        parts.push(
          <span key="followers" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyFollowersIcon size={12} className="text-white/50 shrink-0" />
            <span>{formatNumber(itemData.followersCount)} followers</span>
          </span>
        );
      }
      if (showMonthlyListeners && itemData.monthlyListeners !== undefined && itemData.monthlyListeners !== null && itemData.monthlyListeners > 0) {
        parts.push(
          <span key="listeners" className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
            <SpotifyListenersIcon size={12} className="text-white/50 shrink-0" />
            <span>{formatNumber(itemData.monthlyListeners)} monthly listeners</span>
          </span>
        );
      }
      if (parts.length > 0) {
        return (
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            {parts.map((p, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 shrink-0">
                {idx > 0 && <span className="text-white/20">•</span>}
                {p}
              </span>
            ))}
          </div>
        );
      }
      return <span className="text-white/50">{itemData.subtitle || "Spotify Artist"}</span>;
    }

    if (effectiveType === "user") {
      return (
        <span className="inline-flex items-center gap-1.5 shrink-0 text-white/70">
          <SpotifyArtistIcon size={12} className="text-white/50 shrink-0" />
          <span>Spotify User</span>
        </span>
      );
    }

    return <span className="text-white/50">{itemData.subtitle || "Spotify"}</span>;
  };

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        {/* Top 2-Column Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Account Settings Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which Spotify item this widget should display.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Spotify Link, URI, or ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#1ED760">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. 4cOdK2wGLETKBW3PvgPWqT or open.spotify.com/track/..."
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Paste any Spotify share URL, Spotify URI, or raw identifier.
              </p>
            </div>
          </div>

          {/* Right Side: Live Preview Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!isValidInput ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a Spotify item to see live preview
                  </span>
                </div>
              ) : loadingPreview && !itemData ? (
                <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
                  <div className="flex items-center gap-3.5 min-w-0 w-full">
                    <div
                      className={`w-[60px] h-[60px] shrink-0 bg-white/[0.05] ${
                        imageShape === "square"
                          ? "rounded-none"
                          : imageShape === "circle"
                          ? "rounded-full"
                          : "rounded-2xl"
                      }`}
                    />
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
                      <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
                    </div>
                  </div>
                </div>
              ) : !itemData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Item not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find Spotify {effectiveType} with ID &quot;{effectiveId}&quot;.
                    </span>
                  </div>
                </div>
              ) : (
                /* Live Spotify Widget Card */
                <a
                  href={itemData.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
                >
                  {/* Top-Right Redirect Badge */}
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

                  {/* Blurred Backdrop */}
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
                    {/* Artwork / Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`relative w-[60px] h-[60px] overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
                          imageShape === "square"
                            ? "rounded-none"
                            : imageShape === "circle"
                            ? "rounded-full"
                            : "rounded-2xl"
                        }`}
                      >
                        {imageSrc ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imageSrc}
                            alt={itemData.title}
                            className="w-full h-full object-cover block"
                          />
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#1ED760">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden pr-6">
                      {/* Header Row */}
                      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        <OverflowPingPong deps={[itemData, itemData.title, effectiveType]}>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Official Spotify Green Icon */}
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="#1ED760"
                              className="shrink-0"
                            >
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
                            </svg>

                            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                              {itemData.title}
                            </span>
                          </div>
                        </OverflowPingPong>
                      </div>

                      {/* Subtitle / Metadata Row */}
                      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        <OverflowPingPong deps={[itemData, effectiveType, showArtist, showAlbum, showTrackCount, showReleaseYear, showOwner, showFollowers, showMonthlyListeners]}>
                          <div className="text-[12px] font-normal tracking-normal truncate shrink-0">
                            {renderSubtitle()}
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

        {/* Bottom Card: Spotify Customization Settings */}
        <SpotifyCustomization
          type={effectiveType}
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showArtist={showArtist}
          onShowArtistChange={setShowArtist}
          showAlbum={showAlbum}
          onShowAlbumChange={setShowAlbum}
          showTrackCount={showTrackCount}
          onShowTrackCountChange={setShowTrackCount}
          showReleaseYear={showReleaseYear}
          onShowReleaseYearChange={setShowReleaseYear}
          showOwner={showOwner}
          onShowOwnerChange={setShowOwner}
          showFollowers={showFollowers}
          onShowFollowersChange={setShowFollowers}
          showMonthlyListeners={showMonthlyListeners}
          onShowMonthlyListenersChange={setShowMonthlyListeners}
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
