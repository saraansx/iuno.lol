"use client";

import { useSoundcloudTrack } from "@/lib/hooks/useSoundcloudTrack";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import SoundcloudTrackCard from "./SoundcloudTrackCard";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function SoundcloudTrackWidget({ widget }: { widget: WidgetItem }) {
  const { data: track, loading } = useSoundcloudTrack(widget.targetId);
  const imageShape = widget.imageShape || "rounded";

  if (loading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!track) {
    return (
      <WidgetUnavailable
        imageShape={imageShape}
        label="SoundCloud track"
        description="This track link may be invalid or unavailable"
      />
    );
  }

  return (
    <SoundcloudTrackCard
      track={track}
      options={{
        imageShape,
        showPlays: widget.soundcloudShowPlays ?? true,
        showLikes: widget.soundcloudShowLikes ?? true,
        showDuration: widget.soundcloudShowDuration ?? true,
        showVerifiedBadge: widget.soundcloudShowVerifiedBadge ?? true,
        showBackground: widget.soundcloudShowBackground ?? false,
        showViewButton: widget.showViewButton ?? true,
      }}
    />
  );
}
