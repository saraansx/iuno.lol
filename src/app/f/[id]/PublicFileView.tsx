"use client";

import { useState } from "react";
import { format } from "date-fns";

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const rounded = value >= 100 || i === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[i]}`;
}

function ExternalLinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
    </svg>
  );
}

export default function PublicFileView({
  url,
  name,
  size,
  kind,
  createdAt,
  owner,
}: {
  url: string;
  name: string;
  size: number;
  kind: string;
  createdAt: number;
  owner: string;
}) {
  const isVideo = kind === "video";
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-[20px] border border-white/10 bg-[#0c0c0c] shadow-2xl">
        <div className="flex items-center justify-center bg-black">
          {isVideo ? (
            <video src={url} controls autoPlay playsInline className="max-h-[78vh] w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={name} className="max-h-[78vh] w-full object-contain" />
          )}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/5 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="truncate text-[14px] font-medium text-white/90">{name}</span>
              <span className="shrink-0 text-[12px] text-white/40">({formatBytes(size)})</span>
            </div>
            <p className="mt-0.5 truncate text-[12px] text-white/40">
              Uploaded {format(new Date(createdAt), "MMM d, yyyy, hh:mm a")} by{" "}
              <span className="text-white/60">{owner}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label="Open raw file"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ExternalLinkIcon />
            </a>
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              aria-label="Download"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {downloading ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
              ) : (
                <DownloadIcon />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
