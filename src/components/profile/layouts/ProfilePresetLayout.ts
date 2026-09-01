
export type ProfilePresetId = "split" | "floating" | "modern" | "classic";

export const DEFAULT_PRESET: ProfilePresetId = "modern";

export interface ProfilePresetLayout {
  badgePlacement: "card" | "page";
}

const CLASSIC: ProfilePresetLayout = { badgePlacement: "card" };

const PRESET_LAYOUTS: Record<ProfilePresetId, ProfilePresetLayout> = {
  classic: CLASSIC,
  split: CLASSIC,
  modern: CLASSIC,
  floating: { badgePlacement: "page" },
};

export function getPresetLayout(preset: string | undefined): ProfilePresetLayout {
  return PRESET_LAYOUTS[preset as ProfilePresetId] ?? CLASSIC;
}

export const BADGE_CLASSES: Record<"card" | "cardRight" | "page" | "pageRight", string> = {
  card: "absolute bottom-3.5 left-4.5 flex items-center gap-2 z-[70] select-none",
  cardRight: "absolute bottom-3.5 right-4.5 flex items-center gap-2 z-[70] select-none",
  page: "absolute bottom-4 left-5 flex items-center gap-2 z-[70] select-none",
  pageRight: "absolute bottom-4 right-5 flex items-center gap-2 z-[70] select-none",
};

export type DetailPlacement =
  | "top"
  | "beside"
  | "bottom-profile"
  | "bottom-page"
  | "hidden";

export const DETAIL_PLACEMENTS: DetailPlacement[] = [
  "top",
  "beside",
  "bottom-profile",
  "bottom-page",
  "hidden",
];

export type DetailKey =
  | "joinDate"
  | "location"
  | "occupation"
  | "uid"
  | "views"
  | "feedback";

export function normalizePlacement(
  value: string | null | undefined,
  fallback: DetailPlacement
): DetailPlacement {
  return DETAIL_PLACEMENTS.includes(value as DetailPlacement)
    ? (value as DetailPlacement)
    : fallback;
}

export type DetailDefaults = Record<DetailKey, DetailPlacement>;

export const CLASSIC_DETAIL_DEFAULTS: DetailDefaults = {
  joinDate: "hidden",
  location: "beside",
  occupation: "beside",
  uid: "hidden",
  views: "bottom-page",
  feedback: "bottom-page",
};

const PRESET_DETAIL_DEFAULTS: Record<ProfilePresetId, DetailDefaults> = {
  classic: CLASSIC_DETAIL_DEFAULTS,
  split: {
    joinDate: "hidden",
    location: "beside",
    occupation: "beside",
    uid: "hidden",
    views: "bottom-profile",
    feedback: "bottom-profile",
  },
  modern: {
    joinDate: "hidden",
    location: "bottom-profile",
    occupation: "bottom-profile",
    uid: "hidden",
    views: "bottom-profile",
    feedback: "bottom-profile",
  },
  floating: {
    joinDate: "hidden",
    location: "beside",
    occupation: "beside",
    uid: "hidden",
    views: "bottom-page",
    feedback: "bottom-page",
  },
};

export function getDetailDefaults(preset: string | undefined): DetailDefaults {
  return PRESET_DETAIL_DEFAULTS[preset as ProfilePresetId] ?? PRESET_DETAIL_DEFAULTS[DEFAULT_PRESET];
}

export const DEFAULT_DETAILS = PRESET_DETAIL_DEFAULTS[DEFAULT_PRESET];

export type ContentAlignment = "left" | "center";

export type AvatarPlacement = "top" | "left" | "right" | "floating";

const CONTENT_ALIGNMENTS: ContentAlignment[] = ["left", "center"];
const AVATAR_PLACEMENTS: AvatarPlacement[] = ["top", "left", "right", "floating"];

export function normalizeAlignment(
  value: string | null | undefined,
  fallback: ContentAlignment = "left"
): ContentAlignment {
  return CONTENT_ALIGNMENTS.includes(value as ContentAlignment)
    ? (value as ContentAlignment)
    : fallback;
}

export function normalizeAvatarPlacement(
  value: string | null | undefined,
  fallback: AvatarPlacement = "left"
): AvatarPlacement {
  return AVATAR_PLACEMENTS.includes(value as AvatarPlacement)
    ? (value as AvatarPlacement)
    : fallback;
}

export const PRESET_FRAME_DEFAULTS: Record<
  ProfilePresetId,
  {
    contentAlignment: ContentAlignment;
    avatarPlacement: AvatarPlacement;
    contentWidth: number;
    wrapInCard: boolean;
  }
> = {
  classic: { contentAlignment: "center", avatarPlacement: "top", contentWidth: 500, wrapInCard: false },
  split: { contentAlignment: "left", avatarPlacement: "right", contentWidth: 700, wrapInCard: true },
  modern: { contentAlignment: "left", avatarPlacement: "left", contentWidth: 700, wrapInCard: true },
  floating: { contentAlignment: "center", avatarPlacement: "floating", contentWidth: 500, wrapInCard: true },
};

export function getFrameDefaults(preset: string | undefined) {
  return PRESET_FRAME_DEFAULTS[preset as ProfilePresetId] ?? PRESET_FRAME_DEFAULTS[DEFAULT_PRESET];
}

export const DEFAULT_FRAME = PRESET_FRAME_DEFAULTS[DEFAULT_PRESET];
