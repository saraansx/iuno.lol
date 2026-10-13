import type { ReactNode } from "react";

export default function LegalLayout({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black relative">
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-40 h-28 pointer-events-none"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-36 pb-24">
        <p className="text-[11px] font-medium tracking-[0.32em] text-[#8b93e8] uppercase mb-4">
          {eyebrow}
        </p>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-3">
          {title}
        </h1>
        <p className="text-[12.5px] font-mono text-white/30 mb-6">Last updated: {updated}</p>
        <p className="text-white/50 text-[15px] font-light leading-relaxed mb-12">{intro}</p>
        <div className="flex flex-col gap-10">{children}</div>
      </div>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[17px] font-normal text-white/90 tracking-tight">{heading}</h2>
      <div className="flex flex-col gap-3 text-[12.5px] font-light leading-relaxed text-white/55">
        {children}
      </div>
    </section>
  );
}
