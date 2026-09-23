"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import SaveBar from "@/components/dashboard/SaveBar";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import PlayerStyleSection, { type MusicPlayerStyle } from "@/components/dashboard/music/PlayerStyleSection";
import SearchTracksModal, { type SearchTrack } from "@/components/dashboard/music/SearchTracksModal";
import { updateMusicProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import PremiumLock from "@/components/ui/premium-lock";
import { isPremiumActive } from "@/lib/premium";
import { type FullUser } from "@/lib/features/users/db";

type Track = SearchTrack;

const FREE_TRACKS = 1;
const PREMIUM_TRACKS = 10;

function toTrack(raw: NonNullable<FullUser["musicTracks"]>[number]): Track {
  return {
    id: raw.id,
    title: raw.title,
    artist: raw.artist,
    artwork: raw.artwork ?? null,
    album: raw.album ?? undefined,
    duration: raw.duration ?? undefined,
    streamUrl: raw.streamUrl ?? undefined,
    lyrics: raw.lyrics ?? undefined,
  };
}

function sanitizeStyle(raw: string | null | undefined): MusicPlayerStyle {
  return raw === "lyrics" ? "lyrics" : raw === "waveform" ? "waveform" : "compact";
}

export default function MusicProfileClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const initialTracks: Track[] = (user?.musicTracks ?? []).map(toTrack);
  const initialPlayerStyle = sanitizeStyle(user?.musicPlayerStyle);
  const initialArtBg = user?.musicPlayerArtBg ?? false;
  const initialVolumeControl = user?.musicPlayerVolume ?? true;
  const initialShuffle = user?.musicPlayerShuffle ?? false;

  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [modalOpen, setModalOpen] = useState(false);
  const [playerStyle, setPlayerStyle] = useState<MusicPlayerStyle>(initialPlayerStyle);
  const [artBg, setArtBg] = useState<boolean>(initialArtBg);
  const [volumeControl, setVolumeControl] = useState<boolean>(initialVolumeControl);
  const [shuffle, setShuffle] = useState<boolean>(initialShuffle);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);

  const moveTrack = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setTracks((prev) => {
      const from = prev.findIndex((t) => t.id === fromId);
      const to = prev.findIndex((t) => t.id === toId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);
      return next;
    });
  };

  const normTrack = (t: Track) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    album: t.album ?? null,
    duration: t.duration ?? null,
  });

  const hasChanges =
    playerStyle !== initialPlayerStyle ||
    artBg !== initialArtBg ||
    volumeControl !== initialVolumeControl ||
    shuffle !== initialShuffle ||
    JSON.stringify(tracks.map(normTrack)) !== JSON.stringify(initialTracks.map(normTrack));

  const count = tracks.length;
  const backgroundSoundOn = user?.bannerBackgroundSound ?? false;
  const isPremium = isPremiumActive(user);
  const maxTracks = isPremium ? PREMIUM_TRACKS : FREE_TRACKS;

  const addTrack = (track: SearchTrack) => {
    setTracks((prev) => (prev.length >= maxTracks ? prev : [...prev, track]));
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setShuffle((prevShuffle) => (tracks.length - 1 < 2 ? false : prevShuffle));
  };

  return (
    <>
      <div
        className="flex flex-col gap-8 w-full pb-20"
        style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}
      >
        {backgroundSoundOn && (
          <div className="flex gap-3.5 bg-[#e0a355]/[0.04] border border-[#e0a355]/15 rounded-[16px] px-4 py-3.5">
            <svg className="text-[#e0a355]/70 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[14px] font-normal text-white/90 tracking-tight">
                Background sound is on
              </span>
              <p className="text-[12.5px] text-white/40">
                Turn off background sound to use the music player — both can&apos;t play at once.
              </p>
              <Link
                href="/dashboard/customize/profile/general"
                className="mt-2.5 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] text-[12.5px] text-white/80 font-normal rounded-xl px-3.5 py-2 transition-colors w-fit"
              >
                Turn off background sound
              </Link>
            </div>
          </div>
        )}
        {!backgroundSoundOn && (
        <>
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
                Your tracks ({count}/{maxTracks})
              </h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Search and add songs to your profile playlist.
              </p>
            </div>

            <button
              type="button"
              disabled={count >= maxTracks}
              onClick={() => setModalOpen(true)}
              title={count >= maxTracks ? `You can only add ${maxTracks} track${maxTracks === 1 ? "" : "s"}` : undefined}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-normal transition-all duration-200 ${
                count >= maxTracks
                  ? "bg-white/5 border border-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer active:scale-95"
              }`}
            >
              <span className={`text-[13px] leading-none font-normal ${count >= maxTracks ? "text-white/30" : "text-white"}`}>+</span>
              <span>Add track</span>
            </button>
          </div>

          {count > 0 ? (
            <div className="flex flex-col gap-2.5">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", track.id);
                    setDragId(track.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDropId(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragId && dragId !== track.id) {
                      setDropId(track.id);
                      moveTrack(dragId, track.id);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = e.dataTransfer.getData("text/plain") || dragId;
                    if (from) moveTrack(from, track.id);
                    setDragId(null);
                    setDropId(null);
                  }}
                  className={`group flex items-center justify-between p-3.5 bg-[#141414]/70 hover:bg-[#161616] border rounded-2xl transition-all duration-150 cursor-grab active:cursor-grabbing ${
                    dragId === track.id
                      ? "opacity-40 border-white/20"
                      : dropId === track.id
                        ? "border-[#5b6cf5]/50"
                        : "border-white/5"
                  }`}
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

        <PlayerStyleSection playerStyle={playerStyle} setPlayerStyle={setPlayerStyle} artBg={artBg} setArtBg={setArtBg} volumeControl={volumeControl} setVolumeControl={setVolumeControl} shuffle={shuffle} setShuffle={setShuffle} trackCount={count} />
        {!isPremium && (
          <div className="flex gap-3 bg-[#0c0c0c] border border-white/5 rounded-[16px] px-4 py-3.5 relative overflow-hidden">
            <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-[#5b6cf5]/70" />
            <PremiumLock size={16} className="mt-0.5" />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-[14px] font-medium text-white/90 tracking-tight">
                Need more audio tracks?
              </span>
              <p className="text-[12.5px] text-white/40">
                Get{" "}
                <span className="inline-flex items-center gap-1 text-white font-medium">
                  <svg width="11" height="11" viewBox="0 0 512 512" fill="#c084fc" aria-hidden="true">
                    <path d="M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z" />
                  </svg>
                  Premium
                </span>{" "}
                to add {PREMIUM_TRACKS - count} more.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="shrink-0 self-center bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white text-[12.5px] font-normal rounded-xl px-3.5 py-2 transition-colors cursor-pointer"
            >
              Get Premium
            </button>
          </div>
        )}
        </>
        )}
      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{
          musicTracks: tracks,
          musicPlayerStyle: playerStyle,
          musicPlayerArtBg: artBg,
          musicPlayerVolume: volumeControl,
          musicPlayerShuffle: shuffle,
        }}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            const res = await updateMusicProfile({ tracks, playerStyle, artBg, volumeControl, shuffle });
            if (res?.tracks) setTracks(res.tracks.map(toTrack));
            toast.success("Profile Saved Sucessfully");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save music");
          }
        }}
        onRevert={() => {
          setTracks(initialTracks);
          setPlayerStyle(initialPlayerStyle);
          setArtBg(initialArtBg);
          setVolumeControl(initialVolumeControl);
          setShuffle(initialShuffle);
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
