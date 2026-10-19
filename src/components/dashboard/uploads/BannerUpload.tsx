"use client";

import MediaUploadModal, { type MediaUploadModalProps } from "./MediaUploadModal";

export default function BannerUpload(props: MediaUploadModalProps) {
  return (
    <MediaUploadModal
      {...props}
      title="Import Banner Media"
      limitMB={5}
      assetType="banner"
      cropShape="rect"
      cropAspect={3}
      cropTitle="Crop your banner"
    />
  );
}
