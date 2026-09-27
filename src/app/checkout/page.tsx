import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Upgrade to iuno.lol Premium.",
};

export default async function CheckoutPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/signin");
  }

  const user = await getUserById(userId);

  if (user?.isPremium) {
    redirect("/dashboard");
  }

  return (
    <CheckoutClient
      isAuthenticated
      email={user?.email ?? null}
    />
  );
}
