
export const IMAGE_HOST_MAX_FILE_MB = 200;
export const IMAGE_HOST_MAX_FILE_BYTES = IMAGE_HOST_MAX_FILE_MB * 1024 * 1024;
export const IMAGE_HOST_QUOTA_BYTES = 1024 * 1024 * 1024;

export type ImageHostKind = "image" | "video";

export function imageHostKind(mime: string): ImageHostKind | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return null;
}
