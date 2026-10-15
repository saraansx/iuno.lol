import { Metadata } from "next";
import PricingClient from "./PricingClient";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free forever for the core features. Premium is $4.99 once - lifetime access, no subscriptions. Compare plans on iuno.lol.",
  alternates: {
    canonical: "/pricing",
  },
};

export default async function PricingPage() {
  const userId = await getSessionUserId();
  const user = userId ? await getUserById(userId) : null;
  return (
    <PricingClient
      isAuthenticated={!!userId}
      isPremium={!!user?.isPremium}
      hasImageHost={!!user?.hasImageHost}
      hasVerified={!!user?.hasVerified}
      hasDonator={!!user?.hasDonator}
    />
  );
}
