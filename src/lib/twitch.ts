export interface TwitchChannelData {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  bannerImageUrl: string | null;
  isPartner: boolean;
  followersCount: number;
  isLive: boolean;
  streamTitle: string | null;
  gameName: string | null;
  viewersCount: number | null;
}

export function formatNumber(num: number): string {
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
