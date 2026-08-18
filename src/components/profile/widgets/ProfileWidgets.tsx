"use client";

import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import DiscordPresenceWidget from "./DiscordPresenceWidget";
import DiscordServerWidget from "./DiscordServerWidget";

export default function ProfileWidgets({
  widgets = [],
  placement = "inside",
}: {
  widgets?: WidgetItem[];
  placement?: "inside" | "outside";
}) {
  const activeWidgets = (widgets || []).filter(
    (w) => w.enabled && (w.placement || "inside") === placement
  );

  if (activeWidgets.length === 0) return null;

  if (activeWidgets.length === 1) {
    const w = activeWidgets[0];
    return (
      <div
        className={`w-full mt-4 flex justify-center items-center ${
          placement === "outside" ? "z-10" : ""
        }`}
      >
        <div className="w-full max-w-[340px]">
          {w.type === "presence" ? (
            <DiscordPresenceWidget widget={w} />
          ) : (
            <DiscordServerWidget widget={w} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full mt-4 grid grid-cols-1 min-[640px]:grid-cols-2 gap-3 ${
        placement === "outside" ? "z-10" : ""
      }`}
    >
      {activeWidgets.map((w) => (
        <div key={w.id} className="w-full min-w-0">
          {w.type === "presence" ? (
            <DiscordPresenceWidget widget={w} />
          ) : (
            <DiscordServerWidget widget={w} />
          )}
        </div>
      ))}
    </div>
  );
}
