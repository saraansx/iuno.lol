"use client";

import { useSoundcloudArtist } from "@/lib/hooks/useSoundcloudArtist";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { cleanSoundcloudHandle, formatSoundcloudNumber } from "@/lib/soundcloud";
import OverflowPingPong from "./OverflowPingPong";
import {
  SoundcloudFollowersIcon,
  SoundcloudLogoIcon,
  SoundcloudTrackIcon,
  SoundcloudVerifiedIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function SoundcloudWidget({ widget }: { widget: WidgetItem }) {
  const cleanHandle = cleanSoundcloudHandle(widget.targetId);
  const { data: artistData, loading } = useSoundcloudArtist(cleanHandle);

  const imageShape = widget.imageShape || "rounded";
  const showFollowers =
    widget.soundcloudShowFollowers !== undefined ? widget.soundcloudShowFollowers : true;
  const showTracks =
    widget.soundcloudShowTracks !== undefined ? widget.soundcloudShowTracks : true;
  const showVerifiedBadge =
    widget.soundcloudShowVerifiedBadge !== undefined ? widget.soundcloudShowVerifiedBadge : true;
  const showBackground =
    widget.soundcloudShowBackground !== undefined ? widget.soundcloudShowBackground : false;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  const avatarUrl = artistData?.avatarUrl
    ? `/api/widgets/soundcloud/image?url=${encodeURIComponent(artistData.avatarUrl)}`
    : "";
  const backgroundUrl = artistData?.bannerUrl || artistData?.avatarUrl || "";
  const bgSrc = showBackground && backgroundUrl
    ? `/api/widgets/soundcloud/image?url=${encodeURIComponent(backgroundUrl)}`
    : null;

  if (loading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!artistData) {
    return (
      <WidgetUnavailable
        imageShape={imageShape}
        label="SoundCloud artist"
        description="This artist handle may be invalid or unavailable"
      />
    );
  }

  const profileUrl = artistData.url || `https://soundcloud.com/${encodeURIComponent(cleanHandle)}`;
  const displayName = artistData.username || cleanHandle;

  return (
    <a
      href={profileUrl}
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
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" src={avatarUrl} alt="" className="w-full h-full object-cover block" />
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
              {showVerifiedBadge && artistData.isVerified && (
                <SoundcloudVerifiedIcon size={15} className="shrink-0" />
              )}
              <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-0.5">
                @{artistData.handle || cleanHandle}
              </span>
            </div>
          </OverflowPingPong>

          <OverflowPingPong deps={[artistData, showFollowers, showTracks]}>
            <div className="flex items-center gap-3 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
              {showFollowers && (
                <div className="flex items-center gap-1 shrink-0">
                  <SoundcloudFollowersIcon size={13} className="text-white/70" />
                  <span className="text-white/85">
                    {formatSoundcloudNumber(artistData.followerCount)}
                  </span>
                  <span className="text-white/40">followers</span>
                </div>
              )}
              {showTracks && (
                <div className="flex items-center gap-1 shrink-0">
                  <SoundcloudTrackIcon size={13} className="text-white/70" />
                  <span className="text-white/85">
                    {formatSoundcloudNumber(artistData.trackCount)}
                  </span>
                  <span className="text-white/40">tracks</span>
                </div>
              )}
            </div>
          </OverflowPingPong>
        </div>
      </div>
    </a>
  );
}
