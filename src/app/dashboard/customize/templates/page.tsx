import { Metadata } from "next";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";
import TemplatesClient from "./TemplatesClient";

export const metadata: Metadata = {
  title: "Templates",
  description: "Browse and share profile templates — your current profile becomes the cover.",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="border-b border-white/4 pb-5 -mx-4 px-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
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
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-1 pb-2 w-full pt-2">
        <h1 className="text-[20px] font-normal text-white tracking-tight">Templates</h1>
        <p className="text-white/40 text-[13px] mt-0.5">Browse and share profile templates — your current profile becomes the cover.</p>
      </div>

      <TemplatesClient />
    </div>
  );
}
