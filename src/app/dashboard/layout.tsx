import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

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
    <DashboardShell
      username={user?.username ?? undefined}
      userId={user?.id}
      avatarUrl={user?.avatarUrl ?? undefined}
      decorationUrl={user?.avatarDecorationUrl ?? undefined}
      decorationHue={user?.avatarDecorationHue ?? 0}
    >
      {children}
    </DashboardShell>
  );
}
