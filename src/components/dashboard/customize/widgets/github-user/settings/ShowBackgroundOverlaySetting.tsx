"use client";

interface ShowBackgroundOverlaySettingProps {
  value: boolean;
  onChange: (val: boolean) => void;
}

export default function ShowBackgroundOverlaySetting({
  value,
  onChange,
}: ShowBackgroundOverlaySettingProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Background Overlay
        </span>
        <p className="text-[11.5px] text-white/40">
          Display a subtle blurred avatar ambient overlay on card background.
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          value ? "bg-[#609fda]" : "bg-white/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
