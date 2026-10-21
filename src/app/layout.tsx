import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./tailwind.css";
import { Toaster } from "@/components/ui/toast";
import ConditionalBackground from "@/components/ConditionalBackground";
import AssistantWidget from "@/components/assistant/AssistantWidget";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const comfortaa = localFont({
  src: [{ path: "../../fonts/comfortaa.ttf", weight: "400", style: "normal" }],
  variable: "--font-comfortaa",
  display: "swap",
  preload: false,
});

const caviarDreams = localFont({
  src: [{ path: "../../fonts/caviar-dreams.ttf", weight: "400", style: "normal" }],
  variable: "--font-caviar-dreams",
  display: "swap",
  preload: false,
});

const poppins = localFont({
  src: [
    { path: "../../fonts/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "../../fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `${SITE_CONFIG.name} - %s`,
  },
  description: SITE_CONFIG.description,
  icons: {
    icon: [
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/showcase.jpg",
        width: 1200,
        height: 630,
        alt: "iuno.lol - One Link for Your Whole Internet Presence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/showcase.jpg",
        alt: "iuno.lol - One Link for Your Whole Internet Presence",
      },
    ],
  },
};

const organization = {
  "@type": "Organization",
  "@id": `${SITE_CONFIG.url}/#organization`,
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_CONFIG.url}/Favicon.png`,
    width: 512,
    height: 512,
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organization,
    {
      "@type": "WebSite",
      "@id": `${SITE_CONFIG.url}/#website`,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      description: SITE_CONFIG.description,
      publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${poppins.variable} ${inter.variable} ${comfortaa.variable} ${caviarDreams.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white relative" style={{ fontFamily: "var(--font-comfortaa)" }}>
        <JsonLd data={siteJsonLd} />
        <ConditionalBackground />
        <Toaster />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
        <AssistantWidget />
      </body>
    </html>
  );
}
