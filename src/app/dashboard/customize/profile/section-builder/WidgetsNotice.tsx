export default function WidgetsNotice() {
  return (
    <div inert className="flex gap-3.5 bg-[#e0a355]/[0.04] border border-[#e0a355]/15 rounded-[16px] px-4 py-3.5">
      <svg className="text-[#e0a355]/70 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[14px] font-normal text-white/90 tracking-tight">
          Widgets section is not managed here
        </span>
        <p className="text-[12.5px] text-white/40">
          Controlled by your widgets section — go to Widgets to edit them.
        </p>
      </div>
    </div>
  );
}
