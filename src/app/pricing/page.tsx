import { Metadata } from "next";
import PricingClient from "./PricingClient";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, free pricing for iuno.lol.",
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
