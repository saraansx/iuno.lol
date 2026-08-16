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
 * Discord presence for a snowflake ID, fetched once when the ID mounts or changes.
 * Status / custom status / Spotify refresh on reload — deliberately not on a timer,
 * so each page view costs a single request instead of one every few seconds.
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

    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/widgets/discord/presence/${id}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = (await res.json()) as DiscordPresenceData;

        // If server couldn't get profile badges (datacenter IP block), fetch client-side directly
        if (json?.user && (!json.user.profile_badges || json.user.profile_badges.length === 0)) {
          try {
            const clientRes = await fetch(
              `https://discord.com/api/v9/users/${id}/profile?with_mutual_guilds=false&with_mutual_friends=false&with_mutual_friends_count=false`,
              {
                signal: controller.signal,
              }
            );
            if (clientRes.ok) {
              const clientProfile = await clientRes.json();
              if (clientProfile?.badges?.length) {
                json.user.profile_badges = clientProfile.badges;
              }
            }
          } catch {
            // Client fetch error ignored
          }
        }

        if (!cancelled) setData(json);
      } catch {
        // Aborted by unmount, or the request failed outright
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, isValidId]);

  return { data, loading, isValidId };
}
