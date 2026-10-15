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
  disabled,
  prefix,
  suffix,
  className,
}: NumberDraftInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (n: number) => Math.min(max ?? n, Math.max(min, n));

  const isIntermediate = (raw: string) =>
    raw === "" || raw === "-" || raw === "." || raw === "-." || raw.endsWith(".");

  const commitDraft = (raw: string) => {
    if (raw === "") {
      onCommit(min);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      onCommit(min);
      return;
    }
    onCommit(clamp(parsed));
  };

  return (
    <div
      className={cn(
        "flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]",
        className
      )}
    >
      {prefix && <span className="text-[13px] text-white/30 mr-2">{prefix}</span>}
      <input
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={draft ?? String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          // Let the user type freely — never rewrite what they typed.
          // Keep the raw text visible, only push a clamped value for live preview.
          setDraft(raw);
          if (isIntermediate(raw)) return;
          const parsed = Number(raw);
          if (!Number.isFinite(parsed)) return;
          onCommit(clamp(parsed));
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
      {suffix && <span className="text-[13px] text-white/30 ml-2">{suffix}</span>}
    </div>
  );
}