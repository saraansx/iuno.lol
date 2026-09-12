import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Direct uploads are disabled. Use /api/upload." },
    { status: 410 }
  );
}
