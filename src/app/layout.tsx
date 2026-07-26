import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto, Outfit, Space_Grotesk, Playfair_Display, Montserrat, DM_Sans, Syne, Oswald, Pacifico, Caveat, Permanent_Marker, Bangers, Dancing_Script, Amatic_SC, Creepster, Shadows_Into_Light, Indie_Flower, Lobster } from "next/font/google";
import localFont from "next/font/local";
import "./tailwind.css";
import { Toaster } from "sonner";
import SharedBackground from "@/components/SharedBackground";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const permanentMarker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-permanent-marker" });
const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" });
const amaticSc = Amatic_SC({ weight: "700", subsets: ["latin"], variable: "--font-amatic-sc" });
const creepster = Creepster({ weight: "400", subsets: ["latin"], variable: "--font-creepster" });
const shadowsIntoLight = Shadows_Into_Light({ weight: "400", subsets: ["latin"], variable: "--font-shadows-into-light" });
const indieFlower = Indie_Flower({ weight: "400", subsets: ["latin"], variable: "--font-indie-flower" });
const lobster = Lobster({ weight: "400", subsets: ["latin"], variable: "--font-lobster" });

const poppins = localFont({
  src: [
    {
      path: "../../fonts/Poppins-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../fonts/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
});

import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `${SITE_CONFIG.name} - %s`,
  },
  description: SITE_CONFIG.description,
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${roboto.variable} ${outfit.variable} ${spaceGrotesk.variable} ${playfair.variable} ${montserrat.variable} ${dmSans.variable} ${syne.variable} ${oswald.variable} ${pacifico.variable} ${caveat.variable} ${permanentMarker.variable} ${bangers.variable} ${dancingScript.variable} ${amaticSc.variable} ${creepster.variable} ${shadowsIntoLight.variable} ${indieFlower.variable} ${lobster.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white font-poppins relative">
        <SharedBackground />
        <Toaster 
          theme="dark" 
          position="top-center"
          toastOptions={{
            style: {
              background: "#111622",
              border: "1px solid rgba(96, 159, 218, 0.3)",
              color: "#e2e8f0",
              padding: "8px 14px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 500,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            },
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
