import { Metadata } from "next";
import ProfileCustomizeNav from "@/components/dashboard/ProfileCustomizeNav";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById, getUserBackgrounds } from "@/lib/features/users/db";
import ColorsProfileClient from "./ColorsProfileClient";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Colors",
  description: "Colors profile settings.",
};

export default async function Page() {
  const userId = await getSessionUserId();
  const user = userId ? await getUserById(userId) : null;
  const backgrounds = userId ? await getUserBackgrounds(userId) : [];

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
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Colors</BreadcrumbPage>
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
              <circle cx="13.5" cy="6.5" r="1.5" fill="#5b6cf5" stroke="none" />
              <circle cx="17.5" cy="10.5" r="1.5" fill="#5b6cf5" stroke="none" />
              <circle cx="8.5" cy="7.5" r="1.5" fill="#5b6cf5" stroke="none" />
              <circle cx="6.5" cy="12.5" r="1.5" fill="#5b6cf5" stroke="none" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
            </svg>
            <h1 className="text-[20px] font-normal text-white tracking-tight">Color Customization</h1>
          </div>
          <p className="text-white/40 text-[13px] mt-0.5">Customize every aspect of your bio link page</p>
        </div>

        <ProfileCustomizeNav />
      </div>

      <ColorsProfileClient user={user} backgrounds={backgrounds} />
    </div>
  );
}
