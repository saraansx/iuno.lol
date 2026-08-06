"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { submitFeedbackAction } from "@/actions/feedback";

// helper for hexToRgba
function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}, ${opacity / 100})`
    : `rgba(255, 255, 255, ${opacity / 100})`;
}

interface FeedbackButtonsProps {
  profileId: number;
  viewerId: number | null | undefined;
  initialLikes: number;
  initialDislikes: number;
  highlightColor?: string | null;
  className?: string;
  showLikesTooltip?: boolean;
  showDislikesTooltip?: boolean;
  showFeedbackPublicly?: boolean;
}

export default function FeedbackButtons({
  profileId,
  viewerId,
  initialLikes,
  initialDislikes,
  highlightColor,
  className = "absolute bottom-3 right-4 flex items-center gap-2.5 z-20",
  showLikesTooltip = true,
  showDislikesTooltip = true,
  showFeedbackPublicly = true,
}: FeedbackButtonsProps) {
  const isDisabled = viewerId === -1;
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [dislikesCount, setDislikesCount] = useState(initialDislikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && profileId) {
      const stored = localStorage.getItem(`iuno:feedback:${profileId}`);
      if (stored === "like") {
        setHasLiked(true);
      } else if (stored === "dislike") {
        setHasDisliked(true);
      }
    }
  }, [profileId]);

  useEffect(() => {
    setLikesCount(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    setDislikesCount(initialDislikes);
  }, [initialDislikes]);

  const handleLike = async () => {
    if (viewerId === -1) {
      return;
    }
    if (viewerId === null || viewerId === undefined) {
      toast.error("Please sign in to like or dislike profiles.");
      return;
    }
    if (hasLiked) {
      setLikesCount((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
      localStorage.removeItem(`iuno:feedback:${profileId}`);
      await submitFeedbackAction(profileId, "unlike");
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
      localStorage.setItem(`iuno:feedback:${profileId}`, "like");
      await submitFeedbackAction(profileId, "like");
      if (hasDisliked) {
        setDislikesCount((prev) => Math.max(0, prev - 1));
        setHasDisliked(false);
        await submitFeedbackAction(profileId, "undislike");
      }
    }
  };

  const handleDislike = async () => {
    if (viewerId === -1) {
      return;
    }
    if (viewerId === null || viewerId === undefined) {
      toast.error("Please sign in to like or dislike profiles.");
      return;
    }
    if (hasDisliked) {
      setDislikesCount((prev) => Math.max(0, prev - 1));
      setHasDisliked(false);
      localStorage.removeItem(`iuno:feedback:${profileId}`);
      await submitFeedbackAction(profileId, "undislike");
    } else {
      setDislikesCount((prev) => prev + 1);
      setHasDisliked(true);
      localStorage.setItem(`iuno:feedback:${profileId}`, "dislike");
      await submitFeedbackAction(profileId, "dislike");
      if (hasLiked) {
        setLikesCount((prev) => Math.max(0, prev - 1));
        setHasLiked(false);
        await submitFeedbackAction(profileId, "unlike");
      }
    }
  };

  return (
    <div
      className={className}
      style={
        {
          "--feedback-color": highlightColor || "#ffffff",
          "--feedback-color-muted": highlightColor
            ? hexToRgba(highlightColor, 60)
            : "rgba(255, 255, 255, 0.6)",
        } as React.CSSProperties
      }
    >
      {/* Like Button */}
      <div className="relative group/tooltip flex justify-center">
        <button
          onClick={isDisabled ? undefined : handleLike}
          disabled={isDisabled}
          className={`transition-all duration-200 focus:outline-none drop-shadow-md ${isDisabled ? 'cursor-default' : 'hover:scale-110 active:scale-95 cursor-pointer'} ${
            hasLiked
              ? "text-[color:var(--feedback-color)]"
              : "text-[color:var(--feedback-color-muted)] hover:text-[color:var(--feedback-color)]"
          }`}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={hasLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={hasLiked ? "1" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
        </button>
        {/* Tooltip */}
        {showLikesTooltip && (
          <div className="absolute bottom-full mb-2 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover/tooltip:translate-y-0">
            <div className="bg-[#0f0f12]/75 border border-white/10 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-xl">
              {showFeedbackPublicly ? `Like (${likesCount})` : "Like"}
            </div>
          </div>
        )}
      </div>

      {/* Dislike Button */}
      <div className="relative group/tooltip flex justify-center">
        <button
          onClick={isDisabled ? undefined : handleDislike}
          disabled={isDisabled}
          className={`transition-all duration-200 focus:outline-none drop-shadow-md ${isDisabled ? 'cursor-default' : 'hover:scale-110 active:scale-95 cursor-pointer'} ${
            hasDisliked
              ? "text-[color:var(--feedback-color)]"
              : "text-[color:var(--feedback-color-muted)] hover:text-[color:var(--feedback-color)]"
          }`}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={hasDisliked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={hasDisliked ? "1" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm9-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
          </svg>
        </button>
        {/* Tooltip */}
        {showDislikesTooltip && (
          <div className="absolute bottom-full mb-2 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-200 z-30 transform translate-y-1 group-hover/tooltip:translate-y-0">
            <div className="bg-[#0f0f12]/75 border border-white/10 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-xl">
              {showFeedbackPublicly ? `Dislike (${dislikesCount})` : "Dislike"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
