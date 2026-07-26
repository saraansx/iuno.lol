import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { Metadata } from "next";
import AppearanceProfileClient from "./AppearanceProfileClient";
import ProfileCustomizeNav from "@/components/dashboard/ProfileCustomizeNav";

export const metadata: Metadata = {
  title: "Appearance",
  description: "Appearance profile settings.",
};

export default async function Page() {
  const userId = await getSessionUserId();
  const user = userId ? await getUserById(userId) : null;

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] border-b border-white/4 pb-5 flex-wrap -mx-12 px-12 w-full">
        <span className="text-white/40 tracking-tight">Dashboard</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/10"><path d="m9 18 6-6-6-6"/></svg>
        <span className="text-white/40 tracking-tight">Customize</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/10"><path d="m9 18 6-6-6-6"/></svg>
        <span className="text-white/40 tracking-tight">Profile</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/10"><path d="m9 18 6-6-6-6"/></svg>
        <span className="text-[#609fda] font-normal tracking-tight">Appearance</span>
      </div>

      {/* Page Header & Navigation */}
      <div className="flex flex-col gap-6 pb-2 w-full pt-2" style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}>
        <div>
          <h1 className="text-[20px] font-semibold text-white tracking-tight">Profile Customization</h1>
          <p className="text-white/40 text-[13px] mt-0.5">Customize every aspect of your bio link page</p>
        </div>

        <ProfileCustomizeNav />
      </div>

      <AppearanceProfileClient user={user} />
    </div>
  );
}
