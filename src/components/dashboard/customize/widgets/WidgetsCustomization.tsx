"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AddWidgetModal from "./AddWidgetModal";

export interface WidgetItem {
  id: string;
  platform: string;
  type: string;
  targetId: string;
  useLinked: boolean;
  enabled: boolean;
  imageShape?: 'circle' | 'rounded' | 'square';
  showActivity?: boolean;
  showActivityImage?: boolean;
  activityImageShape?: 'circle' | 'rounded' | 'square';
  showAvatarDecoration?: boolean;
  showGuildTag?: boolean;
  showBadges?: boolean;
  badgeOrder?: string[];
  hiddenBadges?: string[];
  showLastSeen?: boolean;
  fallbackText?: string;
}

interface WidgetsCustomizationProps {
  initialWidgets?: WidgetItem[];
  maxWidgets?: number;
  linkedDiscordId?: string | null;
  linkedDiscordUsername?: string | null;
  onWidgetsChange?: (widgets: WidgetItem[]) => void;
}

export default function WidgetsCustomization({
  initialWidgets = [],
  maxWidgets = 10,
  linkedDiscordId,
  linkedDiscordUsername,
  onWidgetsChange,
}: WidgetsCustomizationProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetItem[]>(initialWidgets);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddWidget = (widget: { platform: string; type: string; useLinked: boolean; customId: string }) => {
    if (widget.platform === "discord") {
      if (widget.type === "presence") {
        router.push(
          `/dashboard/customize/profile/widgets/discord-presence?id=${encodeURIComponent(
            widget.customId
          )}&linked=${widget.useLinked}`
        );
      } else if (widget.type === "server") {
        router.push(
          `/dashboard/customize/profile/widgets/discord-server?id=${encodeURIComponent(widget.customId)}`
        );
      }
    }
  };

  const handleEditWidget = (w: WidgetItem) => {
    setOpenMenuId(null);
    if (w.platform === "discord") {
      if (w.type === "presence") {
        router.push(
          `/dashboard/customize/profile/widgets/discord-presence?widgetId=${encodeURIComponent(
            w.id
          )}&id=${encodeURIComponent(w.targetId)}&linked=${w.useLinked}`
        );
      } else if (w.type === "server") {
        router.push(
          `/dashboard/customize/profile/widgets/discord-server?widgetId=${encodeURIComponent(
            w.id
          )}&id=${encodeURIComponent(w.targetId)}`
        );
      }
    }
  };

  const handleToggleWidget = (id: string) => {
    setOpenMenuId(null);
    const updated = widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    setWidgets(updated);
    onWidgetsChange?.(updated);
  };

  const handleDeleteWidget = (id: string) => {
    setOpenMenuId(null);
    const updated = widgets.filter((w) => w.id !== id);
    setWidgets(updated);
    onWidgetsChange?.(updated);
  };

  const count = widgets.length;

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Top Header Card */}
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
                Your widgets ({count}/{maxWidgets})
              </h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Drag to reorder. Disabled widgets won&apos;t appear on your page.
              </p>
            </div>

            <button
              type="button"
              disabled={count >= maxWidgets}
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-normal transition-all duration-200 cursor-pointer active:scale-95 ${
                count >= maxWidgets
                  ? "bg-white/5 border border-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#609fda]/15 hover:bg-[#609fda]/25 border border-[#609fda]/20 text-white"
              }`}
            >
              <span className="text-[13px] leading-none font-normal text-[#609fda]">+</span>
              <span>Add widget</span>
            </button>
          </div>

          {/* Widget List or Empty State */}
          {count > 0 ? (
            <div className="flex flex-col gap-2.5">
              {widgets.map((w) => (
                <div
                  key={w.id}
                  className="group flex items-center justify-between p-3.5 bg-[#141414]/70 hover:bg-[#161616] border border-white/5 rounded-2xl transition-all duration-150"
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3.5">
                    {/* Drag Handle */}
                    <div className="cursor-grab text-white/20 hover:text-white/60 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                      </svg>
                    </div>

                    {/* Platform Icon */}
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
                      {w.platform === "discord" && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-normal text-white/95 tracking-tight">
                          {w.type === "presence" ? "Discord Presence" : "Discord Server"}
                        </span>
                        {!w.enabled && (
                          <span className="px-2 py-0.5 rounded-[6px] bg-red-500/[0.08] border border-red-500/15 text-[11.5px] text-red-400 font-light tracking-normal leading-none">
                            Disabled
                          </span>
                        )}
                      </div>
                      <span className="text-[11.5px] font-mono text-white/35">
                        {w.targetId}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* 3-Dots Options Menu */}
                    <div className="relative" ref={openMenuId === w.id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === w.id ? null : w.id)}
                        title="Widget options"
                        className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>

                      {openMenuId === w.id && (
                        <div className="absolute right-0 top-full mt-1.5 w-32 bg-[#161616] border border-white/10 rounded-xl shadow-xl py-1 z-30 flex flex-col backdrop-blur-md">
                          <button
                            type="button"
                            onClick={() => handleEditWidget(w)}
                            className="w-full px-3 py-1.5 text-left text-[12.5px] text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleWidget(w.id)}
                            className={`w-full px-3 py-1.5 text-left text-[12.5px] flex items-center gap-2 cursor-pointer transition-colors ${
                              w.enabled
                                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            }`}
                          >
                            {w.enabled ? (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Enable</span>
                              </>
                            )}
                          </button>

                          <div className="h-px bg-white/5 my-1" />

                          <button
                            type="button"
                            onClick={() => handleDeleteWidget(w.id)}
                            className="w-full px-3 py-1.5 text-left text-[12.5px] text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Dashed Empty State Box */
            <div className="w-full border border-dashed border-white/[0.08] rounded-2xl bg-[#141414]/30 py-12 px-6 flex flex-col items-center justify-center text-center transition-colors hover:border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 mb-3 shadow-inner">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="opacity-75"
                >
                  <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z" />
                </svg>
              </div>

              <h3 className="text-[13.5px] font-normal text-white/90 tracking-tight">
                No widgets yet.
              </h3>
              <p className="text-[12.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">
                Add your first widget so visitors can see your live activity.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWidget}
        linkedDiscordId={linkedDiscordId}
        linkedDiscordUsername={linkedDiscordUsername}
      />
    </>
  );
}
