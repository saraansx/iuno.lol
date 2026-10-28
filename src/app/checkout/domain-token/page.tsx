import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { DOMAIN_TOKEN_PLAN_TAG } from "@/lib/payments/plans";
import CheckoutClient from "../CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — Custom Domain",
  description: "Buy a custom domain slot on iuno.lol.",
};

export default async function DomainTokenCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ polar?: string }>;
}) {
  const { polar } = await searchParams;
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/signin");
  }

  const user = await getUserById(userId);

  return (
    <CheckoutClient
      isAuthenticated
      email={user?.email ?? null}
      initialSucceeded={polar === "success"}
      product={DOMAIN_TOKEN_PLAN_TAG}
    />
  );
}
