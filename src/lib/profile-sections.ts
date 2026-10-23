export const SECTION_CATEGORIES = [
  { id: "bio", label: "Bio", description: "A short text for this section" },
  { id: "links", label: "Links", description: "Your big links with icons" },
  { id: "widgets", label: "Widgets", description: "Your widgets placed outside the card" },
  { id: "music", label: "Music", description: "Your music player" },
] as const;

export type SectionCategory = (typeof SECTION_CATEGORIES)[number]["id"];

export interface ProfileSection {
  id: string;
  title: string;
  description: string;
  bio: string;
  categories: SectionCategory[];
}

export const MAX_SECTION_CATEGORIES = 3;

const CATEGORY_IDS = SECTION_CATEGORIES.map((category) => category.id) as string[];

export function normalizeProfileSections(raw: unknown): ProfileSection[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const value = item as Record<string, unknown>;
      const categories = Array.isArray(value.categories)
        ? Array.from(
            new Set(
              value.categories.filter(
                (category): category is SectionCategory =>
                  typeof category === "string" && CATEGORY_IDS.includes(category)
              )
            )
          ).slice(0, MAX_SECTION_CATEGORIES)
        : [];

      return {
        id: typeof value.id === "string" && value.id ? value.id : `section-${Math.random().toString(36).slice(2, 10)}`,
        title: typeof value.title === "string" ? value.title.slice(0, 60) : "",
        description: typeof value.description === "string" ? value.description.slice(0, 160) : "",
        bio: typeof value.bio === "string" ? value.bio.slice(0, 500) : "",
        categories,
      } satisfies ProfileSection;
    })
    .filter((section): section is ProfileSection => Boolean(section && section.title.trim()))
    .slice(0, 12);
}

export function categoryLabels(categories: SectionCategory[]) {
  return categories
    .map((id) => SECTION_CATEGORIES.find((category) => category.id === id)?.label ?? id)
    .join(", ");
}
