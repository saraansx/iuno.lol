"use client";

import { useState } from "react";
import ColorPickerInput from "@/components/ui/color-picker";

function PixelInput({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max: number;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commitDraft = (raw: string) => {
    if (raw === "") {
      onChange(0);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      onChange(0);
      return;
    }
    onChange(Math.max(0, Math.min(max, parsed)));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12.5px] font-medium text-white/90">{label}</label>
      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
        <input
          type="text"
          inputMode="decimal"
          value={draft ?? String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            if (raw === "" || raw === "." || raw.endsWith(".")) return;
            const parsed = Number(raw);
            if (!Number.isFinite(parsed)) return;
            onChange(Math.max(0, Math.min(max, parsed)));
          }}
          onBlur={() => {
            if (draft !== null) commitDraft(draft.trim());
            setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-[13px] text-white/30 ml-2">px</span>
      </div>
    </div>
  );
}

interface WidgetBorderCustomizationProps {
  borderWidth: number;
  setBorderWidth: (val: number) => void;
  borderRadius: number;
  setBorderRadius: (val: number) => void;
  borderOpacity: number;
  setBorderOpacity: (val: number) => void;
  cardColor: string | null;
  setCardColor: (val: string | null) => void;
  cardOpacity: number;
  setCardOpacity: (val: number) => void;
}

const DEFAULT_WIDGET_CARD_COLOR = "#101010";

export default function WidgetBorderCustomization({
  borderWidth,
  setBorderWidth,
  borderRadius,
  setBorderRadius,
  borderOpacity,
  setBorderOpacity,
  cardColor,
  setCardColor,
  cardOpacity,
  setCardOpacity,
}: WidgetBorderCustomizationProps) {
  return (
    <>
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
            Widgets background
          </h2>
          <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
            Color and transparency of each widget card.
          </p>
        </div>
        {(cardColor !== null || cardOpacity !== 80) && (
          <button
            type="button"
            onClick={() => {
              setCardColor(null);
              setCardOpacity(80);
            }}
            className="text-[11.5px] text-white/45 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            Reset
          </button>
        )}
      </div>

      <ColorPickerInput value={cardColor ?? DEFAULT_WIDGET_CARD_COLOR} onChange={(v) => setCardColor(v.toLowerCase())} />

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[12.5px] font-medium text-white/90">Opacity</label>
          <span className="text-[12px] text-white/40 font-mono">{cardOpacity}%</span>
        </div>
        <div className="relative flex items-center h-5 group w-full">
          <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="absolute h-full bg-[#5b6cf5]" style={{ width: `${cardOpacity}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={cardOpacity}
            onChange={(e) => setCardOpacity(Number(e.target.value))}
            aria-label="Widget card opacity"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          <div
            className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform group-active:scale-110 shadow-lg"
            style={{ left: `calc(${cardOpacity}% - 8px)` }}
          />
        </div>
        <p className="text-[11px] text-white/40">
          Set to 0% to make the cards fully see-through.
        </p>
      </div>
    </div>

    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col">
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
          Widgets border
        </h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Size and visibility of the outline around each widget card. Set the color on the Colors page.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <PixelInput
            label="Border Width"
            value={borderWidth}
            onChange={setBorderWidth}
            max={20}
          />
          <PixelInput
            label="Border Radius"
            value={borderRadius}
            onChange={setBorderRadius}
            max={100}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[12.5px] font-medium text-white/90">Border Opacity</label>
            <span className="text-[12px] text-white/40 font-mono">{borderOpacity}%</span>
          </div>
          <div className="relative flex items-center h-5 group w-full">
            <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-[#5b6cf5]"
                style={{ width: `${borderOpacity}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={borderOpacity}
              onChange={(e) => setBorderOpacity(Number(e.target.value))}
              aria-label="Border opacity"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div
              className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform group-active:scale-110 shadow-lg"
              style={{ left: `calc(${borderOpacity}% - 8px)` }}
            />
          </div>
          <p className="text-[11px] text-white/40">
            How visible the outline is. Set to 0% to hide the border entirely.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
