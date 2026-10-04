import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserAliases, getUserById, userHasPassword } from "@/lib/features/users/db";
import { listPasskeys } from "@/lib/auth/passkeys";
import { isPremiumActive } from "@/lib/premium";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your iuno.lol account.",
};

export default async function SettingsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/signin");
  const [user, aliases, hasPassword, passkeys] = await Promise.all([
    getUserById(userId),
    getUserAliases(userId),
    userHasPassword(userId),
    listPasskeys(userId),
  ]);
  if (!user) redirect("/signin");

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
              <BreadcrumbPage className="text-[#5b6cf5] font-normal tracking-tight">Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <SettingsClient
        initialUsername={user.username}
        initialDisplayName={user.displayName ?? ""}
        initialAliases={{
          aliases: aliases.map((a) => ({ id: a.id, alias: a.alias, createdAt: a.createdAt.toISOString() })),
          tokens: user.aliasTokens ?? 0,
          slots: user.aliasTokens ?? 0,
          premium: isPremiumActive(user),
        }}
        security={{ email: user.email ?? null, emailVerified: Boolean(user.emailVerified), hasPassword,
          twoFactor: Boolean(user.twoFactorEnabledAt),
          usernameLoginEnabled: Boolean(user.usernameLoginEnabled),
          passkeys: passkeys.map((p) => ({
            id: p.id,
            name: p.name,
            createdAt: p.createdAt.toISOString(),
            lastUsedAt: p.lastUsedAt ? p.lastUsedAt.toISOString() : null,
          })),
        }}
        discord={{ connected: Boolean(user.discordId), username: user.discordUsername ?? null }}
      />
    </div>
  );
}
