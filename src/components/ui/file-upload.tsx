"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  isLoading = false,
  uploadProgress = 0,
  statusText,
  resolvedUrl,
  mediaType,
  isAvatar = false,
  accept,
}: {
  onChange?: (files: File[]) => void;
  isLoading?: boolean;
  uploadProgress?: number;
  statusText?: string;
  resolvedUrl?: string | null;
  mediaType?: string | null;
  isAvatar?: boolean;
  accept?: string;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles && newFiles.length > 0) {
      setFiles([newFiles[0]]);
      if (onChange) onChange([newFiles[0]]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: accept ? { [accept]: [] } : undefined,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="group/file relative block w-full cursor-pointer overflow-hidden rounded-xl border border-dashed border-white/10 bg-[#111111] transition-colors hover:border-white/20 hover:bg-[#141414] p-5 sm:p-6"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          {!resolvedUrl && (
            <p className="relative z-20 text-xs font-normal text-white/40">
              Drag & drop your file here or click to browse
            </p>
          )}
          <div className="relative mx-auto mt-2 w-full max-w-sm">
            {(files.length > 0 || resolvedUrl) && (
              <motion.div
                layoutId="file-upload"
                className={cn(
                  "relative z-40 mx-auto flex w-full flex-col items-start justify-start overflow-hidden rounded-xl bg-[#161616] border border-white/10 p-3.5 shadow-lg gap-2.5"
                )}
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="max-w-xs truncate text-xs font-medium text-white/90"
                  >
                    {files[0]?.name || "Uploaded File"}
                  </motion.p>
                  {files[0] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="w-fit shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80"
                    >
                      {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  )}
                </div>

                {(isLoading || (uploadProgress > 0 && !resolvedUrl)) && (
                  <div className="flex flex-col gap-1.5 w-full pt-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/50 font-normal">{statusText || "Uploading..."}</span>
                      <span className="text-[#5b6cf5] font-normal">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        className="h-full rounded-full transition-all duration-200 bg-gradient-to-r from-[#5b6cf5] to-[#5b6cf5] shadow-[0_0_10px_rgba(91,108,245,0.6)]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: "easeOut", duration: 0.2 }}
                      />
                    </div>
                  </div>
                )}

                {resolvedUrl && (
                  <div className="w-full mt-1.5 flex flex-col items-center gap-2">
                    {isAvatar ? (
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white/15 overflow-hidden bg-black/40 shadow-md my-1">
                        {mediaType === "video" ? (
                          <video
                            src={resolvedUrl}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={resolvedUrl}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/30 group-hover/file:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/file:opacity-100">
                          <span className="text-[10px] font-medium text-white bg-black/70 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm">Change</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full rounded-lg border border-white/10 overflow-hidden bg-black/40 flex items-center justify-center">
                        {mediaType === "video" ? (
                          <video
                            src={resolvedUrl}
                            className="h-auto max-h-56 w-full object-contain"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={resolvedUrl}
                            alt="Uploaded Preview"
                            className="h-auto max-h-56 w-full object-contain"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover/file:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/file:opacity-100">
                          <span className="text-[11px] font-medium text-white bg-black/60 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm">Click to change</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px] w-full">
                      {isLoading ? (
                        <>
                          <span className="text-white/50 font-normal">{statusText || "Uploading..."}</span>
                          <span className="text-[#5b6cf5] font-normal">{uploadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <span className="text-emerald-400 font-normal">Ready to apply</span>
                          <span className="text-emerald-400 font-normal">100%</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!files.length && !resolvedUrl && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative z-40 mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#161616] border border-white/10 transition-colors group-hover/file:border-white/25 group-hover/file:bg-[#1f1f1f]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-xs text-white/80 font-medium"
                  >
                    Drop
                    <Upload className="h-6 w-6 text-white/80 mt-1" />
                  </motion.p>
                ) : (
                  <Upload className="h-7 w-7 text-white/70" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute inset-0 z-30 mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-[#5b6cf5]/40 bg-transparent opacity-0"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
