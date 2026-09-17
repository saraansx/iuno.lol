"use client";

interface ShowForksSettingProps {
  value: boolean;
  onChange: (val: boolean) => void;
}

export default function ShowForksSetting({
  value,
  onChange,
}: ShowForksSettingProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Show Forks
        </span>
        <p className="text-[11.5px] text-white/40">
          Display repository forks count.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          value ? "bg-[#5b6cf5]" : "bg-white/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
