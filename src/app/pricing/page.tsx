import { Metadata } from "next";
import PricingClient from "./PricingClient";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { PREMIUM_PLAN } from "@/lib/payments/plans";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free forever for the core features. Premium is $4.99 once - lifetime access, no subscriptions. Compare plans on iuno.lol.",
  alternates: {
    canonical: "/pricing",
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "iuno.lol Premium",
  description:
    "Lifetime access to iuno.lol Premium - unlimited backgrounds, tracks, widgets, every effect, aliases, tab customization and the Premium badge. One time payment, no subscription.",
  brand: {
    "@type": "Brand",
    name: SITE_CONFIG.name,
  },
  url: `${SITE_CONFIG.url}/pricing`,
  offers: (Object.keys(PREMIUM_PLAN) as (keyof typeof PREMIUM_PLAN)[]).map(
    (currency) => ({
      "@type": "Offer",
      name: `iuno.lol Premium lifetime (${currency})`,
      price: PREMIUM_PLAN[currency].display,
      priceCurrency: currency,
      url: `${SITE_CONFIG.url}/pricing`,
      availability: "https://schema.org/InStock",
    })
  ),
};

export default async function PricingPage() {
  const userId = await getSessionUserId();
  const user = userId ? await getUserById(userId) : null;
  return (
    <>
      <JsonLd data={pricingJsonLd} />
      <PricingClient
        isAuthenticated={!!userId}
        isPremium={!!user?.isPremium}
        hasImageHost={!!user?.hasImageHost}
        hasVerified={!!user?.hasVerified}
        hasDonator={!!user?.hasDonator}
      />
    </>
  );
}
