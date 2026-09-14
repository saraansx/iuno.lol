"use client";

import { useState } from "react";
import NextImage from "next/image";
import SaveBar from "@/components/dashboard/SaveBar";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SearchTracksModal, { type SearchTrack } from "@/components/dashboard/music/SearchTracksModal";
import { toast } from "@/components/ui/toast";
import { type FullUser } from "@/lib/features/users/db";

type Track = SearchTrack;

const MAX_TRACKS = 2;

export default function MusicProfileClient({ user }: { user: FullUser | null }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const addTrack = (track: SearchTrack) => {
    setTracks((prev) => (prev.length >= MAX_TRACKS ? prev : [...prev, track]));
    setHasChanges(true);
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setHasChanges(true);
  };

  const count = tracks.length;

  return (
    <>
      <div
        className="flex flex-col gap-8 w-full"
        style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}
      >
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
                Your tracks ({count}/{MAX_TRACKS})
              </h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Search and add songs to your profile playlist.
              </p>
            </div>

            <button
              type="button"
              disabled={count >= MAX_TRACKS}
              onClick={() => setModalOpen(true)}
              title={count >= MAX_TRACKS ? "You can only add 2 tracks" : undefined}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-normal transition-all duration-200 ${
                count >= MAX_TRACKS
                  ? "bg-white/5 border border-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer active:scale-95"
              }`}
            >
              <span className={`text-[13px] leading-none font-normal ${count >= MAX_TRACKS ? "text-white/30" : "text-white"}`}>+</span>
              <span>Add track</span>
            </button>
          </div>

          {count > 0 ? (
            <div className="flex flex-col gap-2.5">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="group flex items-center justify-between p-3.5 bg-[#141414]/70 hover:bg-[#161616] border border-white/5 rounded-2xl transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="text-white/20 group-hover:text-white/60 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                      </svg>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                      {track.artwork ? (
                        // ponytail: unoptimized next/image keeps remote art no-store; add remotePatterns only if caching wanted.
                        <NextImage src={track.artwork} alt="" width={36} height={36} unoptimized draggable={false} className="w-full h-full object-cover" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[13.5px] font-normal text-white/95 tracking-tight">
                        {track.title}
                      </span>
                      <span className="text-[11.5px] font-mono text-white/35">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTrack(track.id)}
                    title="Remove track"
                    className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full border border-dashed border-white/[0.08] rounded-2xl bg-[#141414]/30 py-12 px-6 flex flex-col items-center justify-center text-center transition-colors hover:border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 mb-3 shadow-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
                  <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                </svg>
              </div>

              <h3 className="text-[13.5px] font-normal text-white/90 tracking-tight">
                No tracks yet.
              </h3>
              <p className="text-[12.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">
                Add your first track so visitors can hear your playlist.
              </p>
            </div>
          )}
        </div>
      </div>

      <DashboardProfilePreview user={user} />

      <SaveBar
        show={hasChanges}
        onSave={() => {
          // ponytail: UI-only, no DB column yet. Add user_settings JSON field + updateMusicProfile action when persistence needed.
          toast.success("Tracks saved locally (persistence not wired yet)");
          setHasChanges(false);
        }}
        onRevert={() => {
          setTracks([]);
          setHasChanges(false);
        }}
      />

      <SearchTracksModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={addTrack}
      />
    </>
  );
}
