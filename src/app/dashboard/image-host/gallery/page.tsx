import { Metadata } from "next";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import ImageHostGalleryClient from "./ImageHostGalleryClient";

export const metadata: Metadata = {
  title: "Image Host — Gallery",
  description: "Browse and manage everything in your image host.",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
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
              <BreadcrumbLink asChild>
                <Link href="/dashboard/image-host/overview" className="text-white/40 hover:text-white tracking-tight">Image Host</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Gallery</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-1 pb-2 w-full pt-2">
        <h1 className="text-[20px] font-normal text-white tracking-tight">Gallery</h1>
        <p className="text-white/40 text-[13px] mt-0.5">Browse and manage everything in your image host.</p>
      </div>

      <ImageHostGalleryClient />
    </div>
  );
}
