import { Metadata } from "next";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import GenshinClient from "./GenshinClient";

export const metadata: Metadata = {
  title: "Genshin Impact Profile",
  description: "Configure your Genshin Impact profile widget.",
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
                <Link href="/dashboard/customize/profile" className="text-white/40 hover:text-white tracking-tight">Customize Profile</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/customize/profile/widgets" className="text-white/40 hover:text-white tracking-tight">Widgets</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/10" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium tracking-tight">Genshin Impact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-1 pb-2 w-full pt-2" style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}>
        <h1 className="text-[20px] font-normal text-white tracking-tight">Genshin Impact Profile</h1>
        <p className="text-white/40 text-[13px] mt-0.5">Configure your Genshin Impact profile widget.</p>
      </div>

      <GenshinClient user={user} />
    </div>
  );
}
