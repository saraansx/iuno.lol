export interface GenshinPlayerData {
  uid: string;
  nickname: string;
  level: number; // Adventure Rank (AR)
  world_level: number;
  signature?: string | null;
  achievements: number;
  abyss_floor?: number | null;
  abyss_chamber?: number | null;
  region: string; // "NA" | "EU" | "ASIA" | "SAR" | "CN"
  avatar_url: string;
  namecard_url?: string | null;
  namecard_bg_url?: string | null;
}

export function getGenshinRegion(uid: string): string {
  const clean = uid.trim();
  if (!clean) return "ASIA";
  const first = clean[0];
  switch (first) {
    case "6":
      return "NA";
    case "7":
      return "EU";
    case "8":
      return "ASIA";
    case "9":
      return "SAR";
    case "1":
    case "2":
    case "5":
      return "CN";
    default:
      return "ASIA";
  }
}

export function buildEnkaUiUrl(assetName?: string | null): string | null {
  if (!assetName) return null;
  const clean = assetName.replace(/\.png$/i, "");
  return `https://enka.network/ui/${clean}.png`;
}
