"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  IMAGE_HOST_MAX_FILE_MB as MAX_FILE_MB,
  IMAGE_HOST_MAX_FILE_BYTES as MAX_FILE_BYTES,
  IMAGE_HOST_QUOTA_BYTES as STORAGE_QUOTA_BYTES,
} from "@/lib/image-host";

type UploadStatus = "uploading" | "done" | "error";
type MediaKind = "image" | "video";

interface UploadItem {
  id: string;
  name: string;
  size: number;
  kind: MediaKind;
  progress: number;
  status: UploadStatus;
  loaded: number;
  speed: number;
  eta: number | null;
  error?: string;
}

function formatSize(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const decimals = i >= 2 ? 1 : 0;
  return `${value.toFixed(decimals)} ${units[i]}`;
}

function formatSpeed(bytesPerSec: number): string {
  if (!isFinite(bytesPerSec) || bytesPerSec <= 0) return "—";
  const units = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.min(Math.floor(Math.log(bytesPerSec) / Math.log(1024)), units.length - 1);
  const value = bytesPerSec / Math.pow(1024, i);
  return `${value.toFixed(i >= 2 ? 1 : 0)} ${units[i]}`;
}

function formatEta(seconds: number | null): string {
  if (seconds == null || !isFinite(seconds) || seconds < 0) return "";
  if (seconds < 1) return "<1s left";
  if (seconds < 60) return `${Math.round(seconds)}s left`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s left`;
}

function UploadTrayIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function RowIcon({ status }: { status: UploadStatus }) {
  if (status === "error") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    );
  }
  if (status === "done") return <CheckIcon />;
  return <Spinner />;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function ImageHostUploadClient() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [usedBytes, setUsedBytes] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const xhrsRef = useRef<Map<string, XMLHttpRequest>>(new Map());
  const dragDepth = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/image-host/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.storageUsedBytes === "number") {
          setUsedBytes(data.storageUsedBytes);
        }
      })
      .catch(() => {});
    const xhrs = xhrsRef.current;
    return () => {
      cancelled = true;
      xhrs.forEach((xhr) => xhr.abort());
      xhrs.clear();
    };
  }, []);

  const activeCount = useMemo(() => items.filter((it) => it.status === "uploading").length, [items]);

  const startUpload = (id: string, file: File) => {
    const form = new FormData();
    form.append("fileToUpload", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/image-host/upload");
    xhr.timeout = 120_000;

    let lastTime = 0;
    let lastLoaded = 0;
    let ema = 0;

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const now = performance.now();
      if (lastTime === 0) {
        lastTime = now;
        lastLoaded = e.loaded;
      } else {
        const dt = (now - lastTime) / 1000;
        if (dt >= 0.05) {
          const instant = (e.loaded - lastLoaded) / dt;
          ema = ema === 0 ? instant : ema * 0.75 + instant * 0.25;
          lastTime = now;
          lastLoaded = e.loaded;
        }
      }
      const pct = Math.min(99, Math.round((e.loaded / e.total) * 100));
      const eta = ema > 0 ? (e.total - e.loaded) / ema : null;
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, progress: pct, loaded: e.loaded, speed: ema, eta } : it)));
    };

    const fail = (message: string) => {
      xhrsRef.current.delete(id);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: "error", error: message } : it)));
    };

    xhr.onload = () => {
      xhrsRef.current.delete(id);
      let data: { usedBytes?: number; error?: string } = {};
      try { data = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300) {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, progress: 100, status: "done", speed: 0, eta: null } : it)));
        if (typeof data.usedBytes === "number") setUsedBytes(data.usedBytes);
      } else {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, status: "error", error: data.error || "Upload failed. Try again." } : it)),
        );
      }
    };
    xhr.onerror = () => fail("Upload failed. Check your connection.");
    xhr.ontimeout = () => fail("Upload timed out. Try again.");

    xhrsRef.current.set(id, xhr);
    xhr.send(form);
  };

  const removeItem = (id: string) => {
    const xhr = xhrsRef.current.get(id);
    if (xhr) xhr.abort();
    xhrsRef.current.delete(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;
    const newItems: UploadItem[] = incoming.map((f) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const isImage = f.type.startsWith("image/");
      const isVideo = f.type.startsWith("video/");
      const kind: MediaKind = isVideo ? "video" : "image";
      if (!isImage && !isVideo) {
        return { id, name: f.name, size: f.size, kind, progress: 0, loaded: 0, speed: 0, eta: null, status: "error", error: "Only images and videos are allowed" };
      }
      if (f.size > MAX_FILE_BYTES) {
        return { id, name: f.name, size: f.size, kind, progress: 0, loaded: 0, speed: 0, eta: null, status: "error", error: `File exceeds the ${MAX_FILE_MB} MB limit` };
      }
      return { id, name: f.name, size: f.size, kind, progress: 0, loaded: 0, speed: 0, eta: null, status: "uploading" };
    });
    setItems((prev) => [...newItems, ...prev]);
    newItems.forEach((it, i) => {
      if (it.status === "uploading") startUpload(it.id, incoming[i]);
    });
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };
  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };
  const onDragOver = (e: DragEvent) => e.preventDefault();
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[15px] font-medium text-white tracking-tight">Image Host Upload</h1>
        <p className="text-white/30 text-[13px] mt-1">Drop files to upload them straight to your image host.</p>
      </div>

      <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm">
        <div>
          <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Drop files here</h2>
          <p className="text-white/30 text-[12px] mt-1">
            Up to {MAX_FILE_MB.toFixed(1)} MB per file. {formatSize(usedBytes)} of {formatSize(STORAGE_QUOTA_BYTES)} used.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`mt-4 flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center transition-colors ${
            isDragging ? "border-[#5b6cf5]/60 bg-[#5b6cf5]/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          }`}
        >
          <span className={isDragging ? "text-[#5b6cf5]" : "text-white/30"}>
            <UploadTrayIcon />
          </span>
          <div>
            <p className="text-[13px] font-normal text-white/90">Drag and drop files, or click to browse</p>
            <p className="text-white/30 text-[12px] mt-1">Images and videos up to {MAX_FILE_MB.toFixed(1)} MB</p>
          </div>
        </button>
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple onChange={onInputChange} className="hidden" />
      </div>

      {items.length > 0 && (
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm">
          <div>
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Uploads ({items.length})</h2>
            <p className="text-white/30 text-[12px] mt-1">
              {activeCount > 0 ? "Don’t close the page until every upload finishes." : "All uploads finished."}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#111111] px-4 py-3.5">
                <span
                  className={`shrink-0 ${it.status === "error" ? "text-red-400/70" : "text-[#5b6cf5]"}`}
                  aria-label={it.status === "error" ? "Failed" : it.status === "done" ? "Uploaded" : "Uploading"}
                >
                  <RowIcon status={it.status} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white/90">{it.name}</p>
                  {it.status === "error" ? (
                    <p className="mt-1 text-[11px] text-red-400/70">{it.error}</p>
                  ) : (
                    <>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#5b6cf5] to-[#7c8bff] shadow-[0_0_10px_rgba(91,108,245,0.5)] transition-all duration-200"
                          style={{ width: `${it.progress}%` }}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] tabular-nums text-white/30">
                        <span>
                          {it.status === "uploading"
                            ? `${formatSize(it.loaded)} / ${formatSize(it.size)}`
                            : formatSize(it.size)}
                        </span>
                        <span className={it.status === "done" ? "text-[#5b6cf5]/80" : undefined}>
                          {it.status === "uploading"
                            ? [formatSpeed(it.speed), formatEta(it.eta)].filter(Boolean).join(" · ")
                            : "Uploaded"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <span className="w-12 shrink-0 text-right text-[12px] tabular-nums text-white/40">
                  {it.status === "error" ? "Failed" : `${Math.round(it.progress)}%`}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  aria-label={`Remove ${it.name}`}
                  className="-m-1 shrink-0 cursor-pointer rounded-md p-1 text-white/25 transition-colors hover:bg-white/5 hover:text-white/70"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

