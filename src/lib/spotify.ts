export type SpotifyItemType = "track" | "album" | "playlist" | "artist" | "user";

export interface SpotifyItemData {
  type: SpotifyItemType;
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string | null;
  externalUrl: string;
  artistName?: string | null;
  albumName?: string | null;
  trackCount?: number | null;
  releaseYear?: string | null;
  ownerName?: string | null;
  followersCount?: number | null;
  monthlyListeners?: number | null;
}

export function parseSpotifyIdentifier(input: string): {
  type: "track" | "album" | "playlist" | "artist" | "user" | null;
  id: string | null;
} {
  const clean = (input || "").trim();
  if (!clean) return { type: null, id: null };

  const userUrlMatch = clean.match(/https?:\/\/(?:open|play)\.spotify\.com\/(?:intl-[a-z]{2}\/)?user\/([a-zA-Z0-9_.-]+)/i);
  if (userUrlMatch) {
    return { type: "user", id: userUrlMatch[1] };
  }

  const uriMatch = clean.match(/^spotify:(track|album|playlist|artist|user):([a-zA-Z0-9_.-]+)$/i);
  if (uriMatch) {
    return {
      type: uriMatch[1].toLowerCase() as SpotifyItemType,
      id: uriMatch[2],
    };
  }

  const urlMatch = clean.match(/https?:\/\/(?:open|play)\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|artist|user)\/([a-zA-Z0-9_.-]+)/i);
  if (urlMatch) {
    return {
      type: urlMatch[1].toLowerCase() as SpotifyItemType,
      id: urlMatch[2],
    };
  }

  if (/^[a-zA-Z0-9_.-]{3,64}$/.test(clean)) {
    return { type: null, id: clean };
  }

  return { type: null, id: null };
}

export function formatSpotifyNumber(num: number): string {
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}

export const formatNumber = formatSpotifyNumber;
