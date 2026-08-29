"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";

interface MediaCropModalProps {
  open: boolean;
  imageSrc: string;
  rawFile?: File | null;
  isVideo?: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageFile: File) => void;
  cropShape?: "round" | "rect";
  aspect?: number;
  title?: string;
}

export default function MediaCropModal({
  open,
  imageSrc,
  rawFile,
  isVideo = false,
  onClose,
  onCropComplete,
  cropShape = "rect",
  aspect = 3 / 1,
  title = "Crop your media",
}: MediaCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], "cropped-media.png", { type: "image/png" });
        resolve(file);
      }, "image/png");
    });
  };

  const getCroppedVideo = async (videoSrc: string, pixelCrop: Area): Promise<File> => {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.src = videoSrc;

    await new Promise((res) => {
      video.onloadeddata = res;
    });

    await video.play();

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d")!;

    let animId: number = 0;
    const draw = () => {
      ctx.drawImage(
        video,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      animId = requestAnimationFrame(draw);
    };
    draw();

    if (typeof MediaRecorder === "undefined" || !canvas.captureStream) {
      cancelAnimationFrame(animId);
      video.pause();
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(new File([blob!], "cropped-video-frame.png", { type: "image/png" }));
        }, "image/png");
      });
    }

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        cancelAnimationFrame(animId);
        video.pause();
        video.remove();
        const blob = new Blob(chunks, { type: mimeType });
        const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";
        const file = new File([blob], `cropped-video${ext}`, { type: mimeType });
        resolve(file);
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 3000);
    });
  };

  const handleApply = async () => {
    if (!imageSrc) return;
    try {
      setIsProcessing(true);
      if (isVideo && croppedAreaPixels) {
        const croppedVideoFile = await getCroppedVideo(imageSrc, croppedAreaPixels);
        onCropComplete(croppedVideoFile);
      } else if (croppedAreaPixels) {
        const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedFile);
      } else if (rawFile) {
        onCropComplete(rawFile);
      }
    } catch (e) {
      console.error(e);
      if (rawFile) onCropComplete(rawFile);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[111] top-1/2 left-1/2 w-[min(540px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-semibold text-white/90 tracking-tight">
                {title}
              </h2>
              <p className="text-[13px] text-white/40 leading-snug">
                Drag to reposition, and pinch or use the slider to zoom.
              </p>
            </div>

            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden bg-neutral-950 border border-white/5">
              <Cropper
                image={isVideo ? undefined : imageSrc}
                video={isVideo ? imageSrc : undefined}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                showGrid={false}
                onCropChange={onCropChange}
                onCropComplete={onCropCompleteCallback}
                onZoomChange={onZoomChange}
                style={{
                  containerStyle: { background: "#080808" },
                  cropAreaStyle: { border: "2px solid rgba(255, 255, 255, 0.85)" },
                }}
              />
            </div>

            <div className="flex items-center gap-3 px-1 pt-1">
              <button
                type="button"
                onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                className="text-white/40 hover:text-white/80 transition-colors"
                title="Zoom Out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>

              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#609fda]"
              />

              <button
                type="button"
                onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                className="text-white/40 hover:text-white/80 transition-colors"
                title="Zoom In"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="h-10 px-5 rounded-xl border border-white/10 bg-white/[0.04] text-[13px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isProcessing}
                className="h-10 px-6 rounded-xl bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white font-normal text-sm transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? "Cropping..." : "Apply"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
