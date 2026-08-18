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

  return (
    <div
      className={`w-full mt-4 grid grid-cols-1 ${
        activeWidgets.length === 1 ? "" : "min-[640px]:grid-cols-2"
      } gap-3 ${placement === "outside" ? "z-10" : ""}`}
    >
      {activeWidgets.map((w) => (
        <div
          key={w.id}
          className="w-full min-w-0"
        >
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
