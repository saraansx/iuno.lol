import Link from "next/link";

export type CompletionStep = { label: string; done: boolean; href: string };

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProfileCompletion({ steps }: { steps: CompletionStep[] }) {
  const done = steps.filter((s) => s.done).length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  const next = steps.find((s) => !s.done);

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-5 h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Profile completion</h2>
          <p className="text-[12px] text-white/40 mt-0.5">
            {next ? `${steps.length - done} step${steps.length - done === 1 ? "" : "s"} left to a complete profile.` : "Your profile is fully set up."}
          </p>
        </div>
        <span className="text-[11px] font-normal rounded-full px-2.5 py-0.5 border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 shrink-0">
          {done}/{steps.length}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative shrink-0 w-[120px] h-[120px]" role="img" aria-label={`Profile ${pct}% complete`}>
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="#5b6cf5"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[24px] font-normal text-white leading-none">{pct}%</span>
            <span className="text-[10.5px] text-white/40 mt-1">complete</span>
          </div>
        </div>

        <ul className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
          {steps.map((s) => (
            <li key={s.label}>
              <Link
                href={s.href}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04] ${
                  s.done ? "text-white/40" : "text-white/80"
                }`}
              >
                <span
                  className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center border ${
                    s.done ? "bg-[#5b6cf5] border-[#5b6cf5]" : "border-white/20 group-hover:border-[#5b6cf5]/60"
                  }`}
                  aria-hidden="true"
                >
                  {s.done && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className={`text-[12.5px] truncate ${s.done ? "line-through decoration-white/20" : ""}`}>{s.label}</span>
                <span className="sr-only">{s.done ? "(done)" : "(not done)"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {next && (
        <Link
          href={next.href}
          className="mt-auto flex items-center justify-between gap-3 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/20 px-4 py-2.5 text-[13px] font-normal text-white transition-colors"
        >
          <span className="truncate">Next: {next.label}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
