import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { profileFontVariables } from "@/lib/profile-fonts";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/signin");
  }

  const user = await getUserById(userId);

  return (
    <div className={`${profileFontVariables} contents`}>
    <DashboardShell
      username={user?.username ?? undefined}
      userId={user?.id}
      avatarUrl={user?.avatarUrl ?? undefined}
      decorationUrl={user?.avatarDecorationUrl ?? undefined}
      decorationHue={user?.avatarDecorationHue ?? 0}
    >
      {children}
    </DashboardShell>
    </div>
  );
}
