"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/ui/file-upload";
import MediaCropModal from "../MediaCropModal";

export interface MediaUploadModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (url: string, rawFile?: File) => void;
  /** /api/upload assetType; when set, videos upload to Catbox on Apply so Save stays fast. */
  assetType?: "avatar" | "background" | "banner" | "embed";
  /**
   * When set, static images (not GIF/video) go through the crop step
   * before preview. "round" also renders a circular preview like avatars.
   */
  cropShape?: "round" | "rect";
  cropAspect?: number;
  cropTitle?: string;
  /** When true, video files are rejected up front (images only). */
  imagesOnly?: boolean;
}

interface Props extends MediaUploadModalProps {
  title: string;
  limitMB: number;
  /**
   * Optional rewrite of the picked file before it is previewed and uploaded.
   * Return null to keep the original.
   */
  transform?: (objectUrl: string, file: File) => Promise<{ url: string; file: File } | null>;
}

export default function MediaUploadModal({
  open,
  onClose,
  onApply,
  title,
  limitMB,
  transform,
  assetType,
  cropShape,
  cropAspect,
  cropTitle,
  imagesOnly,
}: Props) {
  const appliedUrls = useRef<Set<string>>(new Set());
  const revokeIfUnused = (url: string | null) => {
    if (url?.startsWith("blob:") && !appliedUrls.current.has(url)) URL.revokeObjectURL(url);
  };

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "gif" | "video" | null>(null);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!open && !isLoading) {
      const timer = setTimeout(() => {
        setResolvedUrl((prev) => {
          revokeIfUnused(prev);
          return null;
        });
        setMediaType(null);
        setRawSelectedFile(null);
        setErrorMsg(null);
        setIsLoading(false);
        setUploadProgress(null);
        setStatusText("");
        setCropModalOpen(false);
        setCropImageSrc(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, isLoading]);

  useEffect(() => {
    return () => revokeIfUnused(resolvedUrl);
  }, [resolvedUrl]);

  const handleCancelAndClose = () => {
    setIsLoading(false);
    setUploadProgress(null);
    setStatusText("");
    onClose();
  };

  const handleFileSelected = (file: File) => {
    if (!file) return;

    const looksLikeVideo =
      file.type.startsWith("video") || /\.(mp4|webm|ogg|ogv|mov|mkv|avi|gifv)$/i.test(file.name);
    if (imagesOnly && looksLikeVideo) {
      setErrorMsg("Videos aren't supported here. Please choose an image.");
      return;
    }
    if (!cropShape || file.type.startsWith("video") || file.type.includes("gif")) {
      processFile(file);
      return;
    }

    setRawSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setCropImageSrc(reader.result as string);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile: File) => {
    setCropModalOpen(false);
    setCropImageSrc(null);
    processFile(croppedFile);
  };

  const handleCropClose = () => {
    setCropModalOpen(false);
    setCropImageSrc(null);
    setRawSelectedFile(null);
  };

  const processFile = async (file: File) => {
    if (!file) return;

    if (file.size > limitMB * 1024 * 1024) {
      setErrorMsg(`File must be less than ${limitMB}MB`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResolvedUrl(null);
    setMediaType(null);
    setUploadProgress(100);
    setStatusText("Ready");

    try {
      const localUrl = URL.createObjectURL(file);
      const isVid = file.type.startsWith("video");
      const isGif = file.type.includes("gif");

      const rewritten = transform ? await transform(localUrl, file) : null;
      if (rewritten) {
        URL.revokeObjectURL(localUrl);
        setResolvedUrl(rewritten.url);
        setMediaType("image");
        setRawSelectedFile(rewritten.file);
        setIsLoading(false);
        return;
      }

      setResolvedUrl(localUrl);
      setMediaType(isVid ? "video" : isGif ? "gif" : "image");
      setRawSelectedFile(file);
      setIsLoading(false);
    } catch {
      setErrorMsg("Failed to process local file");
      setIsLoading(false);
    }
  };

  const closeAndReset = () => {
    setResolvedUrl(null);
    setMediaType(null);
    setRawSelectedFile(null);
    setErrorMsg(null);
    setUploadProgress(null);
    setStatusText("");
    onClose();
  };

  const handleApply = async () => {
    if (!resolvedUrl) return;

    if (mediaType === "video" && rawSelectedFile && assetType) {
      setIsLoading(true);
      setUploadProgress(0);
      setStatusText("Uploading");
      setErrorMsg(null);
      try {
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", rawSelectedFile);
        form.append("assetType", assetType);
        const url: string = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/upload");
          const uploadStart = Date.now();
          xhr.upload.onprogress = (e) => {
            const elapsed = Math.max(0.5, (Date.now() - uploadStart) / 1000);
            const mbps = ((e.loaded * 8) / elapsed / 1e6).toFixed(1);
            if (e.lengthComputable && e.total > 0) {
              const pct = Math.round((e.loaded / e.total) * 100);
              const eta = Math.max(1, Math.round((e.total - e.loaded) / (e.loaded / elapsed)));
              setUploadProgress(Math.min(99, pct));
              setStatusText(`Uploading ${pct}% · ${mbps} Mbps · ~${eta}s left`);
            } else {
              setStatusText(`Uploading ${(e.loaded / (1024 * 1024)).toFixed(1)}MB · ${mbps} Mbps`);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText) as { url?: string };
                if (data.url) resolve(data.url);
                else reject(new Error("Upload failed"));
              } catch {
                reject(new Error("Upload failed"));
              }
            } else {
              try {
                const data = JSON.parse(xhr.responseText) as { error?: string };
                reject(new Error(data.error || "Upload failed"));
              } catch {
                reject(new Error("Upload failed"));
              }
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.send(form);
        });
        setUploadProgress(100);
        setStatusText("Uploading 100%");
        appliedUrls.current.add(resolvedUrl);
        onApply?.(url);
        closeAndReset();
      } catch (e) {
        console.error(e);
        setErrorMsg(e instanceof Error ? e.message : "Failed to upload video");
        setIsLoading(false);
        setUploadProgress(null);
        setStatusText("");
      }
      return;
    }

    let finalUrl = resolvedUrl;
    if (mediaType === "video" && !/\.(mp4|webm|ogg|mov|mkv|avi|gifv)(?:\?|#|$)/i.test(finalUrl)) {
      finalUrl += finalUrl.includes("#") ? "&ext=.mp4" : "#.mp4";
    }
    appliedUrls.current.add(resolvedUrl);
    onApply?.(finalUrl, rawSelectedFile || undefined);
    closeAndReset();
  };

  return (
    <>
      {cropImageSrc && cropShape && (
        <MediaCropModal
          open={cropModalOpen}
          imageSrc={cropImageSrc}
          rawFile={rawSelectedFile}
          isVideo={false}
          cropShape={cropShape}
          aspect={cropAspect ?? 3 / 1}
          title={cropTitle ?? "Crop your media"}
          onClose={handleCropClose}
          onCropComplete={handleCropComplete}
        />
      )}
      <AnimatePresence>
        {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px]"
            onClick={handleCancelAndClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[101] top-1/2 left-1/2 w-[min(500px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0c] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[14px] font-medium text-white/90">{title}</h2>
              <button
                onClick={handleCancelAndClose}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/75"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5">
              <div className="flex flex-col gap-1.5">
                <FileUpload
                  onChange={(files) => files[0] && handleFileSelected(files[0])}
                  accept={imagesOnly ? "image/*" : undefined}
                  isLoading={isLoading}
                  uploadProgress={uploadProgress ?? 0}
                  statusText={statusText ?? undefined}
                  resolvedUrl={resolvedUrl}
                  mediaType={mediaType}
                  isAvatar={cropShape === "round"}
                />
                <p className="text-[11px] text-white/28 px-1">Supports up to {limitMB}.00MB</p>
                {errorMsg && (
                  <p className="text-[11px] text-red-400/70 px-1">{errorMsg}</p>
                )}
              </div>

              <div className="mt-1 border-t border-white/[0.06] pt-4">
                <button
                  onClick={handleApply}
                  disabled={!resolvedUrl || isLoading}
                  className="h-10 w-full cursor-pointer rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white font-normal text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] disabled:cursor-not-allowed disabled:opacity-35 disabled:grayscale-[0.5]"
                >
                  {isLoading
                    ? "Uploading..."
                    : mediaType === "video"
                    ? "Apply Video"
                    : mediaType === "gif"
                    ? "Apply GIF"
                    : "Apply Image"}
                </button>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
