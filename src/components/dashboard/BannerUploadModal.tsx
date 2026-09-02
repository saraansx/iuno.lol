"use client";

import React, {  useState, useEffect, useRef  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/ui/file-upload";

interface BannerUploadModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (url: string, rawFile?: File) => void;
  type?: "image" | "background" | "favicon" | "cursor";
}

const SIZE_LIMIT_MB: Record<string, number> = {
  image: 5,
  background: 20,
  favicon: 1,
  cursor: 1,
};

const CURSOR_PX = 32;

/**
 * A cursor image renders at its native pixel size and CSS cannot scale it, so an
 * ordinary upload would cover half the screen. Redraw it at cursor scale instead
 * of rejecting the file. Returns null when the image is already small enough.
 */
async function shrinkToCursorSize(
  objectUrl: string,
): Promise<{ url: string; file: File } | null> {
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const probe = new window.Image();
    probe.onload = () => resolve(probe);
    probe.onerror = () => resolve(null);
    probe.src = objectUrl;
  });

  if (!img) return null;

  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (longest <= CURSOR_PX) return null;

  const scale = CURSOR_PX / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) return null;

  return {
    url: URL.createObjectURL(blob),
    file: new File([blob], "cursor.png", { type: "image/png" }),
  };
}

const MODAL_TITLE: Record<string, string> = {
  image: "Import Banner Media",
  background: "Import Background Media",
  favicon: "Import Favicon",
  cursor: "Import Cursor",
};

export default function BannerUploadModal({ open, onClose, onApply, type = "image" }: BannerUploadModalProps) {
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

  const processFile = async (file: File) => {
    if (!file) return;

    const limit = SIZE_LIMIT_MB[type];
    if (file.size > limit * 1024 * 1024) {
      setErrorMsg(`File must be less than ${limit}MB`);
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

      if (type === "cursor") {
        const shrunk = await shrinkToCursorSize(localUrl);
        if (shrunk) {
          URL.revokeObjectURL(localUrl);
          setResolvedUrl(shrunk.url);
          setMediaType("image");
          setRawSelectedFile(shrunk.file);
          setIsLoading(false);
          return;
        }
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

  const title = MODAL_TITLE[type];
  const limitMB = SIZE_LIMIT_MB[type];

  return (
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
                  onChange={(files) => files[0] && processFile(files[0])}
                  isLoading={isLoading}
                  uploadProgress={uploadProgress ?? 0}
                  statusText={statusText ?? undefined}
                  resolvedUrl={resolvedUrl}
                  mediaType={mediaType}
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
                  className="h-10 w-full cursor-pointer rounded-xl bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white font-normal text-sm transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] disabled:cursor-not-allowed disabled:opacity-35 disabled:grayscale-[0.5]"
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
  );
}
