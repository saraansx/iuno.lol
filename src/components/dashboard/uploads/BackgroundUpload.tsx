"use client";

import MediaUploadModal, { type MediaUploadModalProps } from "./MediaUploadModal";

export default function BackgroundUpload(props: MediaUploadModalProps) {
  return <MediaUploadModal {...props} title="Import Background Media" limitMB={10} assetType="background" />;
}
