"use client";

import { useState } from "react";

/**
 * Pixel field that can be emptied while typing.
 *
 * A controlled `type="number"` bound straight to the saved value snaps back to
 * `0` the instant the field is cleared, so replacing `24` with `8` means fighting
 * a `0` that reappears mid-edit. Keeping the raw text in local state lets the
 * field sit genuinely empty until a number is typed; it only settles on blur.
 */
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
  // null means "not being edited" — show the saved value instead of a draft.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12.5px] font-medium text-white/90">{label}</label>
      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
        <input
          type="number"
          min={0}
          max={max}
          step={0.1}
          value={draft ?? String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            // An empty field is a valid intermediate state, so nothing is
            // committed until there is a number to commit.
            if (raw === "") return;
            const parsed = Number(raw);
            if (Number.isFinite(parsed)) {
              onChange(Math.max(0, Math.min(max, parsed)));
            }
          }}
          onBlur={() => {
            // Once focus leaves the value has to be a number, so an empty or
            // unparseable field settles to 0.
            if (draft !== null && !Number.isFinite(Number(draft || NaN))) {
              onChange(0);
            }
            setDraft(null);
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
}

/**
 * Size and visibility of the widget card outline.
 *
 * Width and radius are number inputs, matching the Profile Card border controls
 * in the Appearance section. Opacity stays a slider because it is the one value
 * users nudge by eye rather than type — the border colour itself lives with the
 * other colours on the Colors page.
 */
export default function WidgetBorderCustomization({
  borderWidth,
  setBorderWidth,
  borderRadius,
  setBorderRadius,
  borderOpacity,
  setBorderOpacity,
}: WidgetBorderCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
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

        {/* Border Opacity */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[12.5px] font-medium text-white/90">Border Opacity</label>
            <span className="text-[11px] font-mono text-white/40">{borderOpacity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={borderOpacity}
            onChange={(e) => setBorderOpacity(Number(e.target.value))}
            aria-label="Border opacity"
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#609fda]"
          />
          <p className="text-[11px] text-white/40">
            How visible the outline is. Set to 0% to hide the border entirely.
          </p>
        </div>
      </div>
    </div>
  );
}
