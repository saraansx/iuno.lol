"use client";

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function SpotifyToggleSetting({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleSettingProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl transition-opacity ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          {label}
        </span>
        <p className="text-[11.5px] text-white/40">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
          checked ? "bg-[#609fda]" : "bg-white/10"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
