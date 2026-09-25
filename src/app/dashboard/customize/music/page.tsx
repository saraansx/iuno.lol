import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById, getUserBackgrounds } from "@/lib/features/users/db";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";
import MusicProfileClient from "./MusicProfileClient";

export const metadata: Metadata = {
  title: "Music",
  description: "Add songs to your profile playlist.",
};

export default async function Page() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/signin');
  }

  const user = await getUserById(userId);
  const backgrounds = await getUserBackgrounds(userId);

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
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Music</BreadcrumbPage>
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
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
            <h1 className="text-[20px] font-normal text-white tracking-tight">Music</h1>
          </div>
          <p className="text-white/40 text-[13px] mt-0.5">Add songs to your profile playlist</p>
        </div>
      </div>

      <MusicProfileClient user={user} backgrounds={backgrounds} />
    </div>
  );
}
