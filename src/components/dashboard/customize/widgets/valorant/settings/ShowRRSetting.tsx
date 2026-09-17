"use client";

interface ShowRRSettingProps {
  value: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function ShowRRSetting({ value, onChange, disabled = false }: ShowRRSettingProps) {
  return (
    <div className={`flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl transition-opacity ${disabled ? "opacity-50" : ""}`}>
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Show RR
        </span>
        <span className="text-[12px] font-normal text-white/40">
          Display your Ranked Rating (points within your current tier). Only applies in Current rank mode.
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value && !disabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"} rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          value && !disabled ? "bg-[#5b6cf5]" : "bg-white/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value && !disabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
