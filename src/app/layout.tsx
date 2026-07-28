import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto, Outfit, Space_Grotesk, Playfair_Display, Montserrat, DM_Sans, Syne, Oswald, Pacifico, Caveat, Dancing_Script, Indie_Flower, Lobster } from "next/font/google";
import localFont from "next/font/local";
import "./tailwind.css";
import { Toaster } from "@/components/ui/toast";
import SharedBackground from "@/components/SharedBackground";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
const paperNotes = localFont({
  src: [
    {
      path: "../../fonts/papernotes.ttf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-paper-notes",
});
const matchaMint = localFont({
  src: [
    {
      path: "../../fonts/matcha-mint.ttf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-matcha-mint",
});
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" });
const comfortaa = localFont({
  src: [
    {
      path: "../../fonts/comfortaa.ttf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-comfortaa",
});
const elegantBloom = localFont({
  src: [
    {
      path: "../../fonts/elegant-bloom.otf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-elegant-bloom",
});
const caviarDreams = localFont({
  src: [
    {
      path: "../../fonts/caviar-dreams.ttf",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-caviar-dreams",
});
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
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${roboto.variable} ${outfit.variable} ${spaceGrotesk.variable} ${playfair.variable} ${montserrat.variable} ${dmSans.variable} ${syne.variable} ${oswald.variable} ${pacifico.variable} ${caveat.variable} ${paperNotes.variable} ${matchaMint.variable} ${dancingScript.variable} ${comfortaa.variable} ${elegantBloom.variable} ${caviarDreams.variable} ${indieFlower.variable} ${lobster.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white font-poppins relative">
        <SharedBackground />
        <Toaster />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
