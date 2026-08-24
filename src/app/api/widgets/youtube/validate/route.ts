import { NextRequest, NextResponse } from "next/server";
import { cleanYouTubeInput } from "@/lib/youtube";
import { fetchYouTubeData } from "../channel/[input]/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawInput = body?.input;

    if (!rawInput || typeof rawInput !== "string") {
      return NextResponse.json(
        { valid: false, error: "Channel is required" },
        { status: 400 }
      );
    }

    const cleanInput = cleanYouTubeInput(rawInput);
    if (
      !cleanInput ||
      !/^(UC[\w-]{22}|@?[a-zA-Z0-9_.-]{3,30})$/.test(cleanInput)
    ) {
      return NextResponse.json(
        { valid: false, error: "Invalid YouTube channel format" },
        { status: 400 }
      );
    }

    const data = await fetchYouTubeData(cleanInput);
    if (!data) {
      return NextResponse.json(
        { valid: false, error: "YouTube channel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      data,
    });
  } catch (err) {
    console.error("[YouTube Validate Error]", err);
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}
