import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { isAuthenticated } from "@/lib/auth/session";
import JsonLd from "@/components/seo/JsonLd";
import { HOME_FAQS } from "@/components/home/faq-data";

export const metadata: Metadata = {
  title: {
    absolute: "iuno.lol - One Link for Your Whole Internet Presence",
  },
  description:
    "Create your free iuno.lol page - all your links, music player, Discord/Steam/Spotify widgets, animated effects and full theming in one place. Claim iuno.lol/yourname.",
  alternates: {
    canonical: "/",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default async function HomePage() {
  const isAuth = await isAuthenticated();
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <HomeClient isAuthenticated={isAuth} />
    </>
  );
}
