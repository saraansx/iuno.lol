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
      className={`w-full ${
        placement === "outside"
          ? "max-w-[340px] mt-4 flex flex-wrap justify-center gap-3 z-10"
          : "mt-4 w-full flex flex-wrap justify-center gap-3"
      }`}
    >
      {activeWidgets.map((w) => (
        <div
          key={w.id}
          className={`${
            activeWidgets.length === 1
              ? "w-fit max-w-full"
              : "w-full sm:w-[calc(50%-6px)] flex-1 min-w-[160px]"
          }`}
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
