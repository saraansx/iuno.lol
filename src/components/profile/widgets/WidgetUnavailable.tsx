export default function WidgetUnavailable({
  imageShape,
  label,
  description,
}: {
  imageShape?: string;
  label?: string;
  description?: string;
}) {
  const shapeClass =
    imageShape === "square"
      ? "rounded-none"
      : imageShape === "circle"
      ? "rounded-full"
      : "rounded-2xl";

  return (
    <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
      <div className="flex items-center gap-3.5 min-w-0 w-full">
        <div
          className={`w-[74px] h-[74px] shrink-0 bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/25 ${shapeClass}`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12.5" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          <span className="text-[14.5px] font-normal text-white/95 tracking-tight truncate">
            Couldn&apos;t load
          </span>
          <span className="text-[12.5px] font-normal leading-tight text-white/40 truncate">
            {description ?? (label ? `This ${label} is unavailable` : "This content is unavailable")}
          </span>
        </div>
      </div>
    </div>
  );
}
