"use client";

interface ShowBackgroundOverlaySettingProps {
  value: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function ShowBackgroundOverlaySetting({
  value,
  onChange,
  disabled = false,
}: ShowBackgroundOverlaySettingProps) {
  return (
    <div className={`flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl transition-opacity ${disabled ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Background Overlay
        </span>
        <span className="text-[12px] font-normal text-white/40">
          {disabled
            ? "Turn off Server Banner first to enable Icon Background Overlay."
            : "Display a subtle blurred server icon glow in the widget background."}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onChange(!value);
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 ${
          disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
        } rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          value && !disabled ? "bg-[#609fda]" : "bg-white/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value && !disabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
