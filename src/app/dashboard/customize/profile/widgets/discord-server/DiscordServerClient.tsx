"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useDiscordServer } from "@/lib/hooks/useDiscordServer";
import ServerCustomization from "@/components/dashboard/customize/widgets/discord-server/ServerCustomization";
import { toast } from "sonner";

export default function DiscordServerClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("widgetId");
  const isEditing = Boolean(widgetId);

  const initialTargetId = searchParams.get("id") || "";
  const currentWidget = ((user?.widgets as WidgetItem[]) || []).find((w) => w.id === widgetId);
  const initialImageShape = currentWidget?.imageShape || "rounded";
  const initialShowMemberCount = currentWidget?.showMemberCount !== undefined ? currentWidget.showMemberCount : true;
  const initialShowOnlineCount = currentWidget?.showOnlineCount !== undefined ? currentWidget.showOnlineCount : true;
  const initialShowBanner = currentWidget?.showBanner !== undefined ? currentWidget.showBanner : true;
  const initialShowBackgroundOverlay = currentWidget?.showBackgroundOverlay !== undefined ? currentWidget.showBackgroundOverlay : false;
  const initialShowViewButton = currentWidget?.showViewButton !== undefined ? currentWidget.showViewButton : true;
  const initialPlacement = currentWidget?.placement || "inside";

  const [inviteCode, setInviteCode] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showMemberCount, setShowMemberCount] = useState<boolean>(initialShowMemberCount);
  const [showOnlineCount, setShowOnlineCount] = useState<boolean>(initialShowOnlineCount);
  const [showBanner, setShowBanner] = useState<boolean>(initialShowBanner);
  const [showBackgroundOverlay, setShowBackgroundOverlay] = useState<boolean>(initialShowBackgroundOverlay);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const cleanInvite = inviteCode.trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "");

  const { data: serverData, loading: loadingPreview, isValidCode } = useDiscordServer(cleanInvite);

  const isChanged =
    cleanInvite !== initialTargetId ||
    imageShape !== initialImageShape ||
    showMemberCount !== initialShowMemberCount ||
    showOnlineCount !== initialShowOnlineCount ||
    showBanner !== initialShowBanner ||
    showBackgroundOverlay !== initialShowBackgroundOverlay ||
    showViewButton !== initialShowViewButton ||
    placement !== initialPlacement;

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidCode) {
      toast.error("Please enter a valid Discord invite code (e.g. QgZEkJjF8q)");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    if (isEditing) {
      updated = existingList.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              targetId: cleanInvite,
              imageShape,
              showMemberCount,
              showOnlineCount,
              showBanner,
              showBackgroundOverlay,
              showViewButton,
              placement,
            }
          : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}`,
        platform: "discord",
        type: "server",
        targetId: cleanInvite,
        useLinked: false,
        enabled: true,
        imageShape,
        showMemberCount,
        showOnlineCount,
        showBanner,
        showBackgroundOverlay,
        showViewButton,
        placement,
      };
      updated = [newWidget, ...existingList];
    }

    startTransition(async () => {
      try {
        const res = await updateProfileWidgets({
          username: user.username,
          widgets: updated,
        });
        if (res?.success) {
          toast.success(isEditing ? "Widget saved successfully" : "Widget added successfully");
          router.push("/dashboard/customize/profile/widgets");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save widget");
      }
    });
  };

  const handleRevert = () => {
    if (isEditing) {
      setInviteCode(initialTargetId);
      setImageShape(initialImageShape);
      setShowMemberCount(initialShowMemberCount);
      setShowOnlineCount(initialShowOnlineCount);
      setShowBanner(initialShowBanner);
      setShowBackgroundOverlay(initialShowBackgroundOverlay);
      setShowViewButton(initialShowViewButton);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const guild = serverData?.guild;
  const iconUrl = guild?.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${
        guild.icon.startsWith("a_") ? "gif" : "png"
      }?size=128`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const bannerUrl = guild?.banner
    ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${
        guild.banner.startsWith("a_") ? "gif" : "png"
      }?size=1024`
    : guild?.splash
    ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png?size=1024`
    : null;

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        {/* Top 2-Column Grid: Account on Left, Live Preview on Right */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Account Settings Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which account this widget should fetch.
              </p>
            </div>

            {/* Invite Code Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Invite Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="e.g. QgZEkJjF8q"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                The code from your invite link (e.g. &apos;QgZEkJjF8q&apos; from discord.gg/QgZEkJjF8q). Use a permanent invite so the widget keeps working.
              </p>
            </div>
          </div>

          {/* Right Side: Live Discord Server Preview Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!isValidCode ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a valid Discord invite code to see live preview
                  </span>
                </div>
              ) : loadingPreview && !serverData ? (
                /* Static dark glass skeleton loader matching server widget */
                <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
                  <div className="flex items-center gap-3.5 min-w-0 w-full">
                    <div
                      className={`w-[60px] h-[60px] shrink-0 bg-white/[0.05] ${
                        imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
                      }`}
                    />
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
                      <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
                    </div>
                  </div>
                </div>
              ) : !guild ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Server not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find server for this invite code.
                    </span>
                  </div>
                </div>
              ) : (
                /* Live Discord Server Widget Card */
                <a
                  href={`https://discord.gg/${encodeURIComponent(cleanInvite)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
                >
                  {/* Top-Right Redirect Badge */}
                  {showViewButton && (
                    <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </div>
                  )}

                  {/* Background Layer: Banner, Icon Ambient Overlay, or none */}
                  {showBanner && bannerUrl ? (
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <Image
                        src={bannerUrl}
                        alt="Server banner"
                        fill
                        className="object-cover opacity-60 filter blur-[0.5px]"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/80 via-[#101010]/50 to-[#101010]/30" />
                    </div>
                  ) : showBackgroundOverlay && iconUrl ? (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={iconUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-45 filter blur-[10px] scale-125"
                      />
                      <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
                    {/* Server Icon */}
                    <div
                      className={`relative w-[60px] h-[60px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm ${
                        imageShape === "square"
                          ? "rounded-none"
                          : imageShape === "circle"
                          ? "rounded-full"
                          : "rounded-2xl"
                      }`}
                    >
                      <Image
                        src={iconUrl}
                        alt={guild.name}
                        fill
                        sizes="60px"
                        priority
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Server Info + Stats */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[15px] font-normal text-white tracking-tight truncate">
                          {guild.name}
                        </span>
                      </div>

                      {/* Online + Total Member Counts */}
                      {(showOnlineCount || showMemberCount) && (
                        <div className="flex items-center gap-2.5 text-[13px] text-white/60 font-normal whitespace-nowrap">
                          {showOnlineCount && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="w-2 h-2 rounded-full bg-[#23a55a] shrink-0" />
                              <span>{Number(serverData.approximate_presence_count || 0).toLocaleString()}</span>
                            </div>
                          )}
                          {showMemberCount && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="w-2 h-2 rounded-full bg-[#80848e] shrink-0" />
                              <span>{Number(serverData.approximate_member_count || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Dedicated Full-Width Server Customization Container */}
        <ServerCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showMemberCount={showMemberCount}
          onShowMemberCountChange={setShowMemberCount}
          showOnlineCount={showOnlineCount}
          onShowOnlineCountChange={setShowOnlineCount}
          showBanner={showBanner}
          onShowBannerChange={setShowBanner}
          showBackgroundOverlay={showBackgroundOverlay}
          onShowBackgroundOverlayChange={setShowBackgroundOverlay}
          showViewButton={showViewButton}
          onShowViewButtonChange={setShowViewButton}
        />
      </div>

      {/* Floating Save/Add Widget Bar */}
      <SaveBar
        show={isChanged || !isEditing}
        onSave={handleSaveWidgetConfirm}
        onRevert={handleRevert}
        saveLabel={isEditing ? "Save" : "Add widget"}
        revertLabel={isEditing ? "Revert" : "Cancel"}
      />
    </>
  );
}
