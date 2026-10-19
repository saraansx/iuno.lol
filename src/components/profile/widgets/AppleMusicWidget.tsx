"use client";

import { useAppleMusicItem } from "@/lib/hooks/useAppleMusicItem";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { appleMusicTypeFromWidgetType, parseAppleMusicInput } from "@/lib/apple-music";
import OverflowPingPong from "./OverflowPingPong";
import {
  AppleMusicAlbumIcon,
  AppleMusicArtistIcon,
  AppleMusicCalendarIcon,
  AppleMusicGenreIcon,
  AppleMusicLogoIcon,
  AppleMusicTracksIcon,
} from "./AppleMusicIcons";
import { WidgetRedirectIcon } from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function AppleMusicWidget({ widget }: { widget: WidgetItem }) {
  const effectiveType = appleMusicTypeFromWidgetType(widget.type);
  const cleanId = parseAppleMusicInput(widget.targetId || "").id;

  const { data: itemData, isLoading } = useAppleMusicItem(effectiveType, cleanId);

  const imageShape = widget.imageShape || "rounded";
  const showArtist =
    widget.appleMusicShowArtist !== undefined ? widget.appleMusicShowArtist : true;
  const showAlbum =
    widget.appleMusicShowAlbum !== undefined ? widget.appleMusicShowAlbum : true;
  const showReleaseYear =
    widget.appleMusicShowReleaseYear !== undefined
      ? widget.appleMusicShowReleaseYear
      : true;
  const showTrackCount =
    widget.appleMusicShowTrackCount !== undefined
      ? widget.appleMusicShowTrackCount
      : true;
  const showGenre =
    widget.appleMusicShowGenre !== undefined ? widget.appleMusicShowGenre : true;
  const showBackground =
    widget.appleMusicShowBackground !== undefined
      ? widget.appleMusicShowBackground
      : false;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  if (isLoading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!itemData) {
    return (
      <WidgetUnavailable
        imageShape={imageShape}
        label={`Apple Music ${effectiveType}`}
        description="Check the link or try another release"
      />
    );
  }

  const imageSrc = itemData.imageUrl
    ? `/api/widgets/apple-music/image?url=${encodeURIComponent(itemData.imageUrl)}`
    : null;

  const bgSrc = showBackground ? imageSrc : null;

  const renderParts = (parts: React.ReactNode[]) => {
    if (parts.length === 0) {
      return (
        <span className="text-white/50 text-[12.5px] font-normal leading-tight">
          {itemData.subtitle || `Apple Music ${effectiveType}`}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight whitespace-nowrap shrink-0">
        {parts.map((part, idx) => (
          <span key={idx} className="inline-flex items-center shrink-0">
            {part}
          </span>
        ))}
      </div>
    );
  };

  const renderSubtitle = () => {
    if (effectiveType === "track") {
      const parts: React.ReactNode[] = [];

      if (showArtist && itemData.artistName) {
        parts.push(
          <span key="artist" className="inline-flex items-center gap-1.5 text-white/85">
            <AppleMusicArtistIcon size={12} className="text-white/50" />
            <span>{itemData.artistName}</span>
          </span>
        );
      }

      if (showAlbum && itemData.albumName && itemData.albumName !== itemData.title) {
        parts.push(
          <span key="album" className="inline-flex items-center gap-1.5 text-white/85">
            <AppleMusicAlbumIcon size={12} className="text-white/50" />
            <span>{itemData.albumName}</span>
          </span>
        );
      }

      return renderParts(parts);
    }

    if (effectiveType === "album") {
      const parts: React.ReactNode[] = [];

      if (showArtist && itemData.artistName) {
        parts.push(
          <span key="artist" className="inline-flex items-center gap-1.5 text-white/85">
            <AppleMusicArtistIcon size={12} className="text-white/50" />
            <span>{itemData.artistName}</span>
          </span>
        );
      }

      if (showReleaseYear && itemData.releaseYear) {
        parts.push(
          <span key="year" className="inline-flex items-center gap-1.5 text-white/85">
            <AppleMusicCalendarIcon size={12} className="text-white/50" />
            <span>{itemData.releaseYear}</span>
          </span>
        );
      }

      if (showTrackCount && itemData.trackCount > 0) {
        parts.push(
          <span key="tracks" className="inline-flex items-center gap-1.5 text-white/85">
            <AppleMusicTracksIcon size={12} className="text-white/50" />
            <span>
              {itemData.trackCount} track{itemData.trackCount === 1 ? "" : "s"}
            </span>
          </span>
        );
      }

      return renderParts(parts);
    }

    const parts: React.ReactNode[] = [];

    if (showGenre && itemData.genre) {
      parts.push(
        <span key="genre" className="inline-flex items-center gap-1.5 text-white/85">
          <AppleMusicGenreIcon size={12} className="text-white/50" />
          <span>{itemData.genre}</span>
        </span>
      );
    }

    return renderParts(parts);
  };

  return (
    <a
      href={itemData.externalUrl}
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
            loading="lazy"
            src={bgSrc}
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
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              loading="lazy"
              src={imageSrc}
              alt={itemData.title}
              className="w-full h-full object-cover block"
            />
          ) : (
            <AppleMusicLogoIcon size={30} className="opacity-60" />
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden pr-6">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <OverflowPingPong
              pauseDuration={0.35}
              speed={26}
              deps={[itemData, itemData.title, effectiveType]}
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <AppleMusicLogoIcon size={14} className="w-3.5 h-3.5" />
                <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                  {itemData.title}
                </span>
              </div>
            </OverflowPingPong>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <OverflowPingPong
              pauseDuration={0.35}
              speed={26}
              deps={[
                itemData,
                effectiveType,
                showArtist,
                showAlbum,
                showReleaseYear,
                showTrackCount,
                showGenre,
              ]}
            >
              <div className="text-[12px] font-normal tracking-normal shrink-0">
                {renderSubtitle()}
              </div>
            </OverflowPingPong>
          </div>
        </div>
      </div>
    </a>
  );
}
