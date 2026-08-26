"use client";

import { useState, useRef, useEffect } from "react";
import { type TemperatureUnit, TEMPERATURE_UNIT_LABELS } from "@/lib/weather";

interface TemperatureUnitSettingProps {
  value: TemperatureUnit;
  onChange: (val: TemperatureUnit) => void;
}

const UNITS: TemperatureUnit[] = ["celsius", "fahrenheit", "both"];

export default function TemperatureUnitSetting({
  value,
  onChange,
}: TemperatureUnitSettingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Temperature unit
        </span>
        <p className="text-[11.5px] text-white/40">
          Choose Celsius, Fahrenheit, or show both side by side.
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-3 min-w-[120px] px-3.5 h-10 rounded-xl bg-[#161616] border border-white/5 hover:border-white/10 text-[13px] text-white transition-colors cursor-pointer focus:outline-none"
        >
          <span>{TEMPERATURE_UNIT_LABELS[value]}</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white/40 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-44 p-1 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col">
            {UNITS.map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => {
                  onChange(unit);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                  value === unit
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{TEMPERATURE_UNIT_LABELS[unit]}</span>
                {value === unit && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
