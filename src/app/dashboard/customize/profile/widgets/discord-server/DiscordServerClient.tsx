"use client";

import { useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { toast } from "sonner";

export default function DiscordServerClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("widgetId");
  const isEditing = Boolean(widgetId);
  const targetId = searchParams.get("id") || "";

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    if (isEditing) {
      updated = existingList.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              targetId,
            }
          : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}`,
        platform: "discord",
        type: "server",
        targetId,
        useLinked: false,
        enabled: true,
      };
      updated = [newWidget, ...existingList];
    }

    startTransition(async () => {
      try {
        const res = await updateProfileWidgets({
          username: user.username,
          widgets: updated,
        });
        if (res.success) {
          toast.success(isEditing ? "Widget saved successfully" : "Widget added successfully");
          router.push("/dashboard/customize/profile/widgets");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save widget");
      }
    });
  };

  return (
    <>
      {/* Settings Content Container */}
      <div className="w-full max-w-4xl flex flex-col gap-6 pb-20">
        {/* Placeholder Card */}
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
              {isEditing ? "Edit Discord Server" : "Discord Server Settings"}
            </h2>
            <span className="text-[12px] font-mono text-white/40">Guild ID: {targetId}</span>
          </div>
          <p className="text-[12.5px] font-normal text-white/40 leading-relaxed">
            Live member count, server icon, and instant join invite will be displayed on your profile.
          </p>
        </div>
      </div>

      {/* Floating Save/Add Widget Bar */}
      <SaveBar
        show={true}
        onSave={handleSaveWidgetConfirm}
        onRevert={() => router.push("/dashboard/customize/profile/widgets")}
        saveLabel={isEditing ? "Save" : "Add widget"}
        revertLabel="Cancel"
      />
    </>
  );
}
