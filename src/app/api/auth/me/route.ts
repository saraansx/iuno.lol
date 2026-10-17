import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    return NextResponse.json(
      { authenticated },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
