export const CURSOR_PX = 32;

/**
 * A cursor image renders at its native pixel size and CSS cannot scale it, so an
 * ordinary upload would cover half the screen. Redraw it at cursor scale instead
 * of rejecting the file. Returns null when the image is already small enough.
 */
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
  if (longest <= CURSOR_PX) return null;

  const scale = CURSOR_PX / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) return null;

  return {
    url: URL.createObjectURL(blob),
    file: new File([blob], "cursor.png", { type: "image/png" }),
  };
}
