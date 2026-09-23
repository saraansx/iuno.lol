"use client";

import React, {  useState, useEffect, useRef  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/ui/file-upload";

import MediaCropModal from "./MediaCropModal";

interface AvatarUploadModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (url: string, rawFile?: File) => void;
}

export default function AvatarUploadModal({ open, onClose, onApply }: AvatarUploadModalProps) {
  const appliedUrls = useRef<Set<string>>(new Set());
  const revokeIfUnused = (url: string | null) => {
    if (url?.startsWith("blob:") && !appliedUrls.current.has(url)) URL.revokeObjectURL(url);
  };

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "gif" | "video" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [rawSelectedFile, setRawSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open && !isLoading) {
      const timer = setTimeout(() => {
        setResolvedUrl((prev) => {
          revokeIfUnused(prev);
          return null;
        });
        setMediaType(null);
        setErrorMsg(null);
        setIsLoading(false);
        setUploadProgress(null);
        setStatusText("");
        setCropModalOpen(false);
        setCropImageSrc(null);
        setRawSelectedFile(null);
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
    if (looksLikeVideo) {
      setErrorMsg("Video uploads are not supported for avatars. Images and GIFs only.");
      return;
    }

    setRawSelectedFile(file);
    if (file.type.includes("gif")) {
      processFile(file);
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
    setUploadProgress(100);
    setStatusText("Ready");

    try {
      const localUrl = URL.createObjectURL(file);
      setResolvedUrl(localUrl);
      
      const isVid = file.type.startsWith("video");
      const isGif = file.type.includes("gif");
      setMediaType(isVid ? "video" : isGif ? "gif" : "image");
      
      setRawSelectedFile(file);
      
      setIsLoading(false);
    } catch (error) {
      const err = error as Error;
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
      appliedUrls.current.add(resolvedUrl);
      onApply?.(finalUrl, rawSelectedFile || undefined);

      setResolvedUrl(null);
      setMediaType(null);
      setRawSelectedFile(null);
      setErrorMsg(null);
      setUploadProgress(null);
      setStatusText("");
      onClose();
    }
  };

  return (
    <>
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

              <div className="flex flex-col gap-4 px-5 py-5">
                <div className="flex flex-col gap-1.5">
                  <FileUpload
                    onChange={(files) => files[0] && handleFileSelected(files[0])}
                    accept="image/*"
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
