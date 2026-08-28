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
  initialFeedback?: 'like' | 'dislike' | null;
  accentColor?: string | null;
  /** Resolved CSS for the hover pills, from the Highlight font group. */
  tooltipTextStyle?: React.CSSProperties;
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
  initialFeedback = null,
  accentColor,
  tooltipTextStyle,
  className = "absolute bottom-3 right-4 flex items-center gap-2.5 z-20",
  showLikesTooltip = true,
  showDislikesTooltip = true,
  showFeedbackPublicly = true,
}: FeedbackButtonsProps) {
  const isDisabled = viewerId === -1;
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [dislikesCount, setDislikesCount] = useState(initialDislikes);
  const [hasLiked, setHasLiked] = useState(initialFeedback === "like");
  const [hasDisliked, setHasDisliked] = useState(initialFeedback === "dislike");
  const [pending, setPending] = useState(false);

  // Server is the source of truth for whether this viewer already voted, so a
  // new browser or device shows the correct state instead of an empty heart.
  useEffect(() => {
    setHasLiked(initialFeedback === "like");
    setHasDisliked(initialFeedback === "dislike");
  }, [initialFeedback]);

  useEffect(() => {
    setLikesCount(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    setDislikesCount(initialDislikes);
  }, [initialDislikes]);

  const handleVote = async (intent: "like" | "dislike") => {
    if (isDisabled || pending) {
      return;
    }
    if (viewerId === null || viewerId === undefined) {
      toast.error("Please sign in to like or dislike profiles.");
      return;
    }

    // Snapshot so a rejected action can be rolled back.
    const prev = {
      likes: likesCount,
      dislikes: dislikesCount,
      liked: hasLiked,
      disliked: hasDisliked,
    };

    let action: "like" | "dislike" | "unlike" | "undislike";

    if (intent === "like") {
      if (hasLiked) {
        action = "unlike";
        setLikesCount((v) => Math.max(0, v - 1));
        setHasLiked(false);
      } else {
        action = "like";
        setLikesCount((v) => v + 1);
        setHasLiked(true);
        // A single "like" call also clears an existing dislike server-side.
        if (hasDisliked) {
          setDislikesCount((v) => Math.max(0, v - 1));
          setHasDisliked(false);
        }
      }
    } else {
      if (hasDisliked) {
        action = "undislike";
        setDislikesCount((v) => Math.max(0, v - 1));
        setHasDisliked(false);
      } else {
        action = "dislike";
        setDislikesCount((v) => v + 1);
        setHasDisliked(true);
        if (hasLiked) {
          setLikesCount((v) => Math.max(0, v - 1));
          setHasLiked(false);
        }
      }
    }

    setPending(true);
    const res = await submitFeedbackAction(profileId, action);
    setPending(false);

    if (!res?.success) {
      setLikesCount(prev.likes);
      setDislikesCount(prev.dislikes);
      setHasLiked(prev.liked);
      setHasDisliked(prev.disliked);
      toast.error(res?.error || "Something went wrong. Please try again.");
    }
  };

  const handleLike = () => handleVote("like");
  const handleDislike = () => handleVote("dislike");

  return (
    <div
      className={className}
      style={
        {
          "--feedback-color": accentColor || "#5b6cf5",
          "--feedback-color-muted": accentColor
            ? hexToRgba(accentColor, 60)
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
            <div className="bg-[#0f0f12]/75 border border-white/10 text-white px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-xl" style={tooltipTextStyle}>
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
            <div className="bg-[#0f0f12]/75 border border-white/10 text-white px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-xl" style={tooltipTextStyle}>
              {showFeedbackPublicly ? `Dislike (${dislikesCount})` : "Dislike"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
