"use client";

interface FallbackTextSettingProps {
  value: string;
  onChange: (val: string) => void;
}

export default function FallbackTextSetting({
  value,
  onChange,
}: FallbackTextSettingProps) {
  return (
    <div className="flex flex-col gap-2.5 p-4 bg-[#141414]/70 border border-white/5 rounded-2xl">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Fallback text
        </span>
        <p className="text-[11.5px] text-white/40">
          Shown when there is no activity (and no last-seen info). Leave empty to hide it.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
          <span className="text-[12px] font-serif">T</span>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Currently doing nothing"
          maxLength={100}
          className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-8 pr-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
        />
      </div>
    </div>
  );
}
