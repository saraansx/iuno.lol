"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import ImageShapeSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/ImageShapeSetting";
import SpotifyToggleSetting from "./settings/SpotifyToggleSetting";

interface SpotifyCustomizationProps {
  type: "track" | "album" | "playlist" | "artist" | "user";
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  imageShape: "circle" | "rounded" | "square";
  onImageShapeChange: (val: "circle" | "rounded" | "square") => void;
  showArtist: boolean;
  onShowArtistChange: (val: boolean) => void;
  showAlbum: boolean;
  onShowAlbumChange: (val: boolean) => void;
  showTrackCount: boolean;
  onShowTrackCountChange: (val: boolean) => void;
  showReleaseYear: boolean;
  onShowReleaseYearChange: (val: boolean) => void;
  showOwner: boolean;
  onShowOwnerChange: (val: boolean) => void;
  showFollowers: boolean;
  onShowFollowersChange: (val: boolean) => void;
  showMonthlyListeners: boolean;
  onShowMonthlyListenersChange: (val: boolean) => void;
  showBackground: boolean;
  onShowBackgroundChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function SpotifyCustomization({
  type,
  placement,
  onPlacementChange,
  imageShape,
  onImageShapeChange,
  showArtist,
  onShowArtistChange,
  showAlbum,
  onShowAlbumChange,
  showTrackCount,
  onShowTrackCountChange,
  showReleaseYear,
  onShowReleaseYearChange,
  showOwner,
  onShowOwnerChange,
  showFollowers,
  onShowFollowersChange,
  showMonthlyListeners,
  onShowMonthlyListenersChange,
  showBackground,
  onShowBackgroundChange,
  showViewButton,
  onShowViewButtonChange,
}: SpotifyCustomizationProps) {
  const isTrack = type === "track";
  const isAlbum = type === "album";
  const isPlaylist = type === "playlist";
  const isArtist = type === "artist";

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Spotify Settings
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Customize the appearance and displayed Spotify information.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />

        <ImageShapeSetting value={imageShape} onChange={onImageShapeChange} />

        {isTrack && (
          <SpotifyToggleSetting
            label="Show artist"
            description="Display the contributing artist names below track title."
            checked={showArtist}
            onChange={onShowArtistChange}
          />
        )}

        {isTrack && (
          <SpotifyToggleSetting
            label="Show album"
            description="Display the album or single collection name."
            checked={showAlbum}
            onChange={onShowAlbumChange}
          />
        )}

        {isAlbum && (
          <SpotifyToggleSetting
            label="Show artist"
            description="Display the album artist name."
            checked={showArtist}
            onChange={onShowArtistChange}
          />
        )}

        {isAlbum && (
          <SpotifyToggleSetting
            label="Show track count"
            description="Display total number of songs in this album."
            checked={showTrackCount}
            onChange={onShowTrackCountChange}
          />
        )}

        {isAlbum && (
          <SpotifyToggleSetting
            label="Show release year"
            description="Display the year this album was released."
            checked={showReleaseYear}
            onChange={onShowReleaseYearChange}
          />
        )}

        {isPlaylist && (
          <SpotifyToggleSetting
            label="Show owner"
            description="Display the creator or curator of this playlist."
            checked={showOwner}
            onChange={onShowOwnerChange}
          />
        )}

        {isPlaylist && (
          <SpotifyToggleSetting
            label="Show track count"
            description="Display total number of songs in this playlist."
            checked={showTrackCount}
            onChange={onShowTrackCountChange}
          />
        )}

        {isArtist && (
          <SpotifyToggleSetting
            label="Show followers"
            description="Display total Spotify follower count."
            checked={showFollowers}
            onChange={onShowFollowersChange}
          />
        )}

        {isArtist && (
          <SpotifyToggleSetting
            label="Show monthly listeners"
            description="Display total monthly listeners for this artist."
            checked={showMonthlyListeners}
            onChange={onShowMonthlyListenersChange}
          />
        )}

        <SpotifyToggleSetting
          label="Background image"
          description="Display a subtle blurred artwork backdrop in the widget card."
          checked={showBackground}
          onChange={onShowBackgroundChange}
        />

        <SpotifyToggleSetting
          label="Show redirect button"
          description="Display a top-right direct link button opening Spotify."
          checked={showViewButton}
          onChange={onShowViewButtonChange}
        />
      </div>
    </div>
  );
}
