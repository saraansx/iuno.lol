import { Metadata } from "next";
import HomeClient from "./HomeClient";
import JsonLd from "@/components/seo/JsonLd";
import { HOME_FAQS } from "@/components/home/faq-data";

const TITLE = "iuno.lol - One Link for Your Whole Internet Presence";
const DESCRIPTION =
  "Create your free iuno.lol page - all your links, music player, Discord/Steam/Spotify widgets, animated effects and full theming in one place. Claim iuno.lol/yourname.";
const OG_IMAGE = "/Showcasee.png";

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "iuno.lol",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1672,
        height: 941,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: TITLE }],
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
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <HomeClient />
    </>
  );
}
