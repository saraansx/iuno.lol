"use client";

interface ResetButtonProps {
  onClick: () => void;
  label?: string;
  title?: string;
  disabled?: boolean;
  className?: string;
}

export default function ResetButton({
  onClick,
  label = "Reset",
  title = "Reset to default",
  disabled = false,
  className = "",
}: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 text-white/40 hover:text-white/85 text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
