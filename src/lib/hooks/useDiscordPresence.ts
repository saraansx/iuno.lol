"use client";

import { cachedFetch } from "@/lib/fetch-cache";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

interface DiscordPresenceData {
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

export function useDiscordPresence(id: string, poll = true) {
  const [data, setData] = useState<DiscordPresenceData | null>(null);
  const [loading, setLoading] = useState(true);

  const isValidId = /^\d{17,20}$/.test(id);

  const { value: fetchId, isPending } = useDebouncedValue(isValidId ? id : "");

  useEffect(() => {
    if (!fetchId) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let isFetching = false;

    setData(null);
    setLoading(true);

    const fetchPresence = async () => {
      if (isFetching || !isMounted) return;
      if (document.hidden) return;

      isFetching = true;

      try {
        const res = await cachedFetch(`/api/widgets/discord/presence/${fetchId}`, {
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
      } finally {
        isFetching = false;
        if (isMounted) setLoading(false);
      }
    };

    fetchPresence();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPresence();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = poll ? setInterval(fetchPresence, 5000) : undefined;

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchId, poll]);

  return {
    data: isPending ? null : data,
    loading: isPending || loading,
    isValidId,
  };
}
