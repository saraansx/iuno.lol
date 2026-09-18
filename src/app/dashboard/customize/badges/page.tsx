import { Metadata } from "next";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Badges",
  description: "Profile badges: Owner, Developer, and Staff.",
};

const BADGES = [
  {
    id: "owner",
    name: "Owner",
    description: "Be a part of the iuno.lol owner team.",
    accent: "#fb923c",
    icon: (
      <path d="M2 8l4 4 6-7 6 7 4-4-1.5 10.5h-17L2 8z" />
    ),
  },
  {
    id: "developer",
    name: "Developer",
    description: "Be a part of the iuno.lol developer team.",
    accent: "#5b6cf5",
    filled: true,
    icon: (
      <path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z" />
    ),
  },
  {
    id: "staff",
    name: "Staff",
    description: "Be a part of the iuno.lol staff team.",
    accent: "#4ade80",
    filled: true,
    icon: (
      <path d="m16.06 13.09 5.63 5.59-3.32 3.28-5.59-5.59v-.92l2.36-2.36h.92m.91-2.53L16 9.6l-4.79 4.8v1.97L5.58 22 2.3 18.68l5.59-5.59h1.97l.78-.78L6.8 8.46H5.5L2.69 5.62 5.31 3l2.8 2.8v1.31L12 10.95l2.66-2.66-.96-1.01L15 5.97h-2.66l-.65-.65L15 2l.66.66v2.66l1.31-1.32 3.28 3.28c1.09 1.1 1.09 2.89 0 3.98l-1.97-2.01-1.31 1.31Z" />
    ),
  },
] as const;

export default function Page() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="border-b border-white/4 pb-5 -mx-12 px-12">
        <Breadcrumb>
          <BreadcrumbList className="text-[13px] gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-white/40 hover:text-white tracking-tight">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbEllipsis className="text-white/40" />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Badges</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-6 pb-2 w-full pt-2">
        <div>
          <div className="flex items-center gap-3">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5b6cf5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <h1 className="text-[20px] font-normal text-white tracking-tight">Badges</h1>
          </div>
          <p className="text-white/40 text-[13px] mt-0.5">Special badges shown on profiles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-white/5 bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm overflow-hidden">
          {BADGES.map((badge) => (
            <div key={badge.id} className="px-5 py-4 flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill={badge.id === "owner" || "filled" in badge ? badge.accent : "none"}
                  stroke={"filled" in badge ? "none" : badge.accent}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                  style={{ filter: `drop-shadow(0 0 8px ${badge.accent}59)` }}
                >
                  {badge.icon}
                </svg>
                <span className="text-[14px] font-medium text-white tracking-tight">{badge.name}</span>
                <span className="ml-auto shrink-0 text-[12px] font-normal text-white/70 bg-white/[0.03] border border-white/15 rounded-lg px-3 py-1">
                  Not available
                </span>
              </div>
              <p className="text-[12.5px] text-white/40 truncate">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
