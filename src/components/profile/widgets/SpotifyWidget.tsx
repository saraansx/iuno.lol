"use client";

import { useSpotifyItem } from "@/lib/hooks/useSpotifyItem";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { formatNumber } from "@/lib/spotify";
import OverflowPingPong from "./OverflowPingPong";
import {
  SpotifyArtistIcon,
  SpotifyAlbumIcon,
  SpotifyFollowersIcon,
  SpotifyListenersIcon,
  SpotifyTracksIcon,
  SpotifyCalendarIcon,
  SpotifyLogoIcon,
} from "./spotify/SpotifyIcons";

export default function SpotifyWidget({ widget }: { widget: WidgetItem }) {
  const rawType = widget.type || "spotify-track";
  const effectiveType = (rawType.replace("spotify-", "") || "track") as
    | "track"
    | "album"
    | "playlist"
    | "artist"
    | "user";
  const cleanId = (widget.targetId || "").trim();

  const { data: itemData, isLoading } = useSpotifyItem(effectiveType, cleanId);

  const imageShape = widget.imageShape || "rounded";
  const showArtist = widget.spotifyShowArtist !== undefined ? widget.spotifyShowArtist : true;
  const showAlbum = widget.spotifyShowAlbum !== undefined ? widget.spotifyShowAlbum : true;
  const showTrackCount = widget.spotifyShowTrackCount !== undefined ? widget.spotifyShowTrackCount : true;
  const showReleaseYear = widget.spotifyShowReleaseYear !== undefined ? widget.spotifyShowReleaseYear : true;
  const showOwner = widget.spotifyShowOwner !== undefined ? widget.spotifyShowOwner : true;
  const showFollowers = widget.spotifyShowFollowers !== undefined ? widget.spotifyShowFollowers : true;
  const showMonthlyListeners = widget.spotifyShowMonthlyListeners !== undefined ? widget.spotifyShowMonthlyListeners : true;
  const showBackground = widget.spotifyShowBackground !== undefined ? widget.spotifyShowBackground : false;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  if (isLoading || !itemData) {
    return (
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
    );
  }

  const imageSrc = itemData.imageUrl
    ? `/api/widgets/spotify/image?url=${encodeURIComponent(itemData.imageUrl)}`
    : null;

  const bgSrc = showBackground ? imageSrc : null;

  const renderSubtitle = () => {
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
        {/* Artwork / Image */}
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

          {/* Subtitle Row */}
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
  );
}
