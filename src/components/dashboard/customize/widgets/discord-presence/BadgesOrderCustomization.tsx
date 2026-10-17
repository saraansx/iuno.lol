"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface BadgeItemData {
  id: string;
  name: string;
  icon: string;
}

interface BadgesOrderCustomizationProps {
  availableBadges: BadgeItemData[];
  badgeOrder: string[];
  hiddenBadges: string[];
  onOrderChange: (newOrder: string[]) => void;
  onHiddenChange: (newHidden: string[]) => void;
}

export default function BadgesOrderCustomization({
  availableBadges,
  badgeOrder,
  hiddenBadges,
  onOrderChange,
  onHiddenChange,
}: BadgesOrderCustomizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragCardSize, setDragCardSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [targetHoverId, setTargetHoverId] = useState<string | null>(null);

  const activeDragIdRef = useRef<string | null>(null);
  const targetHoverIdRef = useRef<string | null>(null);

  const sortedBadges = (availableBadges || []).sort((a, b) => {
    const idxA = badgeOrder.indexOf(a.id);
    const idxB = badgeOrder.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const handleToggleBadge = (badgeId: string) => {
    if (hiddenBadges.includes(badgeId)) {
      onHiddenChange(hiddenBadges.filter((id) => id !== badgeId));
    } else {
      onHiddenChange([...hiddenBadges, badgeId]);
    }
  };

  const handlePointerDown = (e: React.PointerEvent, badgeId: string) => {
    if (e.button !== 0) return;

    const card = (e.currentTarget as HTMLElement).closest("[data-badge-id]") as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setActiveDragId(badgeId);
    activeDragIdRef.current = badgeId;
    setDragOffset({ x: offsetX, y: offsetY });
    setDragCardSize({ width: rect.width, height: rect.height });
    setDragPos({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    setTargetHoverId(badgeId);
    targetHoverIdRef.current = badgeId;

    e.preventDefault();
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!activeDragIdRef.current) return;

      setDragPos((prev) => {
        if (!prev) return null;
        return {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
      });

      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      let foundTargetId: string | null = null;

      for (const el of elements) {
        const badgeElem = el.closest("[data-badge-id]") as HTMLElement;
        if (badgeElem && badgeElem.dataset.badgeId) {
          foundTargetId = badgeElem.dataset.badgeId;
          break;
        }
      }

      if (foundTargetId && foundTargetId !== targetHoverIdRef.current) {
        setTargetHoverId(foundTargetId);
        targetHoverIdRef.current = foundTargetId;
      }
    };

    const handlePointerUp = () => {
      const draggedId = activeDragIdRef.current;
      const dropTargetId = targetHoverIdRef.current;

      if (draggedId && dropTargetId && draggedId !== dropTargetId) {
        const currentIds = sortedBadges.map((b) => b.id);
        const fromIndex = currentIds.indexOf(draggedId);
        const toIndex = currentIds.indexOf(dropTargetId);

        if (fromIndex !== -1 && toIndex !== -1) {
          const [moved] = currentIds.splice(fromIndex, 1);
          currentIds.splice(toIndex, 0, moved);
          onOrderChange(currentIds);
        }
      }

      setActiveDragId(null);
      activeDragIdRef.current = null;
      setTargetHoverId(null);
      targetHoverIdRef.current = null;
      setDragPos(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragOffset, onOrderChange, sortedBadges]);

  if (!availableBadges || availableBadges.length === 0) {
    return null;
  }

  const activeDraggingBadge = sortedBadges.find((b) => b.id === activeDragId);

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6 select-none relative">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Badges & Order
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Choose which Discord badges appear and drag to reorder them. Only badges your account actually has show up on the card.
        </p>
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
      >
        {sortedBadges.map((badge) => {
          const isEnabled = !hiddenBadges.includes(badge.id);
          const isBeingDragged = activeDragId === badge.id;
          const isDropTarget = targetHoverId === badge.id && activeDragId !== badge.id;

          return (
            <div
              key={badge.id}
              data-badge-id={badge.id}
              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-150 ${
                isBeingDragged
                  ? "opacity-25 border border-white/5 bg-[#141414]"
                  : isDropTarget
                  ? "bg-white/[0.04] border border-white/20"
                  : "bg-[#141414] border border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  onPointerDown={(e) => handlePointerDown(e, badge.id)}
                  className="text-white/30 hover:text-white/80 flex items-center justify-center shrink-0 p-1 cursor-grab active:cursor-grabbing touch-none transition-colors"
                  title="Drag anywhere"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                  </svg>
                </div>

                <div className="relative w-5 h-5 flex items-center justify-center shrink-0 pointer-events-none">
                  <Image
                    src={badge.icon}
                    alt={badge.name}
                    width={20}
                    height={20}
                    className="object-contain"
                    unoptimized
                  />
                </div>

                <span className="text-[13px] font-normal text-white/90 tracking-tight truncate pointer-events-none">
                  {badge.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleBadge(badge.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEnabled ? "bg-[#5b6cf5]" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {activeDraggingBadge && dragPos && (
        <div
          style={{
            position: "fixed",
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
            width: `${dragCardSize.width}px`,
            height: `${dragCardSize.height}px`,
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className="flex items-center justify-between px-3.5 py-3 rounded-2xl bg-[#161616] border border-white/20 shadow-none"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="text-white/60 flex items-center justify-center shrink-0 p-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </div>

            <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
              <Image
                src={activeDraggingBadge.icon}
                alt={activeDraggingBadge.name}
                width={20}
                height={20}
                className="object-contain"
                unoptimized
              />
            </div>

            <span className="text-[13px] font-normal text-white/90 tracking-tight truncate">
              {activeDraggingBadge.name}
            </span>
          </div>

          <div
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent ${
              !hiddenBadges.includes(activeDraggingBadge.id) ? "bg-[#5b6cf5]" : "bg-white/10"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white ${
                !hiddenBadges.includes(activeDraggingBadge.id) ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
