import { Metadata } from "next";
import HomeClient from "./HomeClient";
import JsonLd from "@/components/seo/JsonLd";
import { HOME_FAQS } from "@/components/home/faq-data";
import { inArray, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { FEATURED_USERNAMES, type FeaturedAvatars } from "@/components/home/FeaturedProfiles";

export const revalidate = 600;

async function getFeaturedAvatars(): Promise<FeaturedAvatars> {
  try {
    const rows = await db
      .select({ username: schema.users.username, avatarUrl: schema.userSettings.avatarUrl })
      .from(schema.users)
      .leftJoin(schema.userSettings, eq(schema.userSettings.userId, schema.users.id))
      .where(inArray(schema.users.username, FEATURED_USERNAMES));
    return Object.fromEntries(rows.map((r) => [r.username, r.avatarUrl]));
  } catch (err) {
    console.error("[home] featured avatars failed:", err);
    return {};
  }
}

const TITLE = "iuno.lol - One Link for Your Whole Internet Presence";
const DESCRIPTION =
  "Create your free iuno.lol page - all your links, music player, Discord/Steam/Spotify widgets, animated effects and full theming in one place. Claim iuno.lol/yourname.";
const OG_IMAGE = "/showcase.jpg";

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
        width: 1200,
        height: 630,
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
  const featuredAvatars = await getFeaturedAvatars();
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <HomeClient featuredAvatars={featuredAvatars} />
    </>
  );
}
