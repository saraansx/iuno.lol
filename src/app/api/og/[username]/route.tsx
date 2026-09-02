import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { users, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isVideoUrl } from "@/lib/utils/media";
import { OG_WIDTH, OG_HEIGHT, isAllowedOgImage } from "@/lib/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username: rawUsername } = await params;
  const username = rawUsername.toLowerCase().trim();

  if (!username || !/^[a-z0-9_.]{1,32}$/.test(username)) {
    return new Response(null, { status: 400 });
  }

  const rows = await db
    .select({
      username: users.username,
      displayName: userSettings.displayName,
      avatarUrl: userSettings.avatarUrl,
      bannerBackgroundUrl: userSettings.bannerBackgroundUrl,
    })
    .from(users)
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(eq(users.username, username))
    .limit(1);

  if (rows.length === 0) {
    return new Response(null, { status: 404 });
  }

  const row = rows[0];
  const name = (row.displayName?.trim() || row.username).slice(0, 32);
  
  async function localAsset(file: string): Promise<string | null> {
    try {
      const bytes = await readFile(join(process.cwd(), "public", file));
      return `data:image/png;base64,${bytes.toString("base64")}`;
    } catch {
      return null;
    }
  }

  const ownBackground =
    row.bannerBackgroundUrl &&
    !isVideoUrl(row.bannerBackgroundUrl) &&
    isAllowedOgImage(row.bannerBackgroundUrl)
      ? row.bannerBackgroundUrl
      : null;
  const ownAvatar =
    row.avatarUrl && !isVideoUrl(row.avatarUrl) && isAllowedOgImage(row.avatarUrl)
      ? row.avatarUrl
      : null;

  const [background, avatar] = await Promise.all([
    ownBackground ?? localAsset("og banner.png"),
    ownAvatar ?? localAsset("Og.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
        }}
      >
        {background ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            width={OG_WIDTH}
            height={OG_HEIGHT}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: OG_WIDTH,
              height: OG_HEIGHT,
              objectFit: "cover",
            }}
          />
        ) : null}

        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: OG_WIDTH,
            height: OG_HEIGHT,
            backgroundColor: "rgba(5,5,5,0.7)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              width={200}
              height={200}
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: "#161616",
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontSize: 64,
              color: "#ffffff",
            }}
          >
            {name}
          </div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable",
      },
    }
  );
}
