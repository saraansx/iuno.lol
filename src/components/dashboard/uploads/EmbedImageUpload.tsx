"use client";

import MediaUploadModal, { type MediaUploadModalProps } from "./MediaUploadModal";

export default function EmbedImageUpload(
  props: Omit<MediaUploadModalProps, "assetType" | "cropShape" | "cropAspect" | "cropTitle"> & {
    /** "icon" gets the avatar-style circle crop; "background" gets a 1200x630 rect crop. */
    variant?: "background" | "icon";
  }
) {
  const { variant = "background", ...rest } = props;

  if (variant === "icon") {
    return (
      <MediaUploadModal
        {...rest}
        title="Import Embed Image"
        limitMB={5}
        imagesOnly
        assetType="embed"
        cropShape="round"
        cropAspect={1}
        cropTitle="Crop your icon"
      />
    );
  }

  return (
    <MediaUploadModal
      {...rest}
      title="Import Embed Image"
      limitMB={5}
      imagesOnly
      assetType="embed"
      cropShape="rect"
      cropAspect={1200 / 630}
      cropTitle="Crop your embed background"
    />
  );
}
