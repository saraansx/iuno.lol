"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import AppleMusicToggleSetting from "./settings/AppleMusicToggleSetting";
import type { AppleMusicItemType } from "@/lib/apple-music";

interface AppleMusicCustomizationProps {
  activeType: AppleMusicItemType;
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showArtist: boolean;
  onShowArtistChange: (val: boolean) => void;
  showAlbum: boolean;
  onShowAlbumChange: (val: boolean) => void;
  showReleaseYear: boolean;
  onShowReleaseYearChange: (val: boolean) => void;
  showTrackCount: boolean;
  onShowTrackCountChange: (val: boolean) => void;
  showGenre: boolean;
  onShowGenreChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function AppleMusicCustomization({
  activeType,
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showArtist,
  onShowArtistChange,
  showAlbum,
  onShowAlbumChange,
  showReleaseYear,
  onShowReleaseYearChange,
  showTrackCount,
  onShowTrackCountChange,
  showGenre,
  onShowGenreChange,
  showBackground,
  onShowBackgroundChange,
  showViewButton,
  onShowViewButtonChange,
}: AppleMusicCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Apple Music Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and the metadata shown on the card.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        {activeType !== "artist" && (
          <AppleMusicToggleSetting
            label="Show artist"
            description="Display the artist name on the card."
            checked={showArtist}
            onChange={onShowArtistChange}
          />
        )}

        {activeType === "track" && (
          <AppleMusicToggleSetting
            label="Show album"
            description="Display the album this track belongs to."
            checked={showAlbum}
            onChange={onShowAlbumChange}
          />
        )}

        {activeType === "album" && (
          <>
            <AppleMusicToggleSetting
              label="Show release year"
              description="Display the year the album was released."
              checked={showReleaseYear}
              onChange={onShowReleaseYearChange}
            />

            <AppleMusicToggleSetting
              label="Show track count"
              description="Display how many tracks the album has."
              checked={showTrackCount}
              onChange={onShowTrackCountChange}
            />
          </>
        )}

        {activeType === "artist" && (
          <AppleMusicToggleSetting
            label="Show genre"
            description="Display the artist's primary genre."
            checked={showGenre}
            onChange={onShowGenreChange}
          />
        )}

        <AppleMusicToggleSetting
          label="Background image"
          description="Use the artwork as a blurred background behind the card."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />

        <AppleMusicToggleSetting
          label="Show redirect button"
          description="Display a top-right direct link button opening Apple Music."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
