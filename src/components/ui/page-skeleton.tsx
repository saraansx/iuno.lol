export default function PageSkeleton() {
  return (
    <div className="flex flex-col gap-5 h-full animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] border-b border-white/[0.03] pb-3 flex-wrap -mx-12 px-12 w-full">
        <div className="w-14 h-2 bg-white/[0.04] rounded animate-pulse" />
        <div className="w-1 h-1 rounded-full bg-white/[0.06]" />
        <div className="w-14 h-2 bg-white/[0.04] rounded animate-pulse" />
        <div className="w-1 h-1 rounded-full bg-white/[0.06]" />
        <div className="w-10 h-2 bg-white/[0.04] rounded animate-pulse" />
        <div className="w-1 h-1 rounded-full bg-white/[0.06]" />
        <div className="w-12 h-2 bg-white/[0.04] rounded animate-pulse" />
      </div>

      <div className="flex flex-col gap-3 pb-2 w-full pt-2" style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}>
        <div className="flex flex-col gap-1">
          <div className="w-40 h-5 bg-white/[0.04] rounded-lg animate-pulse" />
          <div className="w-56 h-2 bg-white/[0.04] rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="w-20 h-6 bg-white/[0.04] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      <div className="w-full pb-10" style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.04] animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="w-28 h-3.5 bg-white/[0.04] rounded animate-pulse" />
              <div className="w-20 h-2 bg-white/[0.04] rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 h-8 bg-white/[0.04] rounded-lg animate-pulse" />
            <div className="flex-1 h-8 bg-white/[0.04] rounded-lg animate-pulse" />
            <div className="flex-1 h-8 bg-white/[0.04] rounded-lg animate-pulse" />
          </div>
          <div className="w-full h-28 bg-white/[0.04] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
