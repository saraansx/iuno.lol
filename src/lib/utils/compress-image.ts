export const IMAGE_MAX_DIMENSIONS: Record<string, number> = {
  avatar: 512,
  banner: 1920,
  background: 1920,
  embed: 1200,
  favicon: 64,
  cursor: 64,
  default: 1920,
};

export function shouldCompress(file: File): boolean {
  if (!file.type.startsWith("image/")) return false;
  // Keep GIFs animated; compress everything else (png/jpeg/webp).
  if (file.type === "image/gif") return false;
  return true;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = url;
  });
}

/**
 * Downscale + re-encode uploads client-side so avatar/banner/background
 * files stay small (WebP with JPEG fallback). Returns the original file
 * when compression isn't needed or fails.
 */
export async function compressImageFile(
  file: File,
  assetType: string = "default",
  quality = 0.82,
): Promise<File> {
  if (!shouldCompress(file)) return file;

  const maxDim = IMAGE_MAX_DIMENSIONS[assetType] ?? IMAGE_MAX_DIMENSIONS.default;
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    if (!longest || longest <= maxDim) {
      // Still re-encode large PNGs to WebP even when no resize is needed.
      if (file.type === "image/png" && file.size > 300 * 1024) {
        // fall through to re-encode at natural size
      } else {
        return file;
      }
    }
    const scale = Math.min(1, maxDim / longest);
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const hasAlpha = file.type === "image/png" || file.type === "image/webp";
    const mime = hasAlpha ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, quality),
    );
    if (!blob) return file;
    // If encoding made it bigger (tiny images), keep the original.
    if (blob.size >= file.size) return file;
    const ext = mime === "image/webp" ? "webp" : "jpg";
    const base = file.name.replace(/\.[a-z0-9]+$/i, "") || "image";
    return new File([blob], `${base}.${ext}`, { type: mime });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
