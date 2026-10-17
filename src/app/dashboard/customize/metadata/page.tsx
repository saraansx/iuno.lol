import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { buildOgImagePath } from "@/lib/og";
import MetadataProfileClient from "./MetadataProfileClient";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metadata",
  description: "Control how your profile appears in shared links.",
};

export default async function Page() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/signin');
  }

  const user = await getUserById(userId);

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
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Metadata</BreadcrumbPage>
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
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <h1 className="text-[20px] font-normal text-white tracking-tight">Profile Metadata</h1>
          </div>
          <p className="text-white/40 text-[13px] mt-0.5">Control how your profile looks when someone shares your link</p>
        </div>
      </div>

      <MetadataProfileClient
        user={user}
        ogImagePath={
          user?.username
            ? buildOgImagePath(user.username, user)
            : null
        }
      />
    </div>
  );
}
