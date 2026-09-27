// Shared image-host limits and helpers used by BOTH the upload UI and the
// server upload route, so client-side checks and server-side enforcement agree
// on what's allowed. The server is always authoritative — the client copies
// exist only for instant feedback.

export const IMAGE_HOST_MAX_FILE_MB = 200;
export const IMAGE_HOST_MAX_FILE_BYTES = IMAGE_HOST_MAX_FILE_MB * 1024 * 1024;
export const IMAGE_HOST_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB per user

export type ImageHostKind = "image" | "video";

/** Map a MIME type to the kind we store, or null for anything unsupported. */
export function imageHostKind(mime: string): ImageHostKind | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return null;
}
