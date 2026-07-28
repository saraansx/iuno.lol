import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { CustomizeProfileProvider } from "./CustomizeProfileProvider";

export default async function ProfileCustomizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();
  const user = userId ? await getUserById(userId) : null;

  return (
    <CustomizeProfileProvider initialUser={user}>
      {children}
    </CustomizeProfileProvider>
  );
}
