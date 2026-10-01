import { NextResponse } from "next/server";
import { requireImageHostUser } from "@/lib/features/image-host/access";
import { CATBOX_BASE } from "@/lib/cdn";
import { getImageHostFileForUser } from "@/lib/features/image-host/db";

export const dynamic = "force-dynamic";

function attachmentHeader(name: string): string {
  const fallback = name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_") || "download";
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireImageHostUser();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const userId = auth.userId;

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const file = await getImageHostFileForUser(userId, id);
    const storageId = file?.storageId;
    if (!file || !storageId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const upstream = await fetch(`${CATBOX_BASE}${storageId}`, {
      headers: { "User-Agent": "iuno-cdn/1.0" },
      signal: AbortSignal.timeout(60000),
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "File unavailable" }, { status: 502 });
    }

    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": attachmentHeader(file.name || "download"),
      "Cache-Control": "private, no-store",
    });
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);

    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    console.error("[image-host] Download error:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}
