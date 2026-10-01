import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { IMAGE_HOST_PLAN_TAG } from "@/lib/payments/plans";
import CheckoutClient from "../CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — Image Host",
  description: "Unlock the iuno.lol Image Host.",
};

export default async function ImageHostCheckoutPage({
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

  if (user?.hasImageHost && polar !== "success") {
    redirect("/dashboard/image-host/overview");
  }

  return (
    <CheckoutClient
      isAuthenticated
      email={user?.email ?? null}
      initialSucceeded={polar === "success"}
      product={IMAGE_HOST_PLAN_TAG}
    />
  );
}
