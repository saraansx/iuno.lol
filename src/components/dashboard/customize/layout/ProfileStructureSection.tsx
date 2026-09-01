"use client";

export type ProfileStructure = "standard" | "sectioned";

interface StructureOption {
  id: ProfileStructure;
  name: string;
  description: string;
  diagram: React.ReactNode;
}

function DiagramKeyframes() {
  return (
    <style>{`
      @keyframes struct-scroll {
        0%, 12%   { transform: translate3d(0, 0, 0); }
        45%, 62%  { transform: translate3d(0, -18px, 0); }
        88%, 100% { transform: translate3d(0, -34px, 0); }
      }
      @keyframes struct-sections {
        0%, 22%   { transform: translate3d(0, 0, 0); }
        28%, 47%  { transform: translate3d(0, -25%, 0); }
        53%, 72%  { transform: translate3d(0, -50%, 0); }
        78%, 100% { transform: translate3d(0, -75%, 0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .struct-anim { animation: none !important; }
      }
    `}</style>
  );
}

function StandardDiagram() {
  return (
    <div className="w-full h-full p-2.5">
      <div className="w-full h-full rounded-md bg-white/[0.05] border border-white/[0.07] overflow-hidden">
        <div
          className="struct-anim flex flex-col items-center gap-[3px] pt-1.5"
          style={{
            willChange: "transform",
            animation: "struct-scroll 6s ease-in-out infinite alternate",
          }}
        >
          <div className="w-4 h-4 rounded-full bg-white/20 shrink-0" />
          <div className="h-1 w-9 rounded-full bg-white/[0.18]" />
          <div className="h-[3px] w-12 rounded-full bg-white/[0.08]" />
          <div className="flex gap-[3px] pt-[2px]">
            <div className="h-1.5 w-3.5 rounded-sm bg-white/[0.09]" />
            <div className="h-1.5 w-3.5 rounded-sm bg-white/[0.09]" />
          </div>
          <div className="h-2 w-[52px] rounded-sm bg-white/[0.07] mt-[2px]" />
          <div className="h-2 w-[52px] rounded-sm bg-white/[0.06]" />
          <div className="h-2 w-[52px] rounded-sm bg-white/[0.05]" />
          <div className="h-2 w-[52px] rounded-sm bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

function SectionedDiagram() {
  return (
    <div className="w-full h-full p-2.5">
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="struct-anim absolute inset-0 h-[400%] flex flex-col"
          style={{ willChange: "transform", animation: "struct-sections 8s ease-in-out infinite" }}
        >
         <SectionSlide>
            <div className="w-full h-full rounded-md bg-white/[0.05] border border-white/[0.07] flex items-center gap-1.5 px-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-white/20 shrink-0" />
              <div className="flex flex-col gap-1 flex-1">
                <div className="h-1 w-3/4 rounded-full bg-white/[0.14]" />
                <div className="h-1 w-1/2 rounded-full bg-white/[0.08]" />
              </div>
            </div>
          </SectionSlide>
          <SectionSlide>
            <div className="w-full h-full rounded-md bg-white/[0.04] border border-white/[0.06] flex flex-col justify-center gap-1 px-1.5">
              <div className="h-2 w-full rounded-sm bg-white/[0.09]" />
              <div className="h-2 w-full rounded-sm bg-white/[0.07]" />
            </div>
          </SectionSlide>
          <SectionSlide>
            <div className="w-full h-full rounded-md bg-white/[0.03] border border-white/[0.05] flex flex-col justify-center gap-1 px-1.5">
              <div className="h-1 w-full rounded-full bg-white/[0.09]" />
              <div className="h-1 w-2/3 rounded-full bg-white/[0.07]" />
              <div className="h-1 w-1/2 rounded-full bg-white/[0.05]" />
            </div>
          </SectionSlide>
          <SectionSlide>
            <div className="w-full h-full rounded-md bg-white/[0.05] border border-white/[0.07] flex items-center gap-1.5 px-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-white/20 shrink-0" />
              <div className="flex flex-col gap-1 flex-1">
                <div className="h-1 w-3/4 rounded-full bg-white/[0.14]" />
                <div className="h-1 w-1/2 rounded-full bg-white/[0.08]" />
              </div>
            </div>
          </SectionSlide>
        </div>
      </div>
    </div>
  );
}

function SectionSlide({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 min-h-0 py-[1.5px]">{children}</div>;
}

const STRUCTURES: StructureOption[] = [
  {
    id: "standard",
    name: "Standard profile",
    description: "One card with everything on it. Customize it however you like.",
    diagram: <StandardDiagram />,
  },
  {
    id: "sectioned",
    name: "Sectioned profile",
    description: "Split your content into navigable sections.",
    diagram: <SectionedDiagram />,
  },
];

interface ProfileStructureSectionProps {
  structure: ProfileStructure;
  setStructure: (val: ProfileStructure) => void;
}

export default function ProfileStructureSection({
  structure,
  setStructure,
}: ProfileStructureSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <DiagramKeyframes />
      <span className="text-[13px] font-normal text-white/50 tracking-tight">
        Profile structure
      </span>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
        {STRUCTURES.map((option) => {
          const isSelected = structure === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setStructure(option.id)}
              aria-pressed={isSelected}
              className={`group relative h-full flex items-stretch gap-4 p-4 rounded-[16px] border text-left transition-all duration-200 focus:outline-none cursor-pointer ${
                isSelected
                  ? "bg-[#0e1016] border-[#5b6cf5] shadow-[0_0_0_1px_rgba(91,108,245,0.25)]"
                  : "bg-[#0c0c0c] border-white/5 hover:border-white/15 hover:bg-[#0e0e0e]"
              }`}
            >
              <div className="w-[92px] shrink-0 self-center aspect-[4/3] rounded-lg bg-[#0a0a0a] border border-white/[0.06] overflow-hidden">
                {option.diagram}
              </div>

              <div className="flex flex-col justify-center gap-1 min-w-0 pr-8">
                <span
                  className={`text-[13.5px] font-medium leading-tight ${
                    isSelected ? "text-[#5b6cf5]" : "text-white/90"
                  }`}
                >
                  {option.name}
                </span>
                <span className="text-[12px] leading-relaxed text-white/40">
                  {option.description}
                </span>
              </div>

              {isSelected && (
                <svg
                  className="absolute top-3.5 right-3.5 text-[#5b6cf5]"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l4.59-4.58L17 11l-6 6z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
