import { Metadata } from "next";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Leaderboard",
  description: "View the top creators on iuno.lol",
};

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Breadcrumb */}
      <div className="border-b border-white/4 pb-5 -mx-12 px-12 w-full">
        <Breadcrumb>
          <BreadcrumbList className="text-[13px] gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-white/40 hover:text-white tracking-tight">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#609fda] font-normal tracking-tight">Leaderboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* In Progress Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
        <svg className="text-white/15 mb-4" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        </svg>
        
        <h1 className="text-[15px] font-medium text-white tracking-tight">Leaderboard in progress</h1>
        <p className="text-white/30 text-[13px] mt-1.5 max-w-60 mx-auto">
          We&apos;re currently ranking creators. Check back soon to see where you stand.
        </p>
      </div>
    </div>
  );
}
