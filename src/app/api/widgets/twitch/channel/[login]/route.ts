import { NextRequest, NextResponse } from "next/server";
import { type TwitchChannelData } from "@/lib/twitch";

const TWITCH_GQL_URL = "https://gql.twitch.tv/gql";
const TWITCH_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

interface GqlUserResponse {
  data?: {
    user?: {
      id?: string;
      login?: string;
      displayName?: string;
      profileImageURL?: string;
      bannerImageURL?: string | null;
      isPartner?: boolean;
      followers?: { totalCount?: number } | null;
      stream?: {
        id?: string;
        title?: string;
        type?: string;
        viewersCount?: number;
        game?: { name?: string } | null;
      } | null;
    } | null;
  };
}

export async function fetchTwitchChannelData(
  login: string
): Promise<TwitchChannelData | null> {
  const cleanLogin = (login || "").trim().toLowerCase();
  if (!/^[a-zA-Z0-9_]{3,25}$/.test(cleanLogin)) {
    return null;
  }

  const query = `
    query GetTwitchChannel($login: String!) {
      user(login: $login) {
        id
        login
        displayName
        profileImageURL(width: 300)
        bannerImageURL
        isPartner
        followers {
          totalCount
        }
        stream {
          id
          title
          type
          viewersCount
          game {
            name
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(TWITCH_GQL_URL, {
      method: "POST",
      headers: {
        "Client-Id": TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
        "User-Agent": "iuno-twitch-widget/1.0",
      },
      body: JSON.stringify({
        query,
        variables: { login: cleanLogin },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as GqlUserResponse;
    const user = json?.data?.user;
    if (!user || !user.id || !user.login) {
      return null;
    }

    const isLive = Boolean(user.stream && user.stream.type === "live");

    const channelData: TwitchChannelData = {
      id: user.id,
      login: user.login,
      displayName: user.displayName || user.login,
      profileImageUrl:
        user.profileImageURL ||
        "https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7ba-49d2-a43e-aa0174fb407a-profile_image-300x300.png",
      bannerImageUrl: user.bannerImageURL || null,
      isPartner: Boolean(user.isPartner),
      followersCount: Number(user.followers?.totalCount || 0),
      isLive,
      streamTitle: isLive ? user.stream?.title || null : null,
      gameName: isLive ? user.stream?.game?.name || null : null,
      viewersCount: isLive ? Number(user.stream?.viewersCount || 0) : null,
    };

    return channelData;
  } catch (err) {
    console.error("[Twitch GQL Fetch Error]", err);
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ login: string }> }
) {
  try {
    const { login } = await params;
    const cleanLogin = (login || "").trim().toLowerCase();

    if (!cleanLogin || !/^[a-zA-Z0-9_]{3,25}$/.test(cleanLogin)) {
      return NextResponse.json(
        { error: "Invalid Twitch username" },
        { status: 400 }
      );
    }

    const data = await fetchTwitchChannelData(cleanLogin);
    if (!data) {
      return NextResponse.json(
        { error: "Twitch channel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (err) {
    console.error("[Twitch Channel API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
