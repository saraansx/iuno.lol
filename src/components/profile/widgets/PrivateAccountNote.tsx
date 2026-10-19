import { LockIcon } from "./WidgetIcons";

export default function PrivateAccountNote({
  label = "Private account · stats unavailable",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[12px] font-normal leading-tight text-amber-400/80 min-w-0 ${className}`}
    >
      <LockIcon size={12} className="w-3 h-3 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
