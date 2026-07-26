export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|mkv|avi|gifv)(?:\?|#|$)/i.test(url);
}

