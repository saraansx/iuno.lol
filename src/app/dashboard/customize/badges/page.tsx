import { Metadata } from "next";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Badges",
  description: "Custom badge settings in progress.",
};

export default function Page() {
return (
    <div className="flex flex-col gap-8 h-full">
        {/* Breadcrumb */}
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
              <BreadcrumbPage className="text-[#609fda] font-normal tracking-tight">Badges</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

        {/* In Progress Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
          <svg className="text-white/15 mb-4" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4l3 3"/>
          </svg>
          
          <h1 className="text-[15px] font-medium text-white tracking-tight">Badges in progress</h1>
          <p className="text-white/30 text-[13px] mt-1.5 max-w-60 mx-auto">
            We&apos;re currently working on this section. Check back soon.
          </p>
        </div>
      </div>
  );
}

