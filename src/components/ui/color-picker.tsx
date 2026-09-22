"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface ColorPickerInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return { h: 0, s: 0, v: 100 };
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s, v };
}

function hsvToHex(h: number, s: number, v: number): string {
  h = ((h % 360) + 360) % 360;
  s = s / 100;
  v = v / 100;
  const i = Math.floor((h / 60) % 6);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0, g = 0, b = 0;
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function ColorPickerInput({
  value,
  onChange,
  disabled = false,
  className = "",
}: ColorPickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localInput, setLocalInput] = useState<string | null>(null);

  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(value);
  const currentColor = isValidHex ? value : "#ffffff";
  const hexValue = localInput !== null ? localInput : currentColor.replace("#", "");

  const parsedHsv = hexToHsv(currentColor);

  const [hueState, setHueState] = useState<{ color: string; hue: number }>(() => ({
    color: currentColor,
    hue: parsedHsv.h,
  }));

  let currentHue = hueState.hue;
  if (hueState.color !== currentColor) {
    const nextHue = parsedHsv.s > 0 && parsedHsv.v > 0 ? parsedHsv.h : hueState.hue;
    setHueState({ color: currentColor, hue: nextHue });
    currentHue = nextHue;
  }

  const sat = parsedHsv.s;
  const val = parsedHsv.v;
  const hue = currentHue;

  const popoverRef = useRef<HTMLDivElement>(null);
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
    setLocalInput(raw);
    if (raw.length === 6) {
      const fullHex = "#" + raw;
      onChange(fullHex);
      const nextHsv = hexToHsv(fullHex);
      if (nextHsv.s > 0 && nextHsv.v > 0) {
        setHueState({ color: fullHex, hue: nextHsv.h });
      }
      setLocalInput(null);
    }
  };

  const handleBlur = () => {
    setLocalInput(null);
  };

  const updateSatVal = useCallback(
    (clientX: number, clientY: number) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const s = (x / rect.width) * 100;
      const v = 100 - (y / rect.height) * 100;
      const nextColor = hsvToHex(hue, s, v);
      setHueState({ color: nextColor, hue });
      onChange(nextColor);
    },
    [hue, onChange]
  );

  const handleSatValPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    updateSatVal(e.clientX, e.clientY);

    const onPointerMove = (ev: PointerEvent) => updateSatVal(ev.clientX, ev.clientY);
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const updateHue = useCallback(
    (clientX: number) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const nextHue = Math.min((x / rect.width) * 360, 359.9);
      const currentS = sat === 0 && val === 100 ? 100 : sat;
      const currentV = val === 0 ? 100 : val;
      const nextColor = hsvToHex(nextHue, currentS, currentV);
      setHueState({ color: nextColor, hue: nextHue });
      onChange(nextColor);
    },
    [sat, val, onChange]
  );

  const handleHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    updateHue(e.clientX);

    const onPointerMove = (ev: PointerEvent) => updateHue(ev.clientX);
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleEyeDropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          onChange(result.sRGBHex);
          const nextHsv = hexToHsv(result.sRGBHex);
          if (nextHsv.s > 0 && nextHsv.v > 0) {
            setHueState({ color: result.sRGBHex, hue: nextHsv.h });
          }
        }
      } catch {
      }
    }
  };

  return (
    <div ref={popoverRef} className="relative w-full">
      <div
        className={`flex items-center justify-between bg-[#141414] hover:bg-[#181818] border border-white/5 hover:border-white/10 rounded-xl px-3.5 h-[40px] group transition-all duration-200 focus-within:border-white/20 focus-within:bg-[#181818] focus-within:ring-1 focus-within:ring-white/10 ${
          disabled ? "opacity-40 pointer-events-none" : ""
        } ${className}`}
      >
        <div className="flex items-center flex-1 min-w-0 mr-2">
          <span
            className={`text-[13px] font-mono mr-1.5 select-none transition-colors ${
              disabled ? "text-white/10" : "text-white/25 group-focus-within:text-white/50"
            }`}
          >
            #
          </span>
          <input
            type="text"
            disabled={disabled}
            value={hexValue}
            onChange={handleTextChange}
            onBlur={handleBlur}
            maxLength={6}
            spellCheck={false}
            className={`w-full bg-transparent text-[13px] font-mono tracking-wider focus:outline-none uppercase ${
              disabled ? "text-white/30 cursor-not-allowed" : isValidHex ? "text-white/90" : "text-red-400"
            }`}
          />
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-6 h-6 rounded-lg border border-white/15 shadow-sm overflow-hidden shrink-0 transition-transform duration-150 group-hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-black/40 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          aria-label="Choose color"
        >
          <div
            className="w-full h-full rounded-lg shadow-inner"
            style={{ backgroundColor: currentColor }}
          />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-[220px] bg-[#0f0f0f] border border-white/10 rounded-xl p-2.5 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 select-none">
          <div
            ref={satValRef}
            onPointerDown={handleSatValPointerDown}
            className="relative w-full h-[120px] rounded-lg overflow-hidden cursor-crosshair border border-white/5"
            style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

            <div
              className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm pointer-events-none"
              style={{
                left: `${sat}%`,
                top: `${100 - val}%`,
                backgroundColor: currentColor,
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleEyeDropper}
              title="Pick color from screen"
              className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m14 7 3 3m-9.5 9.5-3.5 1 1-3.5L16.5 4.5a2.12 2.12 0 0 1 3 3Z" />
              </svg>
            </button>

            <div
              ref={hueRef}
              onPointerDown={handleHuePointerDown}
              className="relative flex-1 h-2 rounded-full cursor-pointer overflow-visible"
              style={{
                background:
                  "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
              }}
            >
              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-white bg-black shadow-sm pointer-events-none"
                style={{ left: `${(hue / 360) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
