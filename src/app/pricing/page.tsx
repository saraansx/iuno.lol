import { Metadata } from "next";
import PricingClient from "./PricingClient";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, free pricing for iuno.lol.",
};

export default async function PricingPage() {
  const isAuth = await isAuthenticated();
  return <PricingClient isAuthenticated={isAuth} />;
}
