import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { Metadata } from "next";
import FontsProfileClient from "./FontsProfileClient";
import ProfileCustomizeNav from "@/components/dashboard/ProfileCustomizeNav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fonts",
  description: "Font profile settings.",
};

export default async function Page() {
  const userId = await getSessionUserId();
  const user = userId ? await getUserById(userId) : null;

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
              <BreadcrumbLink asChild>
                <Link href="/dashboard/customize/profile/general" className="text-white/40 hover:text-white tracking-tight">Profile</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#609fda] font-normal tracking-tight">Fonts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-6 pb-2 w-full pt-2" style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}>
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
              <path d="M4 7V4h16v3M9 20h6M12 4v16" />
            </svg>
            <h1 className="text-[20px] font-normal text-white tracking-tight">Font Customization</h1>
          </div>
          <p className="text-white/40 text-[13px] mt-0.5">Set the typeface, size, weight and spacing for your card text</p>
        </div>

        <ProfileCustomizeNav />
      </div>

      <FontsProfileClient user={user} />
    </div>
  );
}
