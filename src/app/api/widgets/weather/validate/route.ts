import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { cleanWeatherLocation, isValidWeatherLocation } from "@/lib/weather";
import { fetchWeatherData } from "../current/[location]/route";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();
    const cleanLocation = cleanWeatherLocation(username);

    if (!isValidWeatherLocation(cleanLocation)) {
      return NextResponse.json({
        ok: false,
        error:
          "Invalid location (a city name, optionally with state and country, or 'lat,lon' coordinates)",
      });
    }

    const data = await fetchWeatherData(cleanLocation);
    if (!data) {
      return NextResponse.json({
        ok: false,
        error: `Could not find weather for "${cleanLocation}".`,
      });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[Weather Validation Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
