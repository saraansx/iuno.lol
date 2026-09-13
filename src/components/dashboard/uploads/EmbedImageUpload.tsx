"use client";

import MediaUploadModal, { type MediaUploadModalProps } from "./MediaUploadModal";

export default function EmbedImageUpload(
  props: Omit<MediaUploadModalProps, "assetType">
) {
  return <MediaUploadModal {...props} title="Import Embed Image" limitMB={5} assetType="embed" />;
}
