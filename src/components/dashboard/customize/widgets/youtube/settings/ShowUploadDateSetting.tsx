"use client";

interface ShowUploadDateSettingProps {
  value: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function ShowUploadDateSetting({
  value,
  onChange,
  disabled = false,
}: ShowUploadDateSettingProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl transition-opacity duration-200 ${
        disabled ? "opacity-40 pointer-events-none select-none" : ""
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Show upload date
        </span>
        <span className="text-[12px] font-normal text-white/40">
          Display how long ago the latest video was uploaded.
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onChange(!value);
        }}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          value ? "bg-[#609fda]" : "bg-white/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
