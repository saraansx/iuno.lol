"use client";

import { useEffect, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

export interface DiscordPresenceData {
  in_server: boolean;
  user: {
    id: string;
    username: string;
    avatar?: string | null;
    avatar_decoration_data?: {
      asset: string;
    } | null;
    clan?: {
      tag?: string;
      badge?: string;
      identity_guild_id?: string;
    } | null;
    profile_badges?: Array<{
      id: string;
      description?: string;
      icon?: string;
    }>;
  } | null;
  status: "online" | "idle" | "dnd" | "offline";
  last_seen?: number | null;
  custom_status?: {
    text?: string | null;
    emoji?: {
      name?: string;
      id?: string;
      animated?: boolean;
    } | null;
  } | null;
  spotify?: {
    song: string;
    artist: string;
    album_art_url?: string | null;
  } | null;
  primary_activity?: {
    name: string;
    state?: string | null;
    details?: string | null;
    large_image_url?: string | null;
    small_image_url?: string | null;
  } | null;
}

/**
 * Discord presence for a snowflake ID.
 * Polls status, activity, and Spotify in real-time every 2 seconds when tab is active.
 * Badges and heavy profile data are cached server-side (48h) and preserve state across polls.
 */
export function useDiscordPresence(id: string, poll = true) {
  const [data, setData] = useState<DiscordPresenceData | null>(null);
  const [loading, setLoading] = useState(true);

  const isValidId = /^\d{17,20}$/.test(id);

  // Wait for typing to settle before opening a poll loop on a new ID. A partial
  // snowflake debounces to "" at once, so the preview clears immediately.
  const { value: fetchId, isPending } = useDebouncedValue(isValidId ? id : "");

  useEffect(() => {
    if (!fetchId) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let isFetching = false;

    // Drop the previous user's presence here rather than inside the fetch: the
    // fetch bails out while the tab is hidden, and the old presence must never
    // stay on screen under a different ID.
    setData(null);
    setLoading(true);

    const fetchPresence = async () => {
      if (isFetching || !isMounted) return;
      // Polling pauses while the tab is hidden to save CPU. The loading flag is
      // deliberately left set: the visibility listener below runs the fetch on
      // return, and resolving it here would leave no presence and no pending
      // request, which consumers read as a failed load rather than a wait.
      if (document.hidden) return;

      isFetching = true;

      try {
        const res = await fetch(`/api/widgets/discord/presence/${fetchId}`, {
          cache: "no-store",
        });

        if (res.ok && isMounted) {
          const json = (await res.json()) as DiscordPresenceData;
          setData((prev) => {
            if (prev?.user?.profile_badges?.length && (!json.user?.profile_badges || json.user.profile_badges.length === 0)) {
              if (json.user) json.user.profile_badges = prev.user.profile_badges;
            }
            return json;
          });
        }
      } catch {
        // Fetch error ignored
      } finally {
        isFetching = false;
        // Resolved on whichever attempt lands first, not only the initial one:
        // when the widget mounts hidden, that is the visibility-triggered fetch.
        // Already being false makes this a no-op, so polls cost no re-render.
        if (isMounted) setLoading(false);
      }
    };

    fetchPresence();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPresence();
      }
    };

    // Attached even with polling off: a widget that mounted in a hidden tab has
    // not fetched at all, and this is what gives it its first chance to.
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Realtime polling: 5 seconds interval
    const interval = poll ? setInterval(fetchPresence, 5000) : undefined;

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchId, poll]);

  // While the typed ID is ahead of the fetched one, report the loading state
  // instead of the presence the hook still holds.
  return {
    data: isPending ? null : data,
    loading: isPending || loading,
    isValidId,
  };
}
