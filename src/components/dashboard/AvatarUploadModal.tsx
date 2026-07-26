"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/ui/file-upload";

import MediaCropModal from "./MediaCropModal";

interface AvatarUploadModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (url: string) => void;
}

export default function AvatarUploadModal({ open, onClose, onApply }: AvatarUploadModalProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "gif" | "video" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);

  const xhrRef = React.useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    // Reset state when modal opens/closes
    if (!open) {
      if (!isLoading) {
        setResolvedUrl(null);
        setMediaType(null);
        setErrorMsg(null);
        setIsLoading(false);
        setUploadProgress(null);
        setStatusText("");
        setCropModalOpen(false);
        setCropImageSrc(null);
        setRawSelectedFile(null);
        xhrRef.current = null;
      }
    }
  }, [open, isLoading]);

  const handleCancelAndClose = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsLoading(false);
    setUploadProgress(null);
    setStatusText("");
    onClose();
  };

  const handleFileSelected = (file: File) => {
    if (!file) return;

    setRawSelectedFile(file);
    if (file.type.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(file);
      setCropImageSrc(videoUrl);
      setCropModalOpen(true);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setCropImageSrc(reader.result as string);
          setCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setCropModalOpen(false);
    setCropImageSrc(null);
    processFile(croppedFile);
  };

  const processFile = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File must be less than 5MB");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResolvedUrl(null);
    setMediaType(null);
    setUploadProgress(0);
    setStatusText("Uploading... 0%");

    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", file);
    formData.append("assetType", "avatar");

    try {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("POST", "/api/upload", true);

      // Track browser-to-server upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const rawPercent = Math.round((event.loaded / event.total) * 100);
          const displayPercent = rawPercent >= 100 ? 99 : Math.min(rawPercent, 98);
          setUploadProgress(displayPercent);
          if (rawPercent < 100) {
            setStatusText(`Uploading... ${displayPercent}%`);
          } else {
            setStatusText("Saving to cloud... 99%");
          }
        }
      };

      xhr.onload = () => {
        setIsLoading(false);
        setUploadProgress(100);
        setStatusText("Upload complete");
        if (fileInputRef.current) fileInputRef.current.value = "";

        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.url) {
            const url = data.url;
            let finalUrl = url;
            const isVid = file.type.startsWith("video");
            if (isVid && !/\.(mp4|webm|ogg|mov|mkv|avi|gifv)(?:\?|#|$)/i.test(finalUrl)) {
              finalUrl += finalUrl.includes("#") ? "&ext=.mp4" : "#.mp4";
            }
            setResolvedUrl(finalUrl);
            setMediaType(isVid ? "video" : file.type.includes("gif") ? "gif" : "image");
          } else {
            setErrorMsg(data.error || "Upload failed");
          }
        } catch (err) {
          setErrorMsg("Failed to parse response from server");
        }
      };

      xhr.onerror = () => {
        setIsLoading(false);
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setErrorMsg("Upload failed due to connection error");
      };

      xhr.send(formData);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload file");
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  const handleApply = () => {
    if (resolvedUrl) {
      let finalUrl = resolvedUrl;
      if (mediaType === "video" && !/\.(mp4|webm|ogg|mov|mkv|avi|gifv)(?:\?|#|$)/i.test(finalUrl)) {
        finalUrl += finalUrl.includes("#") ? "&ext=.mp4" : "#.mp4";
      }
      onApply?.(finalUrl);
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/45"
              onClick={handleCancelAndClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[101] top-1/2 left-1/2 w-[min(500px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0c] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-[14px] font-medium text-white/90">Import Avatar Media</h2>
                <button
                  onClick={handleCancelAndClose}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/75"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-4 px-5 py-5">
                <div className="flex flex-col gap-1.5">
                  <FileUpload
                    onChange={(files) => files[0] && handleFileSelected(files[0])}
                    isLoading={isLoading}
                    uploadProgress={uploadProgress ?? 0}
                    statusText={statusText ?? undefined}
                    resolvedUrl={resolvedUrl}
                    mediaType={mediaType}
                    isAvatar={true}
                  />
                  <p className="text-[11px] text-white/28 px-1">Supports up to 5.00MB</p>
                  {errorMsg && (
                    <p className="text-[11px] text-red-400/70 px-1">{errorMsg}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-1 border-t border-white/[0.06] pt-4">
                  <button
                    onClick={handleApply}
                    disabled={!resolvedUrl || isLoading}
                    className="h-10 w-full cursor-pointer rounded-xl border border-[#609fda]/20 bg-[#609fda]/8 text-[13px] font-medium text-[#609fda] transition-colors hover:bg-[#609fda]/14 disabled:cursor-not-allowed disabled:opacity-35 disabled:grayscale-[0.5]"
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

      {/* Interactive Avatar Cropper Modal */}
      {cropImageSrc && (
        <MediaCropModal
          open={cropModalOpen}
          imageSrc={cropImageSrc}
          rawFile={rawSelectedFile}
          isVideo={!!rawSelectedFile?.type.startsWith("video/")}
          cropShape="round"
          aspect={1}
          title="Crop your avatar"
          onClose={() => {
            setCropModalOpen(false);
            setCropImageSrc(null);
            setRawSelectedFile(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
