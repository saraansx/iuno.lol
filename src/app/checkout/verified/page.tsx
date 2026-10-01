import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { VERIFIED_PLAN_TAG } from "@/lib/payments/plans";
import CheckoutClient from "../CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — Verified",
  description: "Get the iuno.lol Verified badge.",
};

export default async function VerifiedCheckoutPage({
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

  if (user?.hasVerified && polar !== "success") {
    redirect("/dashboard/customize/badges");
  }

  return (
    <CheckoutClient
      isAuthenticated
      email={user?.email ?? null}
      initialSucceeded={polar === "success"}
      product={VERIFIED_PLAN_TAG}
    />
  );
}
