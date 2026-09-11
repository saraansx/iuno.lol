"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import SaveBar from "@/components/dashboard/SaveBar";
import { toast } from "@/components/ui/toast";

type Track = { id: string; url: string };

export default function Page() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [input, setInput] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const addTrack = () => {
    const url = input.trim();
    if (!url) return;
    setTracks((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, url }]);
    setInput("");
    setHasChanges(true);
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setHasChanges(true);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="border-b border-white/4 pb-5 -mx-12 px-12">
        <Breadcrumb>
          <BreadcrumbList className="text-[13px] gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-white/40 hover:text-white tracking-tight">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbEllipsis className="text-white/40" />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#609fda] font-normal tracking-tight">Music</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="w-full pb-10 flex flex-col gap-6 pt-2">
        <div>
          <h1 className="text-[14px] font-normal text-white/90 tracking-tight">Tracks</h1>
          <p className="text-white/40 text-[13px] mt-0.5">Add audio URLs to your profile playlist</p>
        </div>

        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTrack()}
              placeholder="Paste audio URL (mp3, wav, ogg...)"
              className="flex-1 bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/10 transition-colors"
            />
            <button
              onClick={addTrack}
              className="bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white font-normal rounded-xl px-5 text-[13px] transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          {tracks.length === 0 ? (
            <p className="text-white/30 text-[13px]">No tracks yet. Add your first one above.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tracks.map((track, i) => (
                <div key={track.id} className="flex items-center gap-3 bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5">
                  <span className="text-white/30 text-[12px] w-5 shrink-0">{i + 1}</span>
                  <span className="flex-1 text-[13px] text-white truncate">{track.url}</span>
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="text-white/30 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    title="Remove track"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SaveBar
        show={hasChanges}
        onSave={() => {
          // ponytail: UI-only, no DB column yet. Add user_settings JSON field + updateMusicProfile action when persistence needed.
          toast.success("Tracks saved locally (persistence not wired yet)");
          setHasChanges(false);
        }}
        onRevert={() => {
          setTracks([]);
          setInput("");
          setHasChanges(false);
        }}
      />
    </div>
  );
}
