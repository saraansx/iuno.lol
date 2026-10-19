export type AppleMusicItemType = "track" | "album" | "artist";

export interface AppleMusicItemData {
  type: AppleMusicItemType;
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  externalUrl: string;
  artistName: string;
  albumName: string | null;
  trackCount: number;
  trackNumber: number | null;
  releaseYear: string | null;
  genre: string | null;
}

export interface ParsedAppleMusicInput {
  type: AppleMusicItemType | null;
  id: string;
}

const BARE_ID_RE = /^\d{3,20}$/;
const ID_PATH_RE = /\/(\d{3,20})(?=[/?#]|$)/g;
const TYPE_RE = /music\.apple\.com\/(?:[a-z]{2}\/)?(album|song|artist)\//i;

export function isValidAppleMusicId(input: string): boolean {
  return BARE_ID_RE.test(input);
}

export function parseAppleMusicInput(raw: string): ParsedAppleMusicInput {
  const value = (raw || "").trim();
  if (!value) return { type: null, id: "" };

  if (BARE_ID_RE.test(value)) return { type: null, id: value };
  if (/^id\d{3,20}$/i.test(value)) return { type: null, id: value.slice(2) };

  const trackParam = /[?&]i=(\d{3,20})/.exec(value);
  if (trackParam) return { type: "track", id: trackParam[1] };

  const typeMatch = TYPE_RE.exec(value);
  const type: AppleMusicItemType | null = typeMatch
    ? typeMatch[1].toLowerCase() === "song"
      ? "track"
      : (typeMatch[1].toLowerCase() as AppleMusicItemType)
    : null;

  const matches = Array.from(value.matchAll(ID_PATH_RE));
  const id = matches.length > 0 ? matches[matches.length - 1][1] : "";

  return { type, id };
}

export function cleanAppleMusicInput(raw: string): string {
  return parseAppleMusicInput(raw).id;
}

export function appleMusicTypeFromWidgetType(
  widgetType: string | undefined | null
): AppleMusicItemType {
  if (widgetType === "apple-music-album") return "album";
  if (widgetType === "apple-music-artist") return "artist";
  return "track";
}

export function appleMusicWidgetTypeFromItemType(type: AppleMusicItemType): string {
  return `apple-music-${type}`;
}
