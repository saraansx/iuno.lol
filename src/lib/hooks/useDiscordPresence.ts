"use client";

import { useEffect, useState } from "react";

export interface DiscordPresenceData {
  in_server: boolean;
  user: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    avatar_decoration_data?: {
      asset: string;
      sku_id?: string;
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
    album?: string | null;
    album_art_url?: string | null;
  } | null;
  primary_activity?: {
    name: string;
    type: number;
    state?: string | null;
    details?: string | null;
    large_image_url?: string | null;
    large_text?: string | null;
    small_image_url?: string | null;
    small_text?: string | null;
  } | null;
}

/**
 * Discord presence for a snowflake ID.
 * Polls status, activity, and Spotify in real-time every 2 seconds when tab is active.
 * Badges and heavy profile data are cached server-side (48h) and preserve state across polls.
 */
export function useDiscordPresence(id: string) {
  const [data, setData] = useState<DiscordPresenceData | null>(null);
  const [loading, setLoading] = useState(false);

  const isValidId = /^\d{17,20}$/.test(id);

  useEffect(() => {
    if (!isValidId) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let isFetching = false;

    const fetchPresence = async (isInitial = false) => {
      if (isFetching || !isMounted) return;
      if (document.hidden) return; // Pause polling when user switches tabs to save CPU/Network

      isFetching = true;
      if (isInitial) setLoading(true);

      try {
        const res = await fetch(`/api/widgets/discord/presence/${id}`, {
          cache: "no-store",
        });

        if (res.ok && isMounted) {
          const json = (await res.json()) as DiscordPresenceData;
          setData((prev) => {
            // Keep previous cached badges/user data if momentary payload drops
            if (prev?.user?.profile_badges?.length && (!json.user?.profile_badges || json.user.profile_badges.length === 0)) {
              if (json.user) json.user.profile_badges = prev.user.profile_badges;
            }
            return json;
          });
        }
      } catch {
        // Fetch error ignored during continuous polling
      } finally {
        isFetching = false;
        if (isInitial && isMounted) setLoading(false);
      }
    };

    // Initial immediate fetch
    fetchPresence(true);

    // Realtime polling interval: 2 seconds
    const interval = setInterval(() => {
      fetchPresence(false);
    }, 2000);

    // Resume immediately when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPresence(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, isValidId]);

  return { data, loading, isValidId };
}
