
interface DetectedType {
  ext: string;
  mime: string;
}

export function detectImageOrVideo(buffer: Buffer): DetectedType | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { ext: "png", mime: "image/png" };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }

  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return { ext: "gif", mime: "image/gif" };
  }

  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }

  const hasFtyp = (offset: number) =>
    buffer.length > offset + 3 &&
    buffer[offset] === 0x66 &&
    buffer[offset + 1] === 0x74 &&
    buffer[offset + 2] === 0x79 &&
    buffer[offset + 3] === 0x70;

  const firstBoxSize = buffer.readUInt32BE(0);
  const dynamicOffset = firstBoxSize - 4;
  if (
    hasFtyp(4) ||
    hasFtyp(8) ||
    hasFtyp(12) ||
    hasFtyp(16) ||
    (dynamicOffset > 3 && dynamicOffset < 64 && hasFtyp(dynamicOffset))
  ) {
    return { ext: "mp4", mime: "video/mp4" };
  }

  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { ext: "webm", mime: "video/webm" };
  }

  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x41 && buffer[9] === 0x56 && buffer[10] === 0x49
  ) {
    return { ext: "avi", mime: "video/x-msvideo" };
  }

  return null;
}

export function detectAudio(buffer: Buffer): DetectedType | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    return { ext: "mp3", mime: "audio/mpeg" };
  }
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return { ext: "mp3", mime: "audio/mpeg" };
  }
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
    return { ext: "ogg", mime: "audio/ogg" };
  }
  if (buffer[0] === 0x66 && buffer[1] === 0x4c && buffer[2] === 0x61 && buffer[3] === 0x43) {
    return { ext: "flac", mime: "audio/flac" };
  }
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45
  ) {
    return { ext: "wav", mime: "audio/wav" };
  }
  const hasFtyp = (offset: number) =>
    buffer.length > offset + 3 &&
    buffer[offset] === 0x66 &&
    buffer[offset + 1] === 0x74 &&
    buffer[offset + 2] === 0x79 &&
    buffer[offset + 3] === 0x70;
  if (hasFtyp(4) || hasFtyp(8) || hasFtyp(12) || hasFtyp(16)) {
    return { ext: "m4a", mime: "audio/mp4" };
  }

  return null;
}
