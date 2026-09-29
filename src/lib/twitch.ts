export interface TwitchChannelData {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  isPartner: boolean;
  followersCount: number;
  isLive: boolean;
  streamTitle: string | null;
  gameName: string | null;
  viewersCount: number | null;
}

export { formatNumber } from "@/lib/utils";
