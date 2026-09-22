"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface NumberDraftInputProps {
  value: number;
  onCommit: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function NumberDraftInput({
  value,
  onCommit,
  min = 0,
  max,
  step,
  disabled,
  prefix,
  suffix,
  className,
}: NumberDraftInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (n: number) => Math.min(max ?? n, Math.max(min, n));

  return (
    <div
      className={cn(
        "flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]",
        className
      )}
    >
      {prefix && <span className="text-[13px] text-white/30 mr-2">{prefix}</span>}
      <input
        type="number"
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        value={draft ?? String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            setDraft(raw);
            onCommit(min);
            return;
          }
          const parsed = Number(raw);
          if (!Number.isFinite(parsed)) {
            setDraft(raw);
            return;
          }
          const clamped = clamp(parsed);
          setDraft(clamped === parsed ? raw : String(clamped));
          onCommit(clamped);
        }}
        onBlur={() => {
          if (draft !== null && (draft === "" || !Number.isFinite(Number(draft)))) {
            onCommit(min);
          }
          setDraft(null);
        }}
        className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && <span className="text-[13px] text-white/30 ml-2">{suffix}</span>}
    </div>
  );
}