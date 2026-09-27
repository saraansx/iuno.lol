import { Metadata } from "next";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import ImageHostOverviewClient from "./ImageHostOverviewClient";

export const metadata: Metadata = {
  title: "Image Host — Overview",
  description: "Overview of your hosted images.",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
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
              <BreadcrumbLink asChild>
                <Link href="/dashboard/image-host/overview" className="text-white/40 hover:text-white tracking-tight">Image Host</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <ImageHostOverviewClient />
    </div>
  );
}
