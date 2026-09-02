"use client";

import MediaUploadModal, { type MediaUploadModalProps } from "./MediaUploadModal";
import { shrinkToCursorSize } from "./shrinkToCursorSize";

export default function CursorUpload(props: MediaUploadModalProps) {
  return (
    <MediaUploadModal
      {...props}
      title="Import Cursor"
      limitMB={1}
      transform={(objectUrl) => shrinkToCursorSize(objectUrl)}
    />
  );
}
