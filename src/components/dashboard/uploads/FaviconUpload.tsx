"use client";

import MediaUploadModal, { type MediaUploadModalProps } from "./MediaUploadModal";

export default function FaviconUpload(props: MediaUploadModalProps) {
  return <MediaUploadModal {...props} title="Import Favicon" limitMB={1} />;
}
