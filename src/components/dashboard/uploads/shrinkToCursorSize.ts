import { CURSOR_PX } from "@/lib/cursor";

export async function shrinkToCursorSize(
  objectUrl: string,
): Promise<{ url: string; file: File } | null> {
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const probe = new window.Image();
    probe.onload = () => resolve(probe);
    probe.onerror = () => resolve(null);
    probe.src = objectUrl;
  });

  if (!img) return null;

  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (!longest) return null;

  const scale = Math.min(1, CURSOR_PX / longest);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = CURSOR_PX;
  canvas.height = CURSOR_PX;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, (CURSOR_PX - width) / 2, (CURSOR_PX - height) / 2, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) return null;

  return {
    url: URL.createObjectURL(blob),
    file: new File([blob], "cursor.png", { type: "image/png" }),
  };
}
