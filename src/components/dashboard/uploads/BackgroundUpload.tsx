"use client";

import MediaUploadModal, { type MediaUploadModalProps } from "./MediaUploadModal";

export default function BackgroundUpload({ isPremium = false, ...props }: MediaUploadModalProps & { isPremium?: boolean }) {
  return <MediaUploadModal {...props} title="Import Background Media" limitMB={isPremium ? 100 : 20} assetType="background" />;
}
