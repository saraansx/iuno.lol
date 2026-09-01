import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileCustomizeNav from "@/components/dashboard/ProfileCustomizeNav";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import AboutSectionRow from "./AboutSectionRow";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Section builder",
  description: "Build and arrange the sections of your sectioned profile.",
};

const LAYOUT_HREF = "/dashboard/customize/profile/layout";

function WidgetsNotice() {
  return (
    <div inert className="flex gap-3.5 bg-[#e0a355]/[0.04] border border-[#e0a355]/15 rounded-[16px] px-4 py-3.5">
      <svg className="text-[#e0a355]/70 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[14px] font-normal text-white/90 tracking-tight">
          Widgets section is not managed here
        </span>
        <p className="text-[12.5px] text-white/40">
          Controlled by your widgets section — go to Widgets to edit them.
        </p>
      </div>
    </div>
  );
}

export default async function Page() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/signin');
  }

  const user = await getUserById(userId);
  const isSectioned = user?.profileStructure === "sectioned";
  const sectionRows = [
    <AboutSectionRow
      key="about"
      hidden={user?.aboutSectionEnabled === false}
      title={user?.aboutSectionTitle ?? "About"}
      description={user?.aboutSectionDescription ?? ""}
    />,
    <WidgetsNotice key="widgets" />,
  ];

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
              <BreadcrumbPage className="text-[#609fda] font-normal tracking-tight">Section builder</BreadcrumbPage>
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
              <rect x="3" y="3" width="18" height="5" rx="1.5" />
              <rect x="3" y="11" width="18" height="5" rx="1.5" />
              <rect x="3" y="19" width="18" height="2" rx="1" />
            </svg>
            <h1 className="text-[20px] font-normal text-white tracking-tight">Section builder</h1>
          </div>
          <p className="text-white/40 text-[13px] mt-0.5">Build and arrange the sections of your sectioned profile</p>
        </div>

        <ProfileCustomizeNav />
      </div>

      <div
        className="flex flex-col gap-6 w-full pb-10"
        style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}
      >
        {isSectioned ? (
          <>
            <div className="flex gap-3.5 bg-[#0c0c0c] border border-white/5 rounded-[16px] p-5">
              <svg className="text-[#609fda] shrink-0 mt-px" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[14px] font-normal text-white/90 tracking-tight">
                  Using your layout settings
                </span>
                <p className="text-[13px] text-white/40">
                  Sections use the preset, alignment and profile details from your layout settings — there is nothing separate to configure here.
                </p>
                <Link
                  href={LAYOUT_HREF}
                  className="mt-2.5 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] text-[12.5px] text-white/80 font-normal rounded-xl px-3.5 py-2 transition-colors"
                >
                  Edit layout settings
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[12.5px] font-normal text-white/40 tracking-tight shrink-0">
                Profile sections ({sectionRows.length})
              </span>
              <div className="h-px flex-1 bg-white/5" />
              <button
                type="button"
                disabled
                className="flex items-center gap-2 bg-[#609fda]/20 text-white/40 text-[13px] font-normal rounded-xl px-3.5 py-2 shrink-0 cursor-not-allowed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
                Add section
              </button>
            </div>

            <div className="flex flex-col gap-3">{sectionRows}</div>
          </>
        ) : (
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] py-20 px-8 flex flex-col items-center text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#5b6cf5]/[0.08] border border-[#5b6cf5]/15 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="5" rx="1.5" />
                <rect x="3" y="11" width="18" height="5" rx="1.5" />
                <rect x="3" y="19" width="18" height="2" rx="1" />
              </svg>
            </div>

            <span className="mt-5 text-[15px] font-normal text-white/90 tracking-tight">
              Turn on the sectioned layout first
            </span>
            <p className="mt-1.5 text-[13px] text-white/40 max-w-[380px]">
              Sections split your profile into separate screens. Switch your layout to sectioned and they show up here.
            </p>

            <Link
              href={LAYOUT_HREF}
              className="mt-6 flex items-center gap-2 bg-[#609fda]/20 hover:bg-[#609fda]/30 text-[13px] text-white font-normal rounded-xl px-4 py-2.5 transition-colors"
            >
              Go to layout settings
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      <DashboardProfilePreview user={user} />
    </div>
  );
}
