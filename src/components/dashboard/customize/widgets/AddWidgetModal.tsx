"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (widget: { platform: string; type: string; useLinked: boolean; customId: string }) => void;
  linkedDiscordId?: string | null;
  linkedDiscordUsername?: string | null;
  hasPresenceWidget?: boolean;
  hasServerWidget?: boolean;
}

const PLATFORMS = [
  { id: "none", name: "None" },
  { id: "discord", name: "Discord" },
];

export default function AddWidgetModal({
  isOpen,
  onClose,
  onAdd,
  linkedDiscordId,
  linkedDiscordUsername,
  hasPresenceWidget = false,
  hasServerWidget = false,
}: AddWidgetModalProps) {
  const isDiscordFullyAdded = hasPresenceWidget && hasServerWidget;
  const [selectedPlatform, setSelectedPlatform] = useState("discord");
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [widgetType, setWidgetType] = useState<"presence" | "server">("presence");
  const [useLinkedAccount, setUseLinkedAccount] = useState(Boolean(linkedDiscordId));
  const [customDiscordId, setCustomDiscordId] = useState("");
  const [serverId, setServerId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlatform("discord");
      setWidgetType(hasPresenceWidget && !hasServerWidget ? "server" : "presence");
      setValidationError(null);
    }
  }, [isOpen, hasPresenceWidget, hasServerWidget]);

  useEffect(() => {
    setValidationError(null);
  }, [selectedPlatform, widgetType, useLinkedAccount, customDiscordId, serverId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPlatformDropdownOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDiscord = selectedPlatform === "discord";
  const isPresence = widgetType === "presence";
  const isServer = widgetType === "server";

  const targetId = isPresence
    ? useLinkedAccount
      ? linkedDiscordId || ""
      : customDiscordId.trim()
    : serverId.trim();

  const isFormatValid = isDiscord
    ? isPresence
      ? hasPresenceWidget
        ? false
        : useLinkedAccount
        ? Boolean(linkedDiscordId)
        : /^\d{17,20}$/.test(customDiscordId.trim())
      : hasServerWidget
      ? false
      : serverId.trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "").length >= 2
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormatValid || !isDiscord || isValidating) return;

    // If using already-linked account, skip external validation API call
    if (isPresence && useLinkedAccount && linkedDiscordId) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: true,
        customId: linkedDiscordId,
      });
      onClose();
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const res = await fetch("/api/widgets/discord/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: widgetType, id: targetId }),
      });
      const result = await res.json();

      if (!result.ok) {
        setValidationError(result.error || "Invalid Discord ID or widget unavailable");
        setIsValidating(false);
        return;
      }

      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } catch {
      setValidationError("Failed to verify Discord ID. Try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[440px] bg-[#0c0c0c] border border-white/10 rounded-[24px] p-6 shadow-2xl z-10 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="text-[16px] font-normal text-white/95 tracking-tight">Add a Widget</h3>
            <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
              Select platform and configure details for your page.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Platform Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-normal text-white/60">Platform</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {selectedPlatform === "discord" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                )}
                <span>{PLATFORMS.find((p) => p.id === selectedPlatform)?.name || "Select platform"}</span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-white/40 transition-transform duration-200 ${isPlatformDropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isPlatformDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 p-1 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col gap-0.5">
                {PLATFORMS.map((platform) => {
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setIsPlatformDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                        selectedPlatform === platform.id
                          ? "bg-white/10 text-white font-normal"
                          : "text-white/50 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {platform.id === "discord" && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        )}
                        <span>{platform.name}</span>
                      </div>
                      {selectedPlatform === platform.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#609fda]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {isDiscord && (
          <>
            {/* Widget Type */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-normal text-white/60">Type</label>
              <div className="flex items-center gap-1.5 p-1 bg-[#161616] border border-white/5 rounded-xl">
                <button
                  type="button"
                  disabled={hasPresenceWidget}
                  onClick={() => setWidgetType("presence")}
                  className={`flex-1 py-2 px-3 rounded-lg text-[12.5px] font-normal transition-all ${
                    hasPresenceWidget
                      ? "opacity-30 cursor-not-allowed text-white/30 bg-transparent"
                      : widgetType === "presence"
                      ? "bg-white/[0.08] text-white shadow-sm cursor-pointer"
                      : "text-white/40 hover:text-white/70 cursor-pointer"
                  }`}
                >
                  Discord Presence
                </button>
                <button
                  type="button"
                  disabled={hasServerWidget}
                  onClick={() => setWidgetType("server")}
                  className={`flex-1 py-2 px-3 rounded-lg text-[12.5px] font-normal transition-all ${
                    hasServerWidget
                      ? "opacity-30 cursor-not-allowed text-white/30 bg-transparent"
                      : widgetType === "server"
                      ? "bg-white/[0.08] text-white shadow-sm cursor-pointer"
                      : "text-white/40 hover:text-white/70 cursor-pointer"
                  }`}
                >
                  Discord Server
                </button>
              </div>
            </div>

            {/* Discord Presence Settings */}
            {isPresence && (
              <>
                {/* Linked Discord Account Toggle / Link Button */}
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#141414]/60 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-normal text-white/90">Use connected Discord</span>
                      <span className="text-[11.5px] text-white/35">
                        {linkedDiscordId && linkedDiscordUsername
                          ? `@${linkedDiscordUsername}`
                          : "No Discord account connected"}
                      </span>
                    </div>

                    {linkedDiscordId ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={useLinkedAccount}
                        onClick={() => setUseLinkedAccount(!useLinkedAccount)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          useLinkedAccount ? "bg-[#609fda]" : "bg-white/10"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${
                            useLinkedAccount ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href="/api/auth/discord"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#609fda]/15 hover:bg-[#609fda]/25 border border-[#609fda]/20 text-[12px] font-normal text-white transition-all cursor-pointer active:scale-95"
                      >
                        <span>Link account</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#609fda] opacity-80">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Discord User ID Input */}
                <div className={`flex flex-col gap-1.5 transition-opacity duration-200 ${useLinkedAccount && linkedDiscordId ? "opacity-35 pointer-events-none" : "opacity-100"}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-normal text-white/60">Discord User ID</label>
                    {useLinkedAccount && linkedDiscordId && (
                      <span className="text-[11px] text-white/40">Using connected account ID</span>
                    )}
                  </div>
                  <div className={`flex items-center bg-[#161616] border rounded-xl px-3.5 h-[40px] transition-colors ${useLinkedAccount && linkedDiscordId ? "border-white/5 bg-[#121212]" : "border-white/5 focus-within:border-white/15"}`}>
                    <input
                      type="text"
                      disabled={Boolean(useLinkedAccount && linkedDiscordId)}
                      value={useLinkedAccount && linkedDiscordId ? linkedDiscordId : customDiscordId}
                      onChange={(e) => setCustomDiscordId(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 1024354678901234567"
                      maxLength={20}
                      className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none disabled:text-white/40"
                    />
                  </div>
                  <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                    Settings → Advanced → Enable Developer Mode → Right-click profile → Copy User ID.
                  </p>
                </div>
              </>
            )}

            {/* Discord Server Settings */}
            {isServer && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                <label className="text-[12px] font-normal text-white/60">Discord Server Invite Code</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
                  <input
                    type="text"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    placeholder="e.g. QgZEkJjF8q"
                    maxLength={100}
                    className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                  The code from your permanent invite link (e.g. &apos;QgZEkJjF8q&apos; from discord.gg/QgZEkJjF8q).
                </p>
              </div>
            )}
          </>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[12.5px] text-red-400 font-normal animate-in fade-in duration-150">
            {validationError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-normal text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isFormatValid || isValidating}
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-xl text-[13px] font-normal transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[95px] ${
              isFormatValid && !isValidating
                ? "bg-[#609fda]/20 hover:bg-[#609fda]/30 border border-[#609fda]/30 text-white"
                : "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            {isValidating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Checking...</span>
              </>
            ) : (
              "Add Widget"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
